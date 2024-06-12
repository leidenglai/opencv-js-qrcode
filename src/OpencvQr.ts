import detectPrototxt from "../models/detect.prototxt";
import spPrototxt from "../models/sr.prototxt";
import * as opencv from "../libs/opencv.js";

/** Canvas元素Id */
type CanvasElementId = string;

class OpencvQr {
  /** 图像解析 */
  private qrImage;
  private qrVec;
  /** 识别结果 */
  private qrRes;
  /** 识别结果数量 */
  public qrSize = 0;

  private qrcode_detector?;
  public cv?;
  public ready: Promise<void>;

  constructor(models: {
    /** detect.caffemodel模型文件地址 */
    dw: string;
    /** sr.caffemodel模型文件地址 */
    sw: string;
  }) {
    const ocv: any = opencv;

    if (ocv.getBuildInformation) {
      console.log(ocv.getBuildInformation());
    }

    this.ready = this.init(ocv, models);
  }

  async init(cv, models) {
    // WASM
    if (cv instanceof Promise) {
      cv = await cv;
      console.log(cv.getBuildInformation());
    } else {
      cv["onRuntimeInitialized"] = () => {
        console.log(cv.getBuildInformation());
      };
    }

    this.cv = cv;

    const detect_proto = "detect.prototxt";
    const detect_weight = "detect.caffemodel";
    const sr_proto = "sr.prototxt";
    const sr_weight = "sr.caffemodel";

    const dwRes = await fetch(new URL(models.dw, import.meta.url));
    const swRes = await fetch(new URL(models.sw, import.meta.url));

    const [dp, dw, sp, sw] = await Promise.all([
      this.string2ArrayBuffer(detectPrototxt),
      this.res2ArrayBuffer(dwRes),
      this.string2ArrayBuffer(spPrototxt),
      this.res2ArrayBuffer(swRes),
    ]);

    this.cv.FS_createDataFile("/", detect_proto, dp, true, false, false);
    this.cv.FS_createDataFile("/", detect_weight, dw, true, false, false);
    this.cv.FS_createDataFile("/", sr_proto, sp, true, false, false);
    this.cv.FS_createDataFile("/", sr_weight, sw, true, false, false);

    this.qrcode_detector = new this.cv.wechat_qrcode_WeChatQRCode(detect_proto, detect_weight, sr_proto, sr_weight);
  }

  private async string2ArrayBuffer(str: string) {
    const b = new Blob([str]);
    const f = new FileReader();
    return new Promise((resolve) => {
      f.onload = (e) => {
        if (e.target) {
          const unit8 = new Uint8Array(e.target.result as ArrayBuffer);
          resolve(unit8);
        }
      };
      f.readAsArrayBuffer(b);
    });
  }

  private async res2ArrayBuffer(response: Response) {
    const data = await response.arrayBuffer();

    return new Uint8Array(data);
  }

  private getImageData(points) {
    const x = points.floatAt(0);
    const y = points.floatAt(1);
    const width = points.floatAt(4) - points.floatAt(0);
    const height = points.floatAt(5) - points.floatAt(1);
    const rect = new this.cv.Rect(x, y, width, height);
    const dst = this.qrImage.roi(rect);
    const img = new this.cv.Mat();
    const depth = dst.type() % 8;
    const scale = depth <= this.cv.CV_8S ? 1 : depth <= this.cv.CV_32S ? 1 / 256 : 255;
    const shift = depth === this.cv.CV_8S || depth === this.cv.CV_16S ? 128 : 0;

    dst.convertTo(img, this.cv.CV_8U, scale, shift);
    switch (img.type()) {
      case this.cv.CV_8UC1:
        this.cv.cvtColor(img, img, this.cv.COLOR_GRAY2RGBA);
        break;
      case this.cv.CV_8UC3:
        this.cv.cvtColor(img, img, this.cv.COLOR_RGB2RGBA);
        break;
      case this.cv.CV_8UC4:
        break;
      default:
        throw new Error("Bad number of channels (Source image must have 1, 3 or 4 channels)");
    }

    const imgData = new ImageData(new Uint8ClampedArray(img.data), img.cols, img.rows);

    img.delete();

    return imgData;
  }

  private checkInit() {
    if (!this.cv || !this.qrRes) {
      throw Error("请先调用load方法加载图片");
    }
  }

  /**
   * 加载图片
   * @param imageData canvasDom Id或者Canvas元素或者Image元素或者ImageData
   * @returns
   */
  load(imageData: CanvasElementId | HTMLCanvasElement | HTMLImageElement | ImageData) {
    if (!this.cv) return;
    this.qrImage = imageData instanceof ImageData ? this.cv.matFromImageData(imageData) : this.cv.imread(imageData);

    this.qrVec = new this.cv.MatVector();
    this.qrRes = this.qrcode_detector.detectAndDecode(this.qrImage, this.qrVec);
    this.qrSize = this.qrRes.size();

    return this;
  }

  /**
   * 返回已识别的二维码信息
   */
  getInfos() {
    this.checkInit();
    const result: string[] = [];
    for (let i = 0; i < this.qrSize; i++) {
      result.push(this.qrRes.get(i));
    }

    return result;
  }

  /**
   * 返回已识别的二维码图像信息
   */
  getImages() {
    this.checkInit();

    const result: ImageData[] = [];
    for (let i = 0; i < this.qrSize; i++) {
      const points = this.qrVec.get(i);

      result.push(this.getImageData(points));
    }

    return result;
  }

  /**
   * 返回已识别的二维码图像相对于原图的位置信息 坐标和宽高
   */
  getSizes() {
    this.checkInit();

    const result: { x: number; y: number; w: number; h: number }[] = [];
    for (let i = 0; i < this.qrSize; i++) {
      const points = this.qrVec.get(i);

      const x = points.floatAt(0);
      const y = points.floatAt(1);
      const w = points.floatAt(4) - points.floatAt(0);
      const h = points.floatAt(5) - points.floatAt(1);

      result.push({ x, y, w, h });
    }

    return result;
  }

  /**
   * 清理加载数据，释放内存
   */
  clear() {
    this.qrVec?.delete();
    this.qrRes?.delete();
    this.qrImage?.delete();

    this.qrVec = undefined;
    this.qrRes = undefined;
    this.qrImage = undefined;
  }
}

export default OpencvQr;
