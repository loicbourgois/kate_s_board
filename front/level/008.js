import { add_wheel } from "../build/wheel.js";

const level_008 = (Simulation) => {
    // let s = Simulation.new(3.0, 20.0, 0.01, 0.000001, 10);
    let s = Simulation.new(JSON.stringify({
        crdv: 4.0,
        crdp: 2.0,
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
                y: 0.4,
            }, {
                x: -1.,
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
    s.add_node(-0.8, 0.2 , false);
    s.add_node(0.5, 0.04 , true);
    let uu = 15;
    for (let i = 0; i < uu; i++) {
        s.add_node(0.5, 0.04 + 0.02 * (i + 1) , false);
    }
    s.add_node(0.52, 0.04 + 0.01 * uu , true);
    return {
        simulation: s,
        draw_zoom: 0.5,
        draw_center: [0.0, 0.0],
        stepper: () => {        },
    }
}


export {
    level_008,
}
