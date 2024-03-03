# opencv-js-qrcode
# 纯JS识别照片或图片中的二维码
**场景**： 最近在做一个功能，通过识别发票照片获取发票数据用以匹配开票数据存档。
在搜索了各种库踩了一堆坑后，发现微信开源过他们的二维码扫码引擎c++版本，一阵折腾后编译出js版本，整理一下分享出来。本文介绍的方法主要的特点是：
* 纯前端处理，无须调用后端OCR API等接口；
* 可处理标准正方形的二维码，最重要的是可以处理照片上的二维码；二维码变形、旋转都可以识别；
* 基于opencv 编译后的webassembly版本，编译添加了微信开源的wechat_qrcode，有极高的识别率。


在线测试（使用发票照片测试）：https://leidenglai.github.io/opencv-js-qrcode/

**demo源码:  [leidenglai/opencv-js-qrcode · GitHub](https://github.com/leidenglai/opencv-js-qrcode)**

## 加载二维码识别引擎
本文中采用的是自定义编译的opencv库，添加了三方组件wechat_qrcode微信二维码引擎，并且去掉不需要的库。
开始找了很多”强大的二维码识别库“，结果发现基本都不识别照片，或者失败率低，只能识别标准的qrcode。后来发现c++的opencv并且可编译为wsam版本。由于没有任何c++基础，在将wechat_qrcode编译进opencv时异常痛苦，好在后来找到一篇blog：编译微信二维码引擎到webAssembly实践 | 虚幻 ，感谢qwertyyb。

在编译好OpenCV后，导出opencv.js，文件比较大进过优化大约有5
M，所以使用时需要异步加载。opencv加载后就能通过window.cv调用到opencv的相关方法；此时并不意味着我们能正常运行使用了，因为我们还需要加载二维码扫码引擎的模型文件：
``` javascript
async function loadModels() {
  const detect_proto = "detect.prototxt";
  const detect_weight = "detect.caffemodel";
  const sr_proto = "sr.prototxt";
  const sr_weight = "sr.caffemodel";

  if (qrcode_detector != undefined) {
    updateStatus("Model Existed");
  } else {
    const dp = await utils.fetchModelsData(detect_proto);
    const dw = await utils.fetchModelsData(detect_weight);
    const sp = await utils.fetchModelsData(sr_proto);
    const sw = await utils.fetchModelsData(sr_weight);

    cv.FS_createDataFile("/", "detect.prototxt", dp, true, false, false);
    cv.FS_createDataFile("/", "detect.caffemodel", dw, true, false, false);
    cv.FS_createDataFile("/", "sr.prototxt", sp, true, false, false);
    cv.FS_createDataFile("/", "sr.caffemodel", sw, true, false, false);

    qrcode_detector = new cv.wechat_qrcode_WeChatQRCode(
      "detect.prototxt",
      "detect.caffemodel",
      "sr.prototxt",
      "sr.caffemodel"
    );
    updateStatus("OpenCV Model Created");
  }
}
```

这些文件为wechat_qrcode引擎的 CNN models，Detector model 和 Super scale model。将模型文件加载成功后转换为 `Uint8Array` 加载到引擎中，然后调用`new cv.wechat_qrcode_WeChatQRCode( “detect.prototxt”,  “detect.caffemodel”, “sr.prototxt”, “sr.caffemodel” )`实例化返回引擎实例。
官方model文件 [GitHub - WeChatCV/opencv_3rdparty: OpenCV - 3rdparty](https://github.com/WeChatCV/opencv_3rdparty/tree/wechat_qrcode)

作为对比，demo中添加了git上star比较多的jsqr库一同对照测试。

## 识别二维码
因为demo特定需求，发票二维码基本在左上角，所以在canvas加载图片时只截取左上角图片，提高引擎识别效率。
<img width="562" alt="CleanShot 2022-05-23 at 17 24 28@2x" src="https://user-images.githubusercontent.com/11383747/169796294-993433c3-3e97-46a9-8651-8fd76152ca27.png">

OpenCV识别结果：
![CleanShot 2022-05-23 at 17 26 12@2x](https://user-images.githubusercontent.com/11383747/169796337-7ba2a129-b357-41b8-a8a9-20484a9b30c8.png)
将二维码信息和二维码区域都正确的处理，OpenCV耗时: 224.42822265625 ms。

而jsqr是处理不了这样的图片的。


**识别旋转的二维码**
![CleanShot 2022-05-23 at 17 28 48@2x](https://user-images.githubusercontent.com/11383747/169796380-f85584a5-b8a9-45ca-94ff-80dabc786225.png)
照片被旋转了90度且不太清晰，同样也被正确的处理，OpenCV耗时: 169.523193359375 ms。

jsqr也不能处理这样的图片。



**电子二维码识别：**
![CleanShot 2022-05-23 at 17 32 11@2x](https://user-images.githubusercontent.com/11383747/169796414-ae279015-dc5e-42f1-af7b-6b085a2b22f8.png)
电子版的发票图片都正确的识别了；OpenCV耗时: 165.333984375 ms，QRjs耗时: 44.613037109375 ms。不过QRjs的效率相对会高一些。


## 浏览器兼容性：
暨WebAssembly兼容性，基本上现代浏览器都是支持的：
<img width="789" alt="CleanShot 2022-05-23 at 17 16 35@2x" src="https://user-images.githubusercontent.com/11383747/169796444-07af908a-48a6-448f-b458-56175ad2576d.png">

## 总结
OpenCV因为需要加入wechat_qrcode组件，所以必须使用自定义编译。需要在本地搭建c++的编译环境，是前端基本不曾涉足的领域，相对较为繁琐，也会有一些困难，但这也让前端具备了更强大的本领，由于WebAssembly的存在，前端也有了更多的可能。

总之，由于前端越强大，我们能做的事也越多，挑战也会越大，大家共勉。

## 参考
[编译微信二维码引擎到webAssembly实践 | 虚幻](https://qwertyyb.github.io/2021/06/19/%E7%BC%96%E8%AF%91%E5%BE%AE%E4%BF%A1%E4%BA%8C%E7%BB%B4%E7%A0%81%E5%BC%95%E6%93%8E%E5%88%B0webAssembly%E5%AE%9E%E8%B7%B5/) 
OpenCV: https://github.com/opencv/opencv
OpenCV’s contrib: https://github.com/opencv/opencv_contrib



