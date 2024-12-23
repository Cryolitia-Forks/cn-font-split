import path from 'path';
import { FontSplitProps } from '../interface.js';
import { getBinName, matchPlatform } from '../load.js';
import { isMusl } from './isMusl.js';
export * from '../interface.js';
import ffi, {
    arrayConstructor,
    createPointer,
    DataType,
    funcConstructor,
    unwrapPointer,
    open,
    freePointer,
    PointerType,
} from 'ffi-rs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createAPI } from '../createAPI.js';

// @ts-ignore 获取当前模块的 URL
const __filename = fileURLToPath(import.meta.url);

// 获取当前模块所在的目录
const __dirname = dirname(__filename);

let binPath = process.env.CN_FONT_SPLIT_BIN;
if (!binPath) {
    binPath = path.resolve(
        __dirname,
        '../' +
            getBinName(matchPlatform(process.platform, process.arch, isMusl)),
    );
    // throw new Error('CN_FONT_SPLIT_BIN is undefined!');
}

class FFI {
    opened = false;
    open() {
        if (this.opened) return;
        this.opened = false;
        open({
            library: 'libffi', // key
            path: binPath!, // path
        });
        this.opened = true;
    }
    pointers: any[] = [];
    run(buffer: Uint8Array, length: number, cb: any) {
        this.open();
        const main = ffi.load({
            library: 'libffi',
            funcName: 'font_split',
            retType: DataType.Void,
            paramsType: [
                arrayConstructor({
                    type: DataType.U8Array,
                    length,
                }),
                DataType.U64,
                DataType.External,
            ],
            paramsValue: [buffer, length, unwrapPointer(cb)[0]],
        });
        this.pointers.push(cb);
    }
    finally() {
        for (const element of this.pointers) {
            freePointer({
                paramsType: [
                    funcConstructor({
                        paramsType: [
                            arrayConstructor({
                                type: DataType.U8Array,
                                length: 1024 * 1024,
                            }),
                            DataType.U64,
                        ],
                        retType: DataType.Void,
                    }),
                ],
                pointerType: PointerType.RsPointer,
                paramsValue: element,
            });
        }
        this.pointers = [];
    }
}

function createCallback(cb: (res: Uint8Array) => void): any {
    const func = (buffer: Uint8Array, length: number) => {
        cb(buffer.slice(0, length));
    };
    return createPointer({
        paramsType: [
            funcConstructor({
                paramsType: [
                    arrayConstructor({
                        type: DataType.U8Array,
                        length: 1024 * 1024,
                    }),
                    DataType.U64,
                ],
                retType: DataType.Void,
            }),
        ],
        paramsValue: [func],
    });
}
const binding = new FFI();
export const fontSplit = createAPI(
    binding.run.bind(binding),
    createCallback,
    binding.finally.bind(binding),
);
