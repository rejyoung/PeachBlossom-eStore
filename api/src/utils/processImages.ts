import { fileTypeFromBuffer } from "file-type";
import { uploadFile } from "../services/s3Service.js";
import sharp from "sharp";

/**
 * @description A function for processing multer-uploaded image files.
 * Converts an image to webp format if necessary and creates multiple sizes of the image for use in responsive design.
 */
const processImages = async (
    images: Array<{ fileContent: Buffer; fileName: string; mimeType: string }>
) => {
    const sizes = [140, 300, 450, 600, 960, 1024];
    return await Promise.all(
        images.map(async (image) => {
            const { fileContent, fileName, mimeType } = image;
            const fileType = await fileTypeFromBuffer(fileContent);
            let fileMimeType: string = mimeType;
            if (fileType) {
                const { mime } = fileType;
                fileMimeType = mime;
            }
            try {
                for (const size of sizes) {
                    let processedImageBuffer;
                    const metadata = await sharp(fileContent).metadata();

                    if (
                        // If the file does not match the size or the format, modify both
                        fileMimeType !== "image/webp" &&
                        metadata.width !== size
                    ) {
                        processedImageBuffer = await sharp(fileContent)
                            .resize({ width: size })
                            .toFormat("webp")
                            .toBuffer();
                    } else if (
                        // If the file does not match the format, reformat
                        fileMimeType !== "image/webp" &&
                        metadata.width === size
                    ) {
                        processedImageBuffer = await sharp(fileContent)
                            .toFormat("webp")
                            .toBuffer();
                    } else if (
                        // If the file does not match the size, resize
                        fileMimeType === "image/webp" &&
                        metadata.width !== size
                    ) {
                        processedImageBuffer = await sharp(fileContent)
                            .resize({ width: size })
                            .toBuffer();
                    } else {
                        // Add the image as is
                        processedImageBuffer = fileContent;
                    }
                    const specificFileName = `${fileName}_${size}.webp`;
                    await uploadFile(
                        processedImageBuffer,
                        specificFileName,
                        "image/webp"
                    );
                }
                return `${process.env.CLOUDFRONT_DOMAIN}/${fileName}`; // Base URL of the uploaded image
            } catch (error) {
                console.error(`Error processing image: ${error}`);
                throw error;
            }
        })
    );
};

export default processImages;
