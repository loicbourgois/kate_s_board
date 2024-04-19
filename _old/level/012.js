import { add_wheel } from "../build/wheel.js";
import { add_spikewheel } from "../build/spike_wheel.js";
import { add_motor, add_motor_2 } from "../build/motor.js";
import { add_gear } from "../build/gear.js";
import { node } from "../node.js";
import { distance } from "../math.js";
import { rotate } from "../math.js";
import { delta } from "../math.js";


const level_012 = (Simulation, wasm) => {
    let s = Simulation.new(JSON.stringify({
        crdv: 4.0,
        crdp: 2.0,
        crdv2: 0.1,
        crdp2: 0.001,
        diameter: 0.01,
        gravity: 0.0000005,
        ticker: 5,
        friction_ratio: 0.001,
        max_speed: 0.0005,
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
    let c = {
        x: 0.2,
        y: 0.0,
    }
    let clinks = []
    let link_strength = 1.0;
    let link_damping = 1.0;
    let c_id = s.add_node_2(c.x, c.y, true, 2)
    // let b_id_previous = c_id
    let b_previous = {
        id: c_id,
        x: c.x, 
        y: c.y,
    }
    for (let i = 1; i < 40; i++) {
        let a = {
            x: 0.2 + i*0.01, 
            y: 0.0,
        }
        let a_id = s.add_node_2(a.x, a.y, true, 1)
        let b = rotate (a, c, 0.0)
        let b_id = s.add_node_2(b.x, b.y, false, 2)

        s.add_link(b_id, b_previous.id, distance(b, b_previous), link_strength, link_damping)


        b_previous = {
            id: b_id,
            x: b.x, 
            y: b.y,
        }
        
        s.add_link(c_id, a_id, distance(c, a), link_strength, link_damping)
        s.add_link(c_id, b_id, distance(c, b), link_strength, link_damping)

        // if (i == 19) {

        clinks.push(s.add_clink(
            a_id, 
            c_id, 
            b_id, 
            0.0, 0.1, 30.0))
        // }
    }

    for (let i = 5; i < 35; i++) {
        for (let j = 0; j < 40; j++) {
            s.add_node_2(0.245 + i * 0.01, 0.01 + j * 0.01, false, 2)
        }
        
    }

    
    // s.add_node_2(0.275, 0.01, false, 2)
    // s.add_node_2(0.285, 0.01, false, 2)
    // s.add_node_2(0.325, 0.01, false, 2)


    // setTimeout(()=> {
    //     for (const cl of clinks) {
    //         s.set_clink_angle(cl, 0.1)
    //     } 
    // }, 100)
    


    return {
        simulation: s,
        draw_zoom: 0.9,
        draw_center: [0.0, 0.5],
        stepper: () => {
            
            for (const cl of clinks) {
                s.set_clink_angle(cl, Math.min(s.step / 2000.0, 0.16) )
            }

            // m1.run(s, m1)
            // throw "TODO: multi plane wheel"
        },
    }
}



export {
    level_012,
}
