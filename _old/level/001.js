const level_001 = (Simulation) => {
    let s = Simulation.new(0.1, 0.02, 0.01)
    let a = s.add_node(0.5, 1.0, false)
    let b = s.add_node(0.7, 1.0, false)
    let a2 = s.add_node(0.5, 1.1, false)
    let b2 = s.add_node(0.7, 1.1, false)
    let c = s.add_node(0.5, 0.5, true)
    let c2 = s.add_node(0.5, 0.51, true)
    let c3 = s.add_node(0.51, 0.51, true)
    let c4 = s.add_node(0.49, 0.51, true)
    let d = s.add_node(0.7, 0.5, true)
    let d3 = s.add_node(0.71, 0.5, true)
    let d4 = s.add_node(0.69, 0.5, true)
    let e = s.add_node(0.58, 0.3, false)
    let f = s.add_node(0.68, 0.3, false)
    s.add_link(c, e, 0.1, 0.01, 20.0)
    s.add_link(e, f, 0.1, 0.01, 20.0)
    s.add_link(a, b, 0.2, 0.01, 20.0)
    {
        let a = s.add_node(1.5, 1.0, true);
        let b = s.add_node(1.75, 1.0, true);
        let c = s.add_node(1.5, 1.25, false);
        let d = s.add_node(1.75, 1.25, true);
        s.add_link(a, b, 0.25, 0.01, 20.0);
        s.add_link(b, c, 0.27, 0.01, 20.0);
        s.add_clink(a, b, c, -0.05, 0.05, 2.0);
    }
    for (let index = 0; index < 250; index++) {
        s.add_node(0.3 + index*0.01, 0.2 - index*0.0025, true)
    }
    for (let i = 0; i < 100; i++) {
        s.add_node(i*0.01, -i*0.01, true)
    }
    let uu_1
    let uu_2
    {
        let a = s.add_node(1.1, 0.3, false);
        let b = s.add_node(1.3, 0.3, false);
        let c = s.add_node(1.1, 0.4, false);
        let d = s.add_node(1.3, 0.4, false);
        s.add_link(a, b, 0.25, 0.01, 20.0);
        s.add_link(b, c, 0.26, 0.01, 20.0);
        s.add_link(c, d, 0.26, 0.01, 20.0);
        uu_1 = s.add_clink(a, b, c, -0.05, 0.95, 0.3);
        uu_2 = s.add_clink(b, c, d, 0.05, 0.95, 0.3);
    }
    return {
        simulation: s,
        draw_zoom: 0.3,
        draw_center: [1.55, 0.65],
    }

}

export {
    level_001,
}