// import OpencvQr from "../dist/OpencvQr.js";
import OpencvQr from "../src/OpencvQr";

const cvQr = new OpencvQr({
  dw: "http://127.0.0.1:8081/models/detect.caffemodel",
  sw: "http://127.0.0.1:8081/models/sr.caffemodel",
});

function loadImageToCanvas(url, cavansId) {
  let canvas = document.getElementById(cavansId) as HTMLCanvasElement;
  let ctx = canvas.getContext("2d");
  let img = new Image();

  img.crossOrigin = "anonymous";
  img.onload = function () {
    const { width, height } = img;

    canvas.width = width;
    canvas.height = height;
    ctx?.drawImage(img, 0, 0, width, height);
  };
  img.src = url;
}

function imagedataToImage(imagedata) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = imagedata.width;
  canvas.height = imagedata.height;
  ctx!.putImageData(imagedata, 0, 0);

  var image = new Image();
  image.src = canvas.toDataURL();
  return image;
}

document.getElementById("qrcodeTryIt")?.addEventListener("click", () => {
  const result = cvQr.load("canvasInput");

  const infos = result?.getInfos();
  document.getElementById("status")!.innerText = JSON.stringify(infos);

  const images = result?.getImages();
  // 识别的imageData填充页面
  images?.forEach((imgData) => {
    const image = imagedataToImage(imgData);

    document.getElementById("imageWrap")?.append(image);
  });
});

document.getElementById("qrcodeClear")?.addEventListener("click", () => {
  cvQr.clear();
});

function qrcodeHandleFiles(e) {
  const file = e.target.files[0];
  const qrcodeUrl = URL.createObjectURL(file);

  loadImageToCanvas(qrcodeUrl, "canvasInput");
}
let fileInputElement = document.getElementById("fileInput");
fileInputElement?.addEventListener("change", qrcodeHandleFiles, false);
