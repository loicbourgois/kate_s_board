import { Vellipsis } from "../vellipsis/vellipsis.js";
import { Graphics } from "../vellipsis/graphics.js"
import { get_elapsed_formatted, set_html } from "../vellipsis/utils.js"
const ship_str = String.raw`
*---*                               *---*
 \ / \                             / \ /
  *---*                           *---*
   \ / \                         / \ /
    *---*---*---*---*---*---*---*---*
     \ / \ / \ / \ / \ / \ / \ / \ /
      *---*---*---*---*---*---*---*
`
console.log(ship_str)
import {
    add_structure_from_str
} from "./utils.js"
const tick = (simulation, graphics) => {
    const start = performance.now()
    simulation.tick()
    document.getElementById("physic").innerHTML = get_elapsed_formatted(start)
    const render_start = performance.now()
    render(simulation, graphics)
    document.getElementById("graphics").innerHTML = get_elapsed_formatted(render_start)
    requestAnimationFrame(() => {
        tick(simulation, graphics)
    })
}
const render = (simulation, graphics) => {
    graphics.clear()
    for (const n of simulation.nodes()) {
        if ( n.active!==1 ) {
            continue
        }
        if (isNaN(n.p.x)) {
            simulation.delete_node(n.idx)
            console.error(n)
        }
        let color = config[n.kind].color
        graphics.fill_circle(n.p2, simulation.diameter, color)
    }
    document.getElementById("nodes_count").innerHTML = simulation.nodes_count()
    document.getElementById("links_count").innerHTML = simulation.links_count()
    document.getElementById("links_inactive_count").innerHTML = simulation.links_inactive_count()
    document.getElementById("nodes_inactive_count").innerHTML = simulation.nodes_inactive_count()
    set_html(`fps`, graphics.get_fps())
}
document.body.innerHTML = `
    <div id="left">
        <div id="infos">
            <p>x: <span id="-x"></span></p>
            <p>y: <span id="-y"></span></p>
            <p>x2: <span id="-x2"></span></p>
            <p>y2: <span id="-y2"></span></p>
            <p>physics:  <span id="physic"></span></p>
            <p>graphics: <span id="graphics"></span></p>
            <p>fps:      <span id="fps"></span></p>
            <p>nodes: <span id="nodes_count"></span></p>
            <p>inactive nodes: <span id="nodes_inactive_count"></span></p>
            <p>links: <span id="links_count"></span></p>
            <p>inactive links: <span id="links_inactive_count"></span></p>
        </div>
    </div>
    <canvas id="canvas"></canvas>
`
const config = [
    {
        kind: 'wood',
        color: '#ff88',
        density: 1.0,
    },
    {
        kind: 'marker',
        color: '#f008',
        density: 1.0,
    },
    {
        kind: 'rock',
        color: '#8888',
        density: 1.0,
    },
    {
        kind: 'water',
        color: '#8ff8',
        density: 0.5,
    },
]
const simulation = await Vellipsis.create({
    crdv: 0.0,
    crdp: 0.0,
    diameter: 0.01,
    gravity: 0.00001,
    ticker: 11,
    friction_ratio: 0.0,
    max_speed: 0.5,
    central_gravity: 0.0,
})
for (const x of config) {
    simulation.add_kind(x.kind, x.density)
}
simulation.add_interaction({
    k1: 'wood',
    k2: 'wood',
    crdv: 0.1,
    crdp: 10.0,
    friction_ratio: 0.0,
})
simulation.add_interaction({
    k1: 'wood',
    k2: 'rock',
    crdv: 1.0,
    crdp: 1.0,
    friction_ratio: 0.0,
})
simulation.add_interaction({
    k1: 'water',
    k2: 'rock',
    crdv: 1,
    crdp: 1.0,
    friction_ratio: 0.0,
})
simulation.add_interaction({
    k1: 'wood',
    k2: 'water',
    crdv: 1.,
    crdp: 1.0,
    friction_ratio: 0.0,
})
simulation.add_interaction({
    k1: 'water',
    k2: 'water',
    crdv: 0.1,
    crdp: 10,
    friction_ratio: 0.0,
})
simulation.add_node_js({
    x: 0, 
    y: 0.001,
    kind: 'marker',
    fixed: true,
})
simulation.add({
    structure: 'rect',
    kind: 'rock',
    fixed: true,
    ratio: 1,
    p1: {
        x:-0.4,
        y:-0.3,
    },
    p2: {
        x:0.4,
        y:0.3,
    }
})
simulation.add({
    structure: 'filled_rect',
    kind: 'water',
    fixed: false,
    ratio: 0.9,
    p1: {
        x:-0.4 + simulation.diameter,
        y:-0.3 + simulation.diameter,
    },
    p2: {
        x:0.4-simulation.diameter,
        y:0.,
    }
})
const graphics = new Graphics("canvas", 1, "")
graphics.resize_canvas()
graphics.draw_zoom = 1.5
// graphics.draw_center = [0,0.1]
add_structure_from_str(
    simulation,
    ship_str,
    { x: 0.2, y: 0.02, },
)
// add_structure_from_str(
//     simulation,
//     ship_str,
//     { x: -0.2, y: -0.15, },
// )
tick(simulation, graphics)
