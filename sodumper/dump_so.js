function safeDump(libName) {
    const module = Process.findModuleByName(libName);
    if (!module) {
        console.error(`module ${libName} not found.`);
        return;
    }
    console.log(` dumping ${libName} [${module.base} - ${module.base.add(module.size)}]`);
    const outBuffer = Memory.alloc(module.size);
    Process.enumerateRanges('---').forEach(range => {
        if (range.base.compare(module.base) >= 0 && 
            range.base.add(range.size).compare(module.base.add(module.size)) <= 0) {
            
            console.log(`read section: ${range.base} | size: ${range.size} | access: ${range.protection}`);
            
            try {
                if (range.protection.indexOf('r') !== -1) {
                    Memory.copy(outBuffer.add(range.base.sub(module.base)), range.base, range.size);
                } else {
                    console.warn(`skip, can't read: ${range.base}`);
                }
            } catch (e) {
                console.error(`error ${range.base}: ${e.message}`);
            }
        }
    });
    const path = `/sdcard/Download/${libName}_dumped.so`;
    const file = new File(path, "wb");
    file.write(outBuffer.readByteArray(module.size));
    file.flush();
    file.close();
    console.log(`\n dump saved: ${path}`);
}

setImmediate(() => {
    safeDump("name");
});