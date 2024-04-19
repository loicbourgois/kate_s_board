
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
    for (const m of [
        m1, 
        m2, m2_2, 
        m3,
    ]) {
        m.run(simulation, m)
    }
    const d = performance.now() - start
    let m = `${d} ms`
    if (d < 10) {
        m = `0${m}`
    }
    document.getElementById("physic").innerHTML = m
    render(simulation, graphics)
    requestAnimationFrame(() => {
        tick(simulation, graphics)
    })
}
const colors = ["#ddd", "#ff4", "#4ff"]
const render = (simulation, graphics) => {
    graphics.clear()
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
    crdv: 8.0,
    crdp: 1.0,
    crdv2: 0.01,
    crdp2: 0.001,
    diameter: 0.008,
    gravity: 0.0000008,
    central_gravity: 0.0,
    ticker: 5,
    friction_ratio: 0.3,
    max_speed: 0.001,
})
simulation.add_bezier(
    JSON.stringify([
        {
            x: -0.5,
            y: 0.4,
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
    y: .5,
}
const b = {
    x: 0.05,
    y: .5,
}
const c = {
    x: 0.15,
    y: .5,
}
const w1 = simulation.add_wheel(a, 12)
const w2 = simulation.add_wheel(b, 12)
const w3 = simulation.add_wheel(c, 12)
const i2 = simulation.add_link(w1.cidx, w2.cidx, 0.1, 0.5, 10.0)
const i3 = simulation.add_link(w2.cidx, w3.cidx, 0.1, 0.5, 10.0)
const m1 = simulation.add_motor(w1, w2.cidx, 0.25)
const m2 = simulation.add_motor(w2, w1.cidx, 0.75)
const m2_2 = simulation.add_motor(w2, w3.cidx, 0.25)
const m3 = simulation.add_motor(w3, w2.cidx, 0.75)
for (let index = 0; index < 400; index++) {
    simulation.add_node(Math.random()*0.2 - 0.15, Math.random()*0.2 + 0.25, false)
}
document.body.innerHTML = `
    <div id="left">
        <div id="infos">
            <p>x: <span id="x"></span></p>
            <p>y: <span id="y"></span></p>
            <p>x2: <span id="x2"></span></p>
            <p>y2: <span id="y2"></span></p>
            <p>physic: <span id="physic"></span></p>
            <p>nodes: <span id="nodes_count"></span></p>
        </div>
    </div>
    <canvas id="canvas"></canvas>
`
const graphics = new Graphics("canvas")
document.addEventListener('mouseover', update_mouse(graphics, simulation), false)
graphics.resize_canvas()
graphics.draw_center = [0,0.3]
graphics.context.canvas.addEventListener('mousemove', update_mouse(graphics, simulation))
// graphics.context.canvas.addEventListener('click', click(simulation))
graphics.context.canvas.addEventListener('mousedown', () => {
    data.add_node = true
})
graphics.context.canvas.addEventListener('mouseup', () => {
    data.add_node = false
})
tick(simulation, graphics)
