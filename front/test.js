
import { node } from "./node.js";
import { link } from "./link.js";

const assert_equal = (a, b, m) => {
    if ( Math.abs(a - b) > 0.000001 ) {
        console.error(m, a, b)
    } else {
        console.log(m, a, b)
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
    assert_equal(n0.p.x, -n1.p.x, "p.x")
    assert_equal(n0.p.y, -n1.p.y, "p.y")
    assert_equal(n0.pp.x, -n1.pp.x, "pp.x")
    assert_equal(n0.pp.y, -n1.pp.y, "pp.y")
    assert_equal(n0.dp.x, -n1.dp.x, "dp.x")
    assert_equal(n0.dp.y, -n1.dp.y, "dp.y")
    assert_equal(n0.dv.x, -n1.dv.x, "dv.x")
    assert_equal(n0.dv.y, -n1.dv.y, "dv.y")
    assert_equal(n0.m, -n1.m, "m")
    assert_equal(n0.v.x, -n1.v.x, "dv.x")
    assert_equal(n0.v.y, -n1.v.y, "dv.y")
    assert_equal(n0.v.y, -n1.v.y, "dv.y")
    assert_equal(n0.fixed, 1, "n0.fixed")
    assert_equal(n1.fixed, 0, "n1.fixed")
    assert_equal(n0.z, 12, "n0.z")
    assert_equal(n0.idx, 13, "n0.idx")
    assert_equal(n1.z, 14, "n1.z")
    assert_equal(n1.idx, 15, "n1.idx")
    assert_equal(l0.l, -l1.l, "l.l")
    assert_equal(l0.s, -l1.s, "l.s")
    assert_equal(l0.damping, -l1.damping, "l.damping")
    assert_equal(l0.a.p.x, l1.a.p.x, "l.a.p.x")
    assert_equal(l0.a.p.y, -l0.b.p.y, "l.p.y")
}

export {
    test,
}