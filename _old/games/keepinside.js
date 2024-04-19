import {rotate} from "../math.js"


// TODO
// https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon


const make_circle = (c, s, center) => {
    let circonference = c * s.diameter
    let radius = circonference  / Math.PI * 0.25
    const ids = []
    const fixed = false
    ids.push(s.add_node_3(JSON.stringify({
        x: radius+center[0],
        y: 0.0+center[1],
        turbo_max_speed: 0.0,
        fixed: fixed,
    })))
    let base_length = s.diameter * 1.2
    let link_strength = 1
    let link_damping = 300
    for (let index = 1; index < c; index++) {
        let p = rotate({x:radius+center[0], y:center[1]}, {x:center[0], y:center[1]}, index/c)
        ids.push(s.add_node_3(JSON.stringify({
            x: p.x,
            y: p.y,
            turbo_max_speed: 0.0,
            fixed: fixed,
        })))
        s.add_link(ids[index-1], ids[index], base_length, link_strength, link_damping)
    }
    s.add_link(ids[c-1], ids[0], base_length, link_strength, link_damping)
}


const keepinside = (Simulation, wasm, context) => {
    let s = Simulation.create(JSON.stringify({
        crdv: 8.0,
        crdp: 1.0,
        crdv2: 1.1,
        crdp2: 1.1,
        diameter: 0.005,
        gravity: 0.0,
        central_gravity: -0.00000001,
        ticker: 10,
        friction_ratio: 0.3,
        max_speed: 0.001,
    }))
    make_circle(1000, s, [-0., 0.])
    return {
        simulation: s,
        draw_zoom: 0.8,
        draw_center: {x: 0, y: 0},
        stepper: () => {},
        render: (d) => {
        }
    }
}


export {
    keepinside,
}
