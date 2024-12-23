import fs from 'fs';
import { fontSplit } from '../dist/node/index.js'
const inputBuffer = new Uint8Array(fs.readFileSync("../demo/public/SmileySans-Oblique.ttf").buffer);
for (let index = 0; index < 100; index++) {
    console.time("node")
    fontSplit({
        input: inputBuffer,
        outDir: "./dist/font"
        ,
    })
    console.timeEnd("node")
}