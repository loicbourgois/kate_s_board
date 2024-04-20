import { node } from "./node.js";


const link = (link_view, idx, link_size, node_view, node_size) => {
    const i = idx * link_size;
    return {
        idx: idx,
        l: link_view.getFloat64(i, true),
        s: link_view.getFloat64(i+8, true),
        damping: link_view.getFloat64(i+8*2, true),
        stress: link_view.getFloat64(i+8*3, true),
        a: node(node_view, link_view.getUint32(i+8*4, true), node_size),
        b: node(node_view, link_view.getUint32(i+8*4+4, true), node_size),
        uid: link_view.getUint32(i+8*5, true),
        active: link_view.getUint32(i+8*5+4, true),
    }
}

export {
    link,
}