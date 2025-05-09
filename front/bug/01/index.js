
import { Vellipsis } from "../vellipsis/vellipsis.js";
import { Graphics } from "../vellipsis/graphics.js"
import { get_elapsed_formatted } from "../vellipsis/utils.js"
import { 
    delta,  
    normalize,
    distance,
} from "../vellipsis/math.js"
const update_mouse = (graphics, simulation) => {
    return (a) => {
        data.mouse.canvas_p = {
            x: a.clientX,
            y: a.clientY
        }
        data.mouse.p = graphics.context_coordinates_2(data.mouse.canvas_p)
        document.getElementById("x").innerHTML = data.mouse.canvas_p.x
        document.getElementById("y").innerHTML = data.mouse.canvas_p.y
        document.getElementById("x2").innerHTML = data.mouse.p.x.toFixed(2)
        document.getElementById("y2").innerHTML = data.mouse.p.y.toFixed(2)
        simulation.set_mouse(data.mouse.p.x, data.mouse.p.y)
    }
}
const tick = (simulation, graphics) => {
    const start = performance.now()
    if (data.add_node) {
        simulation.add_node_js({
            x: data.mouse.p.x + Math.random() * simulation.diameter - simulation.diameter*0.5,
            y: data.mouse.p.y + Math.random() * simulation.diameter - simulation.diameter*0.5,
            // dx: 0.01,
            kind: 'default',
        })
    }
    simulation.tick()
    document.getElementById("physic").innerHTML = get_elapsed_formatted(start)
    const render_start = performance.now()
    render(simulation, graphics)
    document.getElementById("graphics").innerHTML = get_elapsed_formatted(render_start)
    requestAnimationFrame(() => {
        tick(simulation, graphics)
    })
}
const colors = ["#ddd", "#ff4", "#4ff"]
const render = (simulation, graphics) => {
    graphics.clear_partial()
    for (const n of simulation.nodes()) {
        graphics.fill_circle(n.p, simulation.diameter, colors[n.z])
        if (isNaN(n.p.x)) {
            console.error(n)
            throw "isNaN(n.p.x)"
        }
    }
    for (const l of simulation.links()) {
        if (!l.active) {
            continue
        }
        const limit = 0.4
        let aa = l.stress / limit
        let r = 1
        let g = 1
        if (aa > 0.5) {
            g = (1-aa) * 2
        }
        r = parseInt(r*255)
        g = parseInt(g*255)
        let b = parseInt(0)
        graphics.line(l.a.p, l.b.p, `rgb(${r}, ${g}, ${g})`, 1)
        if (l.stress > limit ) {
            console.log("zoop")
            console.log(l.idx, l.uid)
            simulation.delete_link(l.idx, l.uid)
        }
    }
    document.getElementById("nodes_count").innerHTML = simulation.nodes_count()
}
const data = {
    mouse: {},
    times: [],
    previous_state: null,
}
const simulation = await Vellipsis.create({
    crdv: 1.0,
    crdp: 0.0,
    crdv2: 0.0,
    crdp2: 0.0,
    diameter: 0.01,
    gravity: 0.00001,
    central_gravity: 0.0,
    ticker: 1,
    friction_ratio: 0.0,
    max_speed: 0.001,
})
simulation.add_kind('default')
simulation.add_kind('glue')
simulation.add_kind('wall')
simulation.set_friction_ratio('glue', 'wall', 0.3)

simulation.add_node(0.0, 0, false)
simulation.add_node(0.01, 0, false)

for (const n of simulation.nodes()) {
    console.log(n.idx, n.p)
}
document.body.innerHTML = `
    <div id="left">
        <div id="infos">
            <p>x: <span id="x"></span></p>
            <p>y: <span id="y"></span></p>
            <p>x2: <span id="x2"></span></p>
            <p>y2: <span id="y2"></span></p>
            <p>physics:  <span id="physic"></span></p>
            <p>graphics: <span id="graphics"></span></p>
            <p>nodes: <span id="nodes_count"></span></p>
        </div>
    </div>
    <canvas id="canvas"></canvas>
`
const graphics = new Graphics("canvas")
document.addEventListener('mouseover', update_mouse(graphics, simulation), false)
graphics.resize_canvas()
graphics.draw_zoom = .4
graphics.context.canvas.addEventListener('mousemove', update_mouse(graphics, simulation))
graphics.context.canvas.addEventListener('mousedown', () => {
    data.add_node = true
})
graphics.context.canvas.addEventListener('mouseup', () => {
    data.add_node = false
})
tick(simulation, graphics)
