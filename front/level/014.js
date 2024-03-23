import { add_wheel } from "../elements/wheel.js";
import { add_spikewheel } from "../elements/spike_wheel.js";
import { add_motor, add_motor_2 } from "../elements/motor.js";
import { add_gear } from "../elements/gear.js";
import { node } from "../node.js";
import { distance, find_angle } from "../math.js";
import { rotate } from "../math.js";
import { delta } from "../math.js";


const level_014 = (Simulation, wasm) => {
    let s = Simulation.new(JSON.stringify({
        crdv: 8.0,
        crdp: 0.1,
        crdv2: 0.0,
        crdp2: 0.0,
        diameter: 0.01,
        gravity: 0.000001,
        ticker: 10,
        friction_ratio: 0.0,
        max_speed: 0.025,
    }));

    s.add_bezier_2(
        JSON.stringify([
            {
                x: -0.75,
                y: 0.25,
            }, {
                x: -0.75,
                y: 0.0,
            }, {
                x: -0.5,
                y: 0.0,
            }, {
                x: 0.0,
                y: 0.0,
            }
        ]),
        0.0,
        2
    )
    s.add_bezier_2(
        JSON.stringify([
            {
                x: 0.6,
                y: 0.125,
            }, {
                x: 0.5,
                y: 0.0,
            }, {
                x: 0.5,
                y: 0.0,
            }, {
                x: 0.0,
                y: 0.0,
            }
        ]),
        0.0,
        2
    )

    // s.add_bezier_2(
    //     JSON.stringify([
    //         {
    //             x: .3,
    //             y: 0.9,
    //         }, {
    //             x: 0.5,
    //             y: 0.0,
    //         }, {
    //             x: 0.1,
    //             y: 0.0,
    //         }, {
    //             x: 0.0,
    //             y: 0.0,
    //         }
    //     ]),
    //     0.0,
    //     2
    // )

    let x_base = -0.7;
    let y_base = 0.2;
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 40; j++) {
            // if (j< 10) 
            // s.add_node_2(
            //     x_base + i * 0.01, 
            //     y_base + j * 0.01, 
            //     false, 2)
            // if (i > j*2)
            s.add_node_2(
                x_base + i * 0.011, 
                y_base + j * 0.01, 
                false, 2)
        }
    }

    //  x_base = 0.3;
    //  y_base = 0.02;
    // for (let i = 0; i < 40; i++) {
    //     for (let j = 0; j < 2; j++) {
    //         // if (j< 10) 
    //         // s.add_node_2(
    //         //     x_base + i * 0.01, 
    //         //     y_base + j * 0.01, 
    //         //     false, 2)
    //         s.add_node_2(
    //             x_base - i * 0.011, 
    //             y_base + j * 0.01, 
    //             false, 2)
    //     }
    // }

    let square = {
        w:10,
        h:2,
        x: -0.4,
        y: 0.4,
    }

    
    let xys = []
    let aa = 1;
    for (let i = aa; i < square.h; i++) {
        xys.push({
            x: square.x - (square.w-1) * 0.01 * 0.5 , 
            y: square.y - i * 0.01 + (square.h-1) * 0.01 * 0.5, 
        })
    }
    for (let i = aa; i < square.w; i++) {
        xys.push({
            x: square.x + i * 0.01 - (square.w-1) * 0.01 * 0.5,
            y: square.y - (square.h-1) * 0.01 * 0.5,
        })
    }
    for (let i = aa; i < square.h; i++) {
        xys.push({
            x: square.x + (square.w-1) * 0.01 * 0.5 , 
            y: square.y + i * 0.01 - (square.h-1) * 0.01 * 0.5, 
        })
    }
    for (let i = aa; i < square.w; i++) {
        xys.push({
            x: square.x - i * 0.01 + (square.w-1) * 0.01 * 0.5,
            y: square.y + (square.h-1) * 0.01 * 0.5,
        })
    }
    let ps = []
    for (const p of xys) {
        let idx = s.add_node_2(
            p.x, 
            p.y, 
            false, 2)
        ps.push({
            x: p.x,
            y: p.y,
            id: idx,
        })
    }

    for (let i1 = 0; i1 < ps.length; i1++) {
        let i2 = (i1 + 1) % ps.length
        let i4 = (i1 + 2) % ps.length
        let i3 = (i1 + parseInt(ps.length/2)) % ps.length
        let p1 = ps[i1]
        let p2 = ps[i2]
        let p3 = ps[i3]
        let p4 = ps[i4]
        s.add_link(p1.id, p2.id, distance(p1, p2), 1.0, 1.0)
        // s.add_link(p1.id, p3.id, distance(p1, p3), 1.0, 10.0)
        s.add_clink(p1.id, p2.id, p4.id, find_angle(p1, p2, p4), 1.0, 1.0)
    }


    return {
        simulation: s,
        draw_zoom: 0.5,
        draw_center: [0.0, 0.5],
        stepper: () => {
        },
    }
}



export {
    level_014,
}
