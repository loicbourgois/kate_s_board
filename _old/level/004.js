const level_004 = (Simulation) => {
    let s = Simulation.create(JSON.stringify({
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
    const w1 = s.add_wheel(a, 12)
    const w2 = s.add_wheel(b, 12)
    const w3 = s.add_wheel(c, 12)
    const i2 = s.add_link(w1.cidx, w2.cidx, 0.1, 0.5, 10.0)
    const i3 = s.add_link(w2.cidx, w3.cidx, 0.1, 0.5, 10.0)
    const m1 = s.add_motor(w1, w2.cidx, 0.25)
    const m2 = s.add_motor(w2, w1.cidx, 0.75)
    const m2_2 = s.add_motor(w2, w3.cidx, 0.25)
    const m3 = s.add_motor(w3, w2.cidx, 0.75)
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
