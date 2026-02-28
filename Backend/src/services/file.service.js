import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

export const saveFileLocally = async (file) => {

    const ext = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return filePath;
};