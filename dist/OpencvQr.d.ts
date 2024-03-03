/** Canvas元素Id */
type CanvasElementId = string;
declare class OpencvQr {
    /** 图像解析 */
    private qrImage;
    private qrVec;
    /** 识别结果 */
    private qrRes;
    /** 识别结果数量 */
    qrSize: number;
    private qrcode_detector?;
    cv?: any;
    ready: Promise<void>;
    constructor(models: {
        /** detect.caffemodel模型文件地址 */
        dw: string;
        /** sr.caffemodel模型文件地址 */
        sw: string;
    });
    init(cv: any, models: any): Promise<void>;
    private string2ArrayBuffer;
    private res2ArrayBuffer;
    private getImageData;
    private checkInit;
    /**
     * 加载图片
     * @param imageData canvasDom Id或者Canvas元素或者Image元素或者ImageData
     * @returns
     */
    load(imageData: CanvasElementId | HTMLCanvasElement | HTMLImageElement | ImageData): this | undefined;
    /**
     * 返回已识别的二维码信息
     */
    getInfos(): string[];
    /**
     * 返回已识别的二维码图像信息
     */
    getImages(): ImageData[];
    /**
     * 返回已识别的二维码图像相对于原图的位置信息 坐标和宽高
     */
    getSizes(): {
        x: number;
        y: number;
        w: number;
        h: number;
    }[];
}
export default OpencvQr;
