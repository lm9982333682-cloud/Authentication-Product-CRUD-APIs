import ImageKit, { toFile } from "@imagekit/nodejs";
import config from "../config/config.js";

const client = new ImageKit({
    privateKey: config.IMAGEKIT_PRICATE_KEY,
});

const uploadFile = async ({ buffer, fileName }) => {
    const response = await client.files.upload({
        file: await toFile(buffer, fileName),
        fileName: fileName,
        folder: "Assignment15",
    });

    return response;
};

export default uploadFile;