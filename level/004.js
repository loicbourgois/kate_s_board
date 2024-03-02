import { 
    add_wheel,
} from "../build/wheel.js";
import { add_spikewheel,} from "../build/spike_wheel.js";
import { 
    add_motor,
} from "../build/motor.js";


const level_004 = (Simulation) => {
    let s = Simulation.new(JSON.stringify({
        crdv: 8.0,
        crdp: 1.0,
        crdv2: 0.01,
        crdp2: 0.001,
        diameter: 0.008,
        gravity: 0.000001,
        ticker: 10,
        friction_ratio: 0.3,
        max_speed: 0.001,
    }));
    s.add_bezier(
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
        0.9
    )
    const a = {
        x: -0.05,
        y: .1,
    }
    const b = {
        x: 0.05,
        y: .1,
    }
    const c = {
        x: 0.15,
        y: .1,
    }
    const w1 = add_wheel(s, a, 12)
    const w2 = add_wheel(s, b, 12)
    const w3 = add_wheel(s, c, 12)
    // const w3 = add_spikewheel(s, c, 12)
    const i2 = s.add_link(w1.cidx, w2.cidx, 0.1, 0.5, 10.0)
    const i3 = s.add_link(w2.cidx, w3.cidx, 0.1, 0.5, 10.0)
    const m1 = add_motor(s, w1, w2.cidx, 0.25)
    const m2 = add_motor(s, w2, w1.cidx, 0.75)
    const m2_2 = add_motor(s, w2, w3.cidx, 0.25)
    const m3 = add_motor(s, w3, w2.cidx, 0.75)
    for (let index = 0; index < 200; index++) {
        s.add_node(Math.random()*0.2 - 0.25, Math.random()*0.2 + 0.15, false)
    }
    return {
        simulation: s,
        draw_zoom: .8,
        draw_center: [0.0, 0.],
        stepper: () => {
            for (const m of [
                    m1, 
                    m2, m2_2, 
                    m3,
                ]) {
                m.run(s, m)
            }
        }
    }
}


export {
    level_004,
}
