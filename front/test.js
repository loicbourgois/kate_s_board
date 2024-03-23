
import { node } from "./node.js";
import { link } from "./link.js";

const assert_equal = (a, b, m) => {
    if ( Math.abs(a - b) > 0.000001 ) {
        console.error(m, a, b)
    } else {
        // console.log(m, a, b)
    }
}

const assert_equal_triple = (a, b, c, m) => {
    if ( a === undefined ||  b === undefined || c === undefined ) {
        console.error(m, a, b, c)
    }
    if ( Math.abs(a - b) > 0.000001 ) {
        console.error(m, a, b, c)
    }
    else if ( Math.abs(a - c) > 0.000001 ) {
        console.error(m, a, b, c)
    }
    else if ( Math.abs(b - c) > 0.000001 ) {
        console.error(m, a, b, c)
    }
}

const test = (wasm,Simulation ) => {
    let s = Simulation.new(JSON.stringify({
        crdv: 4.0,
        crdp: 2.0,
        crdv2: 0.0,
        crdp2: 0.0,
        diameter: 0.01,
        gravity: 0.0000005,
        ticker: 20,
        friction_ratio: 0.0,
        max_speed: 10000.0,
    }))
    s.test_assign_nodes()
    s.add_link(0, 1, 0.1, 0.2, 0.3);
    s.add_link(0, 1, -0.1, -0.2, -0.3);
    const nodes_ptr = s.nodes_ptr();
    const node_size = s.node_size();
    const nodes_view = new DataView(wasm.memory.buffer, nodes_ptr, s.nodes_size());
    const links_ptr = s.links_ptr();
    const link_size = s.link_size();
    const links_view = new DataView(wasm.memory.buffer, links_ptr, s.links_size());
    let n0 = node(nodes_view, 0, node_size);
    let n1 = node(nodes_view, 1, node_size);
    let l0 = link(links_view, 0, link_size, nodes_view, node_size);
    let l1 = link(links_view, 1, link_size, nodes_view, node_size);
    assert_equal_triple(n0.p.x, -n1.p.x, 1.0, "p.x")
    assert_equal_triple(n0.p.y, -n1.p.y, 2.0, "p.y")
    assert_equal_triple(n0.pp.x, -n1.pp.x, 3.0, "pp.x")
    assert_equal_triple(n0.pp.y, -n1.pp.y, 4.0, "pp.y")
    assert_equal_triple(n0.dp.x, -n1.dp.x, 5.0, "dp.x")
    assert_equal_triple(n0.dp.y, -n1.dp.y, 6.0, "dp.y")
    assert_equal_triple(n0.dv.x, -n1.dv.x, 7.0, "dv.x")
    assert_equal_triple(n0.dv.y, -n1.dv.y, 8.0, "dv.y")
    assert_equal_triple(n0.m, -n1.m, 9.0, "m")
    assert_equal_triple(n0.v.x, -n1.v.x, 10.0, "v.x")
    assert_equal_triple(n0.v.y, -n1.v.y, 11.0, "v.y")
    assert_equal_triple(n0.turbo_max_speed, -n1.turbo_max_speed, 12.0, "turbo_max_speed")
    assert_equal_triple(n0.turbo_rate, -n1.turbo_rate, 13.0, "turbo_rate")
    assert_equal_triple(n0.direction.x, -n1.direction.x, 14.0, "direction.x")
    assert_equal_triple(n0.direction.y, -n1.direction.y, 15.0, "direction.y")
    assert_equal(n0.fixed, 1, "n0.fixed")
    assert_equal(n1.fixed, 0, "n1.fixed")
    assert_equal(n0.z, 101, "n0.z")
    assert_equal(n0.idx, 102, "n0.idx")
    assert_equal(n1.z, 103, "n1.z")
    assert_equal(n1.idx, 104, "n1.idx")
    assert_equal_triple(l0.l, -l1.l, 0.1, "l.l")
    assert_equal_triple(l0.s, -l1.s, 0.2, "l.s")
    assert_equal_triple(l0.damping, -l1.damping, 0.3, "l.damping")
    assert_equal_triple(l0.a.p.x, l1.a.p.x, 1, "l.a.p.x")
    assert_equal_triple(l0.a.p.y, -l0.b.p.y, 2,"l.p.y")
}


export {
    test,
}
