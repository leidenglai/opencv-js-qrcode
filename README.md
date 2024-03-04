# OpencvQr
## 纯JS识别照片或图片中的二维码
本库的主要特点是：
* 纯前端处理，无须调用后端OCR API等接口；
* 可处理标准正方形的二维码，最重要的是可以处理照片上的二维码；二维码变形、旋转都可以识别；
* 基于opencv 编译后的webassembly版本，编译添加了微信开源的wechat_qrcode，有极高的识别率。


在线测试：https://leidenglai.github.io/opencv-js-qrcode/

**demo源码:  [leidenglai/opencv-js-qrcode · GitHub](https://github.com/leidenglai/opencv-js-qrcode)**

## 加载二维码识别引擎
本库中采用的是自定义编译的opencv库作为继承，添加了三方组件wechat_qrcode微信二维码引擎，并且去掉不需要的库。封装一些基本方法方便使用。

### NPM

``` sh
npm install opencv-qr --save
```


``` javascript
// ES6 import
import OpencvQr from "opencv-qr";

// CommonJS require
const OpencvQr = require("opencv-qr");

// 加载模型文件，模型文件请自行保存在静态目录
const cvQr = new OpencvQr({
  dw: "http://xxx.com/models/detect.caffemodel",
  sw: "http://xxx.com/models/sr.caffemodel",
});

```

### Browser

也可直接在浏览器中使用

``` html
<script src="dist/OpencvQr.js"></script>
<script>
  const cvQr = new OpencvQr({
    dw: "http://xxx.com/models/detect.caffemodel",
    sw: "http://xxx.com/models/sr.caffemodel",
  });
</script>

```


### 使用

OpencvQr暴露一个加载方法和三个使用方法, 支持typescript类型 OpencvQr.d.ts

``` javascript
  // 初始化时需自行加载模型文件，模型文件请自行保存为静态文件，不可编译转换
  const cvQr = new OpencvQr({
    dw: "http://xxx.com/models/detect.caffemodel",
    sw: "http://xxx.com/models/sr.caffemodel",
  });

  // 加载canvas中的图像
  const result = cvQr.load("canvasInput");

  // 返回解析结果字符
  const infos = result?.getInfos();
  // 返回解析的二维码截取图像 ImageData
  const images = result?.getImages();
  // 返回已识别的二维码图像相对于原图的位置信息 坐标和宽高
  const sizes = result?.getSizes();

```


## 浏览器兼容性：
暨WebAssembly兼容性，基本上现代浏览器都是支持的：
<img width="789" alt="CleanShot 2022-05-23 at 17 16 35@2x" src="https://user-images.githubusercontent.com/11383747/169796444-07af908a-48a6-448f-b458-56175ad2576d.png">

