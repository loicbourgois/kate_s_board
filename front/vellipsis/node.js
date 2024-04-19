const node = (view, idx, node_size) => {
    const i = idx * node_size;
    return {
        p: {
            x: view.getFloat64(i, true),
            y: view.getFloat64(i+8, true),
        },
        p2: {
            x: ( view.getFloat64(i, true) + view.getFloat64(i+16, true) ) * 0.5,
            y: ( view.getFloat64(i+8, true) + view.getFloat64(i+24, true) ) * 0.5,
        },
        pp: {
            x: view.getFloat64(i+16, true),
            y: view.getFloat64(i+24, true),
        },
        dp: {
            x: view.getFloat64(i+8*4, true),
            y: view.getFloat64(i+8*5, true),
        },
        dv: {
            x: view.getFloat64(i+8*6, true),
            y: view.getFloat64(i+8*7, true),
        },
        v: {
            x: view.getFloat64(i+8*8, true),
            y: view.getFloat64(i+8*9, true),
        },
        direction: {
            x: view.getFloat64(i+8*10, true),
            y: view.getFloat64(i+8*11, true),
        },
        m: view.getFloat64(i+8*13, true),
        turbo_max_speed: view.getFloat64(i+8*14, true),
        turbo_rate: view.getFloat64(i+8*15, true),
        z: view.getUint32(i+8*16, true),
        idx: view.getUint32(i+8*16+4, true),
        fixed: view.getUint32(i+8*17, true),
    }
}

export {
    node,
}
