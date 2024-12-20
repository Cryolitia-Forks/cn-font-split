// import { fontSplit } from './node/index.js';
import { Command } from 'commander';
import { getCliParams } from './gen/proto.js';
import { matchPlatform } from './load.js';
import fs from 'fs-extra';

function getInstalled() {
    const files = fs.readdirSync(new URL('./', import.meta.url));
    return files.filter((i) => i.startsWith('libffi'));
}

const data = getCliParams(process.argv, (program) => {
    program.addCommand(
        new Command('ls')
            .option('-p, --platform', 'list all platform supported')
            .action(async (data: { platform?: boolean }) => {
                if (data.platform) {
                }
                const { releases } = await fetch(
                    'https://ungh.cc/repos/KonghaYao/cn-font-split/releases',
                ).then((res) => res.json());
                const platformStr = matchPlatform(
                    process.platform,
                    process.arch,
                    () => false,
                );
                console.log('Your platform: ', platformStr);
                console.table(
                    releases
                        .filter((i: any) => !i.draft && !i.prerelease)
                        .map((i: any) => {
                            // console.log(i.assets);
                            const supportPlatforms = (i.assets || [])
                                .map((i: any) => {
                                    return i.downloadUrl
                                        .split('/')
                                        .at(-1)
                                        .split('.')[0];
                                })
                                .filter((i: any) => i.startsWith('libffi-'))
                                .map((i: any) => {
                                    return i.slice(7);
                                });

                            return {
                                isSupport: supportPlatforms.includes(
                                    platformStr,
                                )
                                    ? '✅'
                                    : ' ',
                                version: i.tag,
                                publishedAt: new Date(
                                    i.publishedAt,
                                ).toLocaleString(),
                                platform: supportPlatforms.length,
                            };
                        }),
                );
            }),
    );
});
// await fontSplit(data.opts());
