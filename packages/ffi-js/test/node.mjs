import fs from 'fs';
import { fontSplit } from '../dist/node/index.mjs';
const inputBuffer = new Uint8Array(
    fs.readFileSync('../demo/public/SmileySans-Oblique.ttf').buffer,
);
for (let index = 0; index < 10; index++) {
    console.time('node');
    fontSplit({
        input: inputBuffer,
        outDir: './dist/font',
    });
    console.timeEnd('node');
    console.log(index);
}
