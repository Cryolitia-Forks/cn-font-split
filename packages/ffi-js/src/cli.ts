#!/usr/bin/env node
import { Command } from 'commander';
import { getCliParams } from './gen/proto.js';
import { getAllVersions, getVersionBinary, matchPlatform } from './load.js';
import fs from 'fs-extra';
import { downloadBinary } from './download.js';

getCliParams(process.argv, (program, run) => {
    run.action(async (data) => {
        let fontSplit;
        if (process.versions.bun) {
            fontSplit = (await import('./bun/index.js')).fontSplit;
        } else {
            fontSplit = (await import('./node/index.js')).fontSplit;
        }
        await fontSplit(data);
    });
    program.addCommand(createLs()).addCommand(createInstall());
});

function createInstall() {
    return new Command('install')
        .description('install binary deps')
        .arguments('target')
        .alias('i')
        .option('-f, --force', 'force fetch binary from source')
        .action(async (target, data: { force?: boolean }) => {
            let [platform, version] = target.split('@');
            if (platform === 'default')
                platform = matchPlatform(
                    process.platform,
                    process.arch,
                    () => false,
                );
            const release = await getVersionBinary(version);
            if (!release) throw new Error(`can't find ${target}`);
            await downloadBinary(platform, release.tag, data.force);
        });
}

function createLs() {
    return new Command('ls')
        .description('list all info from local and source')
        .action(async (data) => {
            const releases = await getAllVersions();
            const platformStr = matchPlatform(
                process.platform,
                process.arch,
                () => false,
            );
            console.log('\nYour platform: \n ✅', platformStr);
            console.log(
                '\nInstalled Binary: \n' +
                    getInstalled()
                        .map((i) => ' ✅' + i)
                        .join('\n'),
            );
            console.table(
                releases
                    .slice(0, 10)
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
                            isSupport: supportPlatforms.includes(platformStr)
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
            console.log(import.meta.url);
        });
}

function getInstalled() {
    const files = fs.readdirSync(new URL('./', import.meta.url));
    const bins = files.filter((i) => i.startsWith('libffi'));
    let v = '';
    try {
        fs.readFileSync(new URL('./version', import.meta.url), 'utf-8');
    } catch (e) {
        // 不做任何事情
    }
    const versionMap = v
        .split('\n')
        .map((i) => i.split('@') as [string, string]);

    return bins.map((i) => {
        return [
            i,
            versionMap.find((v) => i.includes(v[0]))?.[1] ?? 'unknown',
        ].join('\t');
    });
}
