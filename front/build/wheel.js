import { 
    rotate,
    distance,
} from "../math.js";


const add_wheel = (s, center, count = 18, radius = 0.025) => {
    let p1 = {
        x: center.x,
        y: center.y + radius,
    }
    let angle = 1.0 / count 
    let angle_rad = 2*Math.PI * angle
    // let base_length = 2 * radius * Math.cos(angle_rad/2)
    let base_length = radius * Math.sin(Math.PI * angle) * 2
    let cidx = s.add_node(center.x, center.y, false)
    let idx1 = s.add_node(p1.x, p1.y, false)
    let nids = [idx1]
    let idx0 = idx1
    let link_strength = 0.125
    let link_damping = 1.125
    let link_2_strength = 1.5
    let link_2_damping = 0.5
    let clink_strength = 0.5
    let clink_damping = 10.0
    let c_ = 0 
    let link_idxs_1 = []
    let link_idxs_2 = []
    while (c_ < count - 1) {
        let p2 = rotate(p1, center, angle)
        let idx2 = s.add_node(p2.x, p2.y, false)
        nids.push(idx2)
        link_idxs_1.push(s.add_link(idx1, idx2, base_length,link_strength, link_damping));
        link_idxs_2.push(s.add_link(cidx, idx1, radius, link_2_strength, link_2_damping));
        s.add_clink(idx1, cidx, idx2, angle, clink_strength, clink_damping);
        p1.x = p2.x
        p1.y = p2.y
        idx1 = idx2
        c_ += 1
    } 
    link_idxs_1.push(s.add_link(idx1, idx0, base_length, link_strength, link_damping));
    link_idxs_2.push(s.add_link(cidx, idx1, radius, link_2_strength, link_2_damping));
    s.add_clink(idx1, cidx, idx0, angle, clink_strength, clink_damping);
    return { 
        cidx: cidx,
        link_idxs_1: link_idxs_1,
        link_idxs_2: link_idxs_2,
        nids: nids,
    }
}


export {
    add_wheel,
}
