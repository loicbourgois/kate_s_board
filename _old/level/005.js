const level_005 = (Simulation) => {
    // let s = Simulation.new(0.4, 0.001, 0.01, 0.000001, 5)
    let s = Simulation.new(10.0, 2.0, 0.01, 0.000004, 10);

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
        0.0
    )
    s.add_bezier(
        JSON.stringify([
            {
                x: -0.5,
                y: -0.1,
            }, {
                x: -0.1,
                y: -.2,
            }, {
                x: 0.1,
                y: -.2,
            }, {
                x: 0.5,
                y: -0.1,
            }
        ]), 
        0.0
    )
    for (let index = 0; index < 200; index++) {
        s.add_node(Math.random()*0.2 - 0.1, Math.random()*0.2 + 0.1, false)
    }
    return {
        simulation: s,
        draw_zoom: 0.8,
        draw_center: [0.0, 0.],
        stepper: () => {        }
    }
}


export {
    level_005,
}
