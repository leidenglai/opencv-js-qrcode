function Utils(errorOutputId) {
  this.errorOutput = document.getElementById(errorOutputId);

  this.loadScript = function (url) {
    return new Promise((resolve, reject) => {
      let script = document.createElement("script");
      script.setAttribute("async", "");
      script.setAttribute("type", "text/javascript");
      script.setAttribute("id", "opencvjs");
      script.addEventListener("load", async () => {
        if (cv.getBuildInformation) {
          console.log(cv.getBuildInformation());
          resolve();
        } else {
          // WASM
          if (cv instanceof Promise) {
            cv = await cv;
            console.log(cv.getBuildInformation());
            resolve();
          } else {
            cv["onRuntimeInitialized"] = () => {
              console.log(cv.getBuildInformation());
              resolve();
            };
          }
        }
      });
      script.addEventListener("error", () => {
        reject();
      });
      script.src = url;
      let node = document.getElementsByTagName("script")[0];
      node.parentNode.insertBefore(script, node);
    });
  };

  /**
   * 请求二维码训练模型文件
   */
  this.fetchModelsData = async function (name) {
    // const response = await fetch(`https://static.xxxx.com/common/opencv/models/${name}`, {
    const response = await fetch(`./models/${name}`, {
      method: "GET",
    });
    const data = await response.arrayBuffer();

    return new Uint8Array(data);
  };

  /**
   * 加载图片到canvas
   * 发票的二维码基本都在左上角
   * 为提高效率，只截取出图片二维码的左上角区域放入canvas
   * @param {*} url
   * @param {*} cavansId
   */
  this.loadImageToCanvas = function (url, cavansId) {
    let canvas = document.getElementById(cavansId);
    let ctx = canvas.getContext("2d");
    let img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      const { width, height } = img;
      const isVertical = width < height;
      const crossNum = isVertical ? 3 : 4;
      const verticalNum = isVertical ? 4 : 3;

      canvas.width = width / crossNum;
      canvas.height = height / verticalNum;
      ctx.drawImage(img, isVertical ? width * (2 / 3) : 0, 0, width, height, 0, 0, width, height);
    };
    img.src = url;
  };

  /**
   * canvas转图片
   */
  this.imagedataToImage = function (imagedata) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = imagedata.width;
    canvas.height = imagedata.height;
    ctx.putImageData(imagedata, 0, 0);

    return new Promise((resolve) => {
      const img = new Image();
      img.src = canvas.toDataURL();
      img.onload = () => {
        resolve(img);
      };
    });
  };

  /**
   * 拆分图片坐标
   * @param {*} width 图片宽
   * @param {*} height 图片高
   *
   * @returns 坐标数组 [x,y,width,height][]
   */
  this.segmentationImageCoordinates = function (width, height) {
    const isVertical = width < height;
    const crossNum = isVertical ? 3 : 5;
    const verticalNum = isVertical ? 5 : 3;
    const blockWidth = width / crossNum;
    const blockHeight = height / verticalNum;
    const coordinates = [];

    for (let y = 0; y < verticalNum; y++) {
      for (let x = 0; x < crossNum; x++) {
        const cx = x * blockWidth;
        const cy = y * blockHeight;

        coordinates.push([cx, cy, blockWidth, blockHeight]);
      }
    }

    return coordinates;
  };
}
