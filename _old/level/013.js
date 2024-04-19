import { add_wheel } from "../build/wheel.js";
import { add_spikewheel } from "../build/spike_wheel.js";
import { add_motor, add_motor_2 } from "../build/motor.js";
import { add_gear } from "../build/gear.js";
import { node } from "../node.js";
import { distance } from "../math.js";
import { rotate } from "../math.js";
import { delta } from "../math.js";


const level_013 = (Simulation, wasm) => {
    let s = Simulation.new(JSON.stringify({
        crdv: 4.0,
        crdp: 1.0,
        crdv2: 0.0,
        crdp2: 0.0,
        diameter: 0.01,
        gravity: 0.000001,
        ticker: 4,
        friction_ratio: 0.01,
        max_speed: 0.0025,
    }));
    s.add_bezier_2(
        JSON.stringify([
            {
                x: -.5,
                y: 0.9,
            }, {
                x: -0.5,
                y: 0.0,
            }, {
                x: 0.1,
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
                x: .3,
                y: 0.9,
            }, {
                x: 0.5,
                y: 0.0,
            }, {
                x: 0.1,
                y: 0.0,
            }, {
                x: 0.0,
                y: 0.0,
            }
        ]),
        0.0,
        2
    )

    let x_base = -0.5;
    let y_base = 1.0;
    for (let i = 1; i < 50; i++) {
        for (let j = 0; j < 40; j++) {
            s.add_node_2(
                x_base + i * 0.01, 
                y_base + j * 0.01, 
                false, 2)
        }
        
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
    level_013,
}
