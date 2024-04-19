import { 
    rotate,
    distance,
} from "../math.js";


const add_gear = (s, k) => {
    let idx0 = s.add_node_2(k.x, k.y, false, k.z)
    let p0 = {
        x: k.x,
        y: k.y,
        id: idx0,
    }
    let angle = 1.0 / k.teeth
    let base_length = s.diameter * 2
    let radius = base_length / (2*Math.sin(Math.PI * angle))
    let counter = 0
    let p1 = {
        x: k.x,
        y: k.y + radius,
    }
    let pa1 = rotate({
        x: k.x,
        y: k.y + radius - s.diameter,
    }, k, angle*0.5)
    let outs = []
    let ins = []
    while (counter < k.teeth ) {
        let p2 = rotate(p1, k, angle)
        let pa2 = rotate(pa1, k, angle)
        let idx2 = s.add_node_2(p2.x, p2.y, false, k.z)
        outs.push({
            x: p2.x,
            y: p2.y,
            id: idx2,
        })
        let idxa2 = s.add_node_2(pa2.x, pa2.y, false, k.z)
        ins.push({
            x: pa2.x,
            y: pa2.y,
            id: idxa2,
        })
        p1.x = p2.x
        p1.y = p2.y
        pa1.x = pa2.x
        pa1.y = pa2.y
        counter += 1
    }
    let link_strength = 1.0;
    let link_damping = 1.0;
    for (let i = 0; i < k.teeth; i++) {
        let i1 = i-1
        if (i == 0) {
            i1 = k.teeth - 1
        }
        let p1 = ins[i1]
        let p2 = ins[i]
        let p3 = outs[i]
        s.add_link(p1.id, p2.id, distance(p1, p2), link_strength, link_damping)
        s.add_link(p1.id, p3.id, distance(p1, p3), link_strength, link_damping)
        s.add_link(p2.id, p3.id, distance(p2, p3), link_strength, link_damping)
        s.add_link(p0.id, p1.id, distance(p0, p1), link_strength, link_damping)
        s.add_link(p0.id, p3.id, distance(p0, p3), link_strength, link_damping)
    }
    return { 
        cidx: idx0,
        ins: ins,
        outs: outs,
    }
}


export {
    add_gear,
}
