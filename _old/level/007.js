import { add_wheel } from "../build/wheel.js";

const level_007 = (Simulation) => {
    let s = Simulation.new(JSON.stringify({
        crdv: 4.0,
        crdp: 1.0,
        crdv2: 0.0,
        crdp2: 0.0,
        diameter: 0.01,
        gravity: 0.000001,
        ticker: 10,
        max_speed: 1.0,
    }));
    s.add_bezier(
        JSON.stringify([
            {
                x: -1.0,
                y: 0.2,
            }, {
                x: -0.1,
                y: -.01,
            }, {
                x: 0.1,
                y: -.01,
            }, {
                x: 0.5,
                y: -0.01,
            }, {
                x: 0.5,
                y: -0.01,
            }, {
                x: 0.5,
                y: -0.01,
            }, {
                x: 1.0,
                y: -0.01,
            }, {
                x: 1.0,
                y: -0.01,
            }, {
                x: 1.0,
                y: -0.01,
            }, {
                x: 1.0,
                y: 0.5,
            }
        ]), 
        0.0
    )
    s.add_node(0.5, 0.0 , true);
    let uu = 20;
    for (let i = 0; i < uu; i++) {
        s.add_node(0.5, 0.02 * (i + 1) , false);
    }
    add_wheel(s, {x: -0.7 , y: 0.3 }, 15, 0.05)
    return {
        simulation: s,
        draw_zoom: 0.5,
        draw_center: [0.0, 0.0],
        stepper: () => {        },
    }
}


export {
    level_007,
}
