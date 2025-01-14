await import('https://deno.land/x/xhr@0.3.0/mod.ts');
try {
    (globalThis as any).location = {
        origin: '/',
        toString() {
            return;
        },
    };
} catch (e) {}

globalThis.process?.versions?.node &&
// @ts-ignore
    (globalThis.process.versions.node = null);
globalThis.window = globalThis.window || {
    navigator: globalThis.navigator,
};
globalThis.document = globalThis.document || {
    nodeType: 8,
};
try {
    const { mockXHR } = await import('./XHR/mockXHR');

    const { fileURLToPath } = await import(
        'https://deno.land/std@0.170.0/node/url.ts'
    );
    // 让 XHR 在访问 fileURI 的时候转化为本地文件
    const cache = new Map<string, Uint8Array>();
    mockXHR({
        // 所有的 fetch 函数都会发送到这里
        proxy({ headers, body, method, url }) {
            if (url.startsWith('file://')) {
                const path = fileURLToPath(url);
                return (async () => {
                    const item = cache.has(path)
                        ? cache.get(path)
                        : await Deno.readFile(path);
                    if (!item) throw new Error('mockXHR 获取数据失败 ' + url);
                    cache.set(path, item);
                    // console.log(path, item);
                    // console.log(item);
                    return new Response(item, {
                        status: 200,
                        headers: { 'content-type': 'application/wasm' },
                    });
                })();
            }
        },
        silent: true,
    });
} catch (e) {}

export {};
