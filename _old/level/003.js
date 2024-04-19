import { 
    rotate,
    distance,
} from "../math.js";


const add_wheel = (s, center) => {
    let count = 9
    let side_length = 0.02
    let p1 = {
        x: center.x,
        y: center.y + side_length,
    }
    let angle = 1.0 / count 
    let angle_rad = 2*Math.PI * angle
    let base_length = 2 * side_length * Math.cos(angle_rad/2)
    let cidx = s.add_node(center.x, center.y, false)
    let idx1 = s.add_node(p1.x, p1.y, false)
    let idx0 = idx1
    let link_strength = 0.125
    let link_strength_2 = 1.5
    let clink_strength = 0.5
    let c_ = 0 
    let link_idxs_1 = []
    let link_idxs_2 = []
    while (c_ < count - 1) {
        let p2 = rotate(p1, center, angle)
        let idx2 = s.add_node(p2.x, p2.y, false)
        link_idxs_1.push(s.add_link(idx1, idx2, base_length,link_strength, 2.0));
        s.add_clink(idx1, cidx, idx2, angle, clink_strength, 2.0);
        link_idxs_2.push(s.add_link(cidx, idx1, side_length, link_strength_2, 2.0));
        p1.x = p2.x
        p1.y = p2.y
        idx1 = idx2
        c_ += 1
    } 
    link_idxs_1.push(s.add_link(idx1, idx0, base_length, link_strength, 2.0));
    link_idxs_2.push(s.add_link(cidx, idx1, side_length, link_strength_2, 2.0));
    s.add_clink(idx1, cidx, idx0, angle, clink_strength, 2.0);
    return { 
        cidx: cidx,
        link_idxs_1: link_idxs_1,
        link_idxs_2: link_idxs_2,
    }
}


const level_003 = (Simulation) => {
    let s = Simulation.new(0.08, 0.005, 0.01)
    s.add_bezier(JSON.stringify([
        {
            x: 0.0,
            y: 0.0,
        }, {
            x: 0.0,
            y: 1.0,
        }, {
            x: 1.0,
            y: 1.0,
        }, {
            x: 1.0,
            y: 0.0,
        }, {
            x: 1.0,
            y: -0.5,
        }, {
            x: 0.5,
            y: -0.5,
        }, {
            x: 0.0,
            y: -0.4,
        }
    ]))

    const a = {
        x: 0.94,
        y: 0.0,
    }
    const b = {
        x: 0.85,
        y: -0.08,
    }
    const w1 = add_wheel(s,a )
    const w2 = add_wheel(s, b)
    const dist_ = distance(a, b)
    s.add_link(w1.cidx, w2.cidx, dist_, 1.2, 0.01);
    setTimeout(() => {
        console.log("ee")
        for (const w of [w1, w2]) {
            for (const idx of w.link_idxs_1) {
                s.set_link_length(idx, 0.09)
            }
            for (const idx of w.link_idxs_2) {
                s.set_link_length(idx, 0.04)
            }
        }
    }, 900)
    return {
        simulation: s,
        draw_zoom: 0.8,
        draw_center: [0.5, 0.],
    }
}

export {
    level_003,
}
