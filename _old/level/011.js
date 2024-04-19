import { add_wheel } from "../build/wheel.js";
import { add_spikewheel } from "../build/spike_wheel.js";
import { add_motor, add_motor_2 } from "../build/motor.js";
import { add_gear } from "../build/gear.js";
import { node } from "../node.js";
import { distance } from "../math.js";
import { delta } from "../math.js";


const get_node = (wasm, s, idx) => {
    const nodes_ptr = s.nodes_ptr();
    const node_size = s.node_size();
    const nodes_view = new DataView(wasm.memory.buffer, nodes_ptr, s.nodes_size());
    return node(nodes_view, idx, node_size)
}


const level_011 = (Simulation, wasm) => {
    let s = Simulation.new(JSON.stringify({
        crdv: 4.0,
        crdp: 2.0,
        crdv2: 0.0,
        crdp2: 0.0,
        diameter: 0.05,
        gravity: 0.0000005,
        ticker: 20,
        friction_ratio: 0.01,
        max_speed: 1.0,
    }));



    s.add_bezier_2(
        JSON.stringify([
            {
                x: -2.5,
                y: 2.,
            }, {
                x: -2.1,
                y: -.01,
            }, {
                x: 0.1,
                y: .0,
            }, {
                x: 0.0,
                y: 0.0,
            }
        ]), 
        0.0,
        1
    )

    let n1 =  {
        p:  { x: 0.0, y: 0.0 },
        v:  { x: 0.0, y: 0.0 },
    };
    let n2 =  {
        p:  { x: 1.0, y: 1.0 },
        v:  { x: 0.5, y: 0.2 },
    };
    let A =  {
        x: (n1.p.x + n2.p.x) * 0.5,
        y: (n1.p.y + n2.p.y) * 0.5,
    };
    let delta_position = delta(n1.p, n2.p);
    let delta_velocity = delta(n1.v, n2.v);
    let ab = {
        x: delta_position.y,
        y: -delta_position.x,
    }
    let ac = delta_velocity;
    let coeff = (ab.x * ac.x + ab.y * ac.y) / (ab.x * ab.x + ab.y * ab.y);
    let dx = ab.x * coeff;
    let dy = ab.y * coeff;
    let n1_ = s.add_node_2(n1.p.x, n1.p.y, true, 1)
    let n2_ = s.add_node_2(n2.p.x, n2.p.y, true, 2)
    let a = s.add_node_2(A.x, A.y, true, 0)
    let b = s.add_node_2(A.x + ab.x, A.y + ab.y, true, 0)
    let c = s.add_node_2(A.x + ac.x, A.y + ac.y, true, 0)
    let d = s.add_node_2(dx, dy, true, 0)
    

    s.add_node_2(-1, 1, false, 1)


    return {
        simulation: s,
        draw_zoom: 0.2,
        draw_center: [0.0, -0.0],
        stepper: () => {     
            // m1.run(s, m1)
            // throw "TODO: multi plane wheel"
        },
    }
}



export {
    level_011,
}
