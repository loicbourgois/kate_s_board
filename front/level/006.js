const level_006 = (Simulation) => {
    let s = Simulation.new(3.0, 10.0, 0.01, 0.000001, 10);
    let c = 49;
    for (let i = 0; i < c; i++) {
        s.add_node(0.01 * i - 0.01 * (c ) / 2.0, 0.0, true);
    }
    let uu = 20;
    for (let i = 0; i < uu; i++) {
        s.add_node(0.0, 0.02 * (i + 1) , false);
    }

    s.add_node(0.02, 0.01 * uu , true);

    return {
        simulation: s,
        draw_zoom: 1.8,
        draw_center: [0.0, 0.],
        stepper: () => {        }
    }
}


export {
    level_006,
}
