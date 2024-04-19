
import { Vellipsis } from "../vellipsis/vellipsis.js";
import { Graphics } from "../vellipsis/graphics.js"
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
    const d = performance.now() - start
    let m = `${d} ms`
    if (d < 10) {
        m = `0${m}`
    }
    document.getElementById("physic").innerHTML = m
    const render_start = performance.now()
    render(simulation, graphics)
    const render_d = performance.now() - render_start
    let render_m = `${render_d} ms`
    if (render_d < 10) {
        render_m = `0${render_m}`
    }
    document.getElementById("graphics").innerHTML = render_m
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
        graphics.fill_circle(n.p, simulation.diameter*1.5, colors[n.z])
    }
    document.getElementById("nodes_count").innerHTML = simulation.nodes_count()
}
const data = {
    mouse: {},
    times: [],
    previous_state: null,
}
const simulation = await Vellipsis.create({
    crdv: 70.0,
    crdp: 0.0,
    crdv2: 0.2,
    crdp2: 0.0,
    diameter: 0.008,
    gravity: 0.0,
    central_gravity: -0.00009,
    ticker: 1,
    friction_ratio: 0.3,
    max_speed: 0.01,
})
for (let index = 0; index < 5000; index++) {
    simulation.add_node(Math.random()*0.3-0.15, Math.random()*0.3-0.15, false)
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
graphics.draw_zoom = 0.8
graphics.context.canvas.addEventListener('mousemove', update_mouse(graphics, simulation))
graphics.context.canvas.addEventListener('mousedown', () => {
    data.add_node = true
})
graphics.context.canvas.addEventListener('mouseup', () => {
    data.add_node = false
})
tick(simulation, graphics)
