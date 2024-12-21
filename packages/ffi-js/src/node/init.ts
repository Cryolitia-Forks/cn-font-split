import { isMusl } from './isMusl.js';
import { getLatestVersion, matchPlatform } from '../load.js';
import { downloadBinary } from '../download.js';

async function main() {
    const version = (await getLatestVersion()).tag;
    let platform = process.env.CN_FONT_SPLIT_PLATFORM;
    if (!platform)
        platform = matchPlatform(process.platform, process.arch, isMusl);
    console.log(
        `cn-font-split ${version} ${platform} library downloading -> ${platform}`,
    );
    return downloadBinary(platform, version);
}
main();
