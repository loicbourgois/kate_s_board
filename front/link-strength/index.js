
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
        simulation.add_node(
            data.mouse.p.x + Math.random() * simulation.diameter - simulation.diameter*0.5, 
            data.mouse.p.y + Math.random() * simulation.diameter - simulation.diameter*0.5, 
            false
        )
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
    for (const l of simulation.links()) {
        graphics.line(l.a.p, l.b.p, "#ddd", 2)
    }
    for (const n of simulation.nodes()) {
        graphics.fill_circle(n.p, simulation.diameter, colors[n.z])
    }
    document.getElementById("nodes_count").innerHTML = simulation.nodes_count()
}
const data = {
    mouse: {},
    times: [],
    previous_state: null,
}
const simulation = await Vellipsis.create({
    crdv: 10.0,
    crdp: 0.1,
    crdv2: 0.0,
    crdp2: 0.0,
    diameter: 0.01,
    gravity: 0.00001,
    central_gravity: 0.0,
    ticker: 1,
    friction_ratio: 0.0,
    max_speed: 0.001,
})
const add_line = (c) => {
    const p1 = {
        x: c.ab[0],
        y: c.ab[1],
    }
    const p2 = {
        x: c.ab[2],
        y: c.ab[3],
    }
    const delt = delta(p1, p2)
    const dist = distance(p1, p2)
    const n = normalize(delt)
    const v = {
        x: n.x * simulation.diameter,
        y: n.y * simulation.diameter,
    }
    let id1 = simulation.add_node(p1.x, p1.y, true)
    let i = 1
    while (true) {
        const p3 = {
            x: p1.x + v.x * i,
            y: p1.y + v.y * i,
        }
        const p4 = {
            x: p1.x + v.x * (i+1),
            y: p1.y + v.y * (i+1),
        }
        if (distance(p1, p3) > dist) {
            break
        }
        let fixed = false
        if (distance(p1, p4) > dist) {
            fixed = true
        }
        const id2 = simulation.add_node(p3.x, p3.y, fixed)
        simulation.add_link(id1, id2, c.link_length, c.link_strength, c.link_damping)
        id1 = id2
        i++
    }
}
add_line({
    ab: [0.0, 0.0, 0.2, 0.0],
    link_strength: 10.0,
    link_damping: 100.0,
    link_length: simulation.diameter*0.01,
})
add_line({
    ab: [0.0, 0.0, -0.2, 0.0],
    link_strength: 10.0,
    link_damping: 100.0,
    link_length: simulation.diameter*0.01,
})

// for (let index = 0; index < 5000; index++) {
//     simulation.add_node(Math.random()*0.3-0.15, Math.random()*0.3-0.15, false)
// }
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
graphics.draw_zoom = 2.0
graphics.context.canvas.addEventListener('mousemove', update_mouse(graphics, simulation))
graphics.context.canvas.addEventListener('mousedown', () => {
    data.add_node = true
})
graphics.context.canvas.addEventListener('mouseup', () => {
    data.add_node = false
})
tick(simulation, graphics)
