import { 
    rotate,
    distance,
} from "../math.js";


const add_spikewheel = (s, center, count = 18, radius = 0.025) => {
    let angle = 1.0 / count 
    let base_length = radius * Math.sin(Math.PI * angle) * 2
    let p1 = {
        x: center.x,
        y: center.y + radius,
    }
    const spike_l = base_length*0.5
    const spike_l2 = base_length*0.8
    let pb_1 = {
        x: center.x,
        y: center.y + radius + spike_l,
    }
    let cidx = s.add_node(center.x, center.y, false)
    // let idx1 = s.add_node(p1.x, p1.y, false)
    let idx1 = null
    let idx2 = null
    let idx2b = null
    let nids = []
    // let idx0 = idx1
    let link_strength = 1.25
    let link_damping = 1.125
    let link_2_strength = 1.5
    let link_2_damping = 0.5
    let clink_strength = 0.5
    let clink_damping = 1.0

    let link_strength_3 = 1.5
    let link_damping_3 = 10.1


    let c_ = 0 
    let link_idxs_1 = []
    let link_idxs_2 = []
    while (c_ < count ) {
        let p2 = rotate(p1, center, angle)
        let pb_2 = rotate(pb_1, center, angle)
        if (c_ == 0) {
            pb_2 = rotate(pb_1, center, angle * 0.5)
        }
        idx2 = s.add_node(p2.x, p2.y, false)
        idx2b = s.add_node(pb_2.x, pb_2.y, false)
        nids.push(idx2)
        nids.push(idx2b)
        if (idx1) {
            link_idxs_1.push(s.add_link(idx1, idx2, base_length,link_strength, link_damping));
            link_idxs_2.push(s.add_link(cidx, idx1, radius, link_2_strength, link_2_damping));
            s.add_clink(idx1, cidx, idx2, angle, clink_strength, clink_damping);

            s.add_link(idx1, idx2b, spike_l2, link_strength_3, link_damping_3)
            s.add_link(idx2, idx2b, spike_l2, link_strength_3, link_damping_3)
        }
        p1.x = p2.x
        p1.y = p2.y
        pb_1.x = pb_2.x
        pb_1.y = pb_2.y
        idx1 = idx2
        c_ += 1
    } 
    idx2 = nids[0]
    idx2b = nids[1]
    link_idxs_1.push(s.add_link(idx1, idx2, base_length,link_strength, link_damping));
    link_idxs_2.push(s.add_link(cidx, idx1, radius, link_2_strength, link_2_damping));
    s.add_clink(idx1, cidx, idx2, angle, clink_strength, clink_damping);
    s.add_link(idx1, idx2b, spike_l2, link_strength_3, link_damping_3)
    s.add_link(idx2, idx2b, spike_l2, link_strength_3, link_damping_3)
    return { 
        cidx: cidx,
        link_idxs_1: link_idxs_1,
        link_idxs_2: link_idxs_2,
        nids: nids,
    }
}


export {
    add_spikewheel,
}
