import { add_wheel } from "../build/wheel.js";
import { add_spikewheel } from "../build/spike_wheel.js";
import { add_motor } from "../build/motor.js";

const level_009 = (Simulation) => {
    let s = Simulation.new(JSON.stringify({
        crdv: 4.0,
        crdp: 2.0,
        crdv2: 0.0,
        crdp2: 0.0,
        diameter: 0.01,
        gravity: 0.0000005,
        ticker: 20,
        friction_ratio: 0.0,
        max_speed: 1.0,
    }));

    s.add_bezier_2(
        JSON.stringify([
            {
                x: -1.95,
                y: 0.2,
            }, {
                x: -1.7,
                y: -.0,
            }, {
                x: -1.,
                y: -0.1,
            }, {
                x: -0.95,
                y: -0.1,
            }, {
                x: -0.1,
                y: -.31,
            }, {
                x: 0.1,
                y: -.1,
            }, {
                x: 0.95,
                y: -0.1,
            }
        ]), 
        0.0,
        0
    )

    const sw = add_spikewheel(s, {
        x: -0.18,
        y: 0.0,
    }, 12, 0.03)

    const sw2 = add_spikewheel(s, {
        x: 0.16,
        y: 0.0,
    }, 12, 0.03)

    // s.set_node_fixed(sw.cidx, true)
    // s.set_node_fixed(sw2.cidx, true)

    s.add_link(sw.cidx, sw2.cidx, 0.34, 1.0, 1.0)

    // const n1 = s.add_node(0.25, 0.0, true)
    // const m1 = add_motor(s, sw, sw2.cidx, 0.25 + 1/12, 2, 0.0001)
    const m1 = add_motor(s, sw2, sw.cidx, 0.75 + 1/12, 2, 0.0001)

    let link_length = 0.018
    let strength = 2.0
    let damping = 10.0

    let nids = []
    let c = 20
    for (let index = 0; index < c; index++) {
        nids.push(s.add_node((index-c/2) * 0.02, 0.04, false))
        if (index > 0) {
            s.add_link(nids[index-1], nids[index], link_length, strength, damping)
        }
    }
    let nids2 = []
    for (let index = 0; index < c; index++) {
        nids2.push(s.add_node((index-c/2) * 0.02, -0.04, false))
        if (index > 0) {
            s.add_link(nids2[index-1], nids2[index], link_length, strength, damping)
        }
    }

    let nids3 = []
    let c2 = 3
    for (let index = 0; index < c2; index++) {
        nids3.push(s.add_node(0.195, 0.01+(index-c2/2) * 0.02, false))
        if (index > 0) {
            s.add_link(nids3[index-1], nids3[index], link_length, strength, damping)
        }
    }
    let nids4 = []
    for (let index = 0; index < c2; index++) {
        nids4.push(s.add_node(-0.215, 0.01+(index-c2/2) * 0.02, false))
        if (index > 0) {
            s.add_link(nids4[index-1], nids4[index], link_length, strength, damping)
        }
    }
    s.add_link(nids[c-1], nids3[c2-1], link_length, strength, damping)
    s.add_link(nids2[c-1], nids3[0], link_length, strength, damping)
    s.add_link(nids[0], nids4[c2-1], link_length, strength, damping)
    s.add_link(nids2[0], nids4[0], link_length, strength, damping)
    return {
        simulation: s,
        draw_zoom: 0.5,
        draw_center: [-.45, -0.],
        stepper: () => {     
            m1.run(s, m1)
            // m2.run(s, m2)
        },
    }
}


export {
    level_009,
}
