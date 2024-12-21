import { getBinaryFile, getBinName } from './load.js';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
export const saveBinaryToDist = (
    platform: string,
    version: string,
    filePath: string,
    binary: ArrayBuffer,
) => {
    const vPath = new URL('./version', import.meta.url);
    let versionRecord = '';
    try {
        versionRecord = fs.readFileSync(vPath, 'utf-8');
    } catch (e) {}
    const others = versionRecord
        .split('\n')
        .filter((i) => !i.startsWith(platform + '@'));
    fs.writeFileSync(
        fileURLToPath(vPath),
        platform + '@' + version + '\n' + others.join('\n'),
    );
    return fs.writeFileSync(filePath, new Uint8Array(binary));
};

const isBinaryExists = (version: string, fileName: string) => {
    const filePath = new URL('./' + fileName, import.meta.url);
    const versionPath = new URL('./version', import.meta.url);
    let isExists = false;
    try {
        isExists = fs
            .readFileSync(fileURLToPath(versionPath), 'utf-8')
            .includes(
                fileName.replace('libffi-', '').split('.')[0] + '@' + version,
            );
    } catch (e) {
        console.log(e);
    }
    return isExists && fs.existsSync(fileURLToPath(filePath));
};

export async function downloadBinary(
    platform: string,
    version: string,
    force = false,
) {
    const fileName = getBinName(platform);
    if (!force && isBinaryExists(version, fileName))
        return console.log(
            `cn-font-split ${version} ${platform} library -> already exists`,
        );
    const binary = await getBinaryFile(
        platform,
        version,
        process.env.CN_FONT_SPLIT_GH_HOST,
    );
    const ffiPath = new URL('./' + fileName, import.meta.url);
    console.table({
        version,
        platform,
        fileName,
        source: fileURLToPath(ffiPath),
    });
    return saveBinaryToDist(platform, version, fileURLToPath(ffiPath), binary);
}
