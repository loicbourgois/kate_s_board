import { add_wheel } from "../build/wheel.js";
import { add_spikewheel } from "../build/spike_wheel.js";
import { add_motor, add_motor_2 } from "../build/motor.js";
import { add_gear } from "../build/gear.js";
import { node } from "../node.js";
import { distance } from "../math.js";


const get_node = (wasm, s, idx) => {
    const nodes_ptr = s.nodes_ptr();
    const node_size = s.node_size();
    const nodes_view = new DataView(wasm.memory.buffer, nodes_ptr, s.nodes_size());
    return node(nodes_view, idx, node_size)
}


const level_010 = (Simulation, wasm) => {
    let s = Simulation.new(JSON.stringify({
        crdv: 4.0,
        crdp: 2.0,
        crdv2: 0.0,
        crdp2: 0.0,
        diameter: 0.01,
        gravity: 0.0000005,
        ticker: 20,
        friction_ratio: 0.3,
        max_speed: 1.0,
    }));

    s.add_bezier_2(
        JSON.stringify([
            {
                x: -0.5,
                y: 0.2,
            }, {
                x: -0.1,
                y: -.01,
            }, {
                x: 0.1,
                y: -.01,
            }, {
                x: 0.5,
                y: 0.2,
            }
        ]), 
        0.0,
        1
    )
    s.add_bezier_2(
        JSON.stringify([
            {
                x: -0.5,
                y: 0.1,
            }, {
                x: -0.1,
                y: -.01,
            }, {
                x: 0.1,
                y: -.01,
            }, {
                x: 0.5,
                y: 0.1,
            }
        ]), 
        0.0,
        2
    )
    for (let i = 0; i < 50; i++) {
        s.add_node_2(Math.random()*0.2, 0.1+ Math.random()*0.2, false, 1)
        s.add_node_2(Math.random()*0.2-0.2, 0.1+ Math.random()*0.2, false, 2)
    }
    let g = add_gear(s, {
        x: -0.2,
        y: -0.2,
        z: 1,
        teeth: 10, 
    })
    s.set_node_fixed(g.cidx, true)

    let g2 = add_gear(s, {
        x: -0.154,
        y: -0.154,
        z: 1,
        teeth: 10, 
    })
    s.set_node_fixed(g2.cidx, true)

    let g3 = add_gear(s, {
        x: -0.054,
        y: -0.13,
        z: 1,
        teeth: 22, 
    })
    s.set_node_fixed(g3.cidx, true)

    let g4 = add_gear(s, {
        x: -0.054,
        y: -0.13,
        z: 2,
        teeth: 11, 
    })
    s.set_node_fixed(g4.cidx, true)


    for (let i = 0; i < g4.outs.length; i++) {
        s.add_link(
            g3.outs[i*2].id, g4.outs[i].id, 
            distance(g3.outs[i*2], g4.outs[i]),
            1.0, 1.0
        )
    }




    let g5 = add_gear(s, {
        x: 0.055,
        y: -0.2,
        z: 2,
        teeth: 30, 
    })
    s.set_node_fixed(g5.cidx, true)


    let n1 = s.add_node_2(0.2, -0.2, true, 1)
    let angle = find_angle(
        get_node(wasm, s, n1).p,
        get_node(wasm, s, g.cidx).p,
        g.ins[0],
    )
    console.log(angle)
    let m1 = add_motor_2(s, g.cidx, n1, g.ins, angle, 1/5000)
    return {
        simulation: s,
        draw_zoom: 1.,
        draw_center: [0.0, -0.0],
        stepper: () => {     
            m1.run(s, m1)
            // throw "TODO: multi plane wheel"
        },
    }
}

const find_angle = (p2, p1, p3) => {
    let diff_x1 = p2.x - p1.x;
    let diff_y1 = p2.y - p1.y;
    let diff_x2 = p3.x - p1.x;
    let diff_y2 = p3.y - p1.y;
    let theta1 = Math.atan2(diff_y1, diff_x1);
    let theta2 = Math.atan2(diff_y2, diff_x2);
    let diffTheta = theta2 - theta1;
    if (diffTheta < 0.0) {
        diffTheta += 2.0 * Math.PI;
    }
    let angleDeg = (diffTheta * 180.0 / Math.PI) % 360.0;
    return angleDeg / 360.0
}


export {
    level_010,
}
