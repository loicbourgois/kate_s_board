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
const tools = {
    add_node: (simulation, graphics) => {
        simulation.add_node(
            data.mouse.p.x, 
            data.mouse.p.y, 
            false
        )
    }
}
const click = (graphics, simulation ) => {
    return () => {
        tools[data.tool](simulation, graphics)
    }
}
const tick = (simulation, graphics) => {
    const simulation_start = performance.now()
    if (data.status == 'playing') {
        simulation.tick()
    }
    document.getElementById("physic").innerHTML = get_elapsed_formatted(simulation_start)
    const render_start = performance.now()
    render(simulation, graphics)
    document.getElementById("graphics").innerHTML = get_elapsed_formatted(render_start)
    requestAnimationFrame(() => {
        tick(simulation, graphics)
    })
}
const render = (simulation, graphics) => {
    graphics.clear_partial()
    for (const l of simulation.links()) {
        graphics.line(l.a.p, l.b.p, "#ddd", 2)
    }
    for (const n of simulation.nodes()) {
        graphics.fill_circle(n.p, simulation.diameter, data.colors[n.z])
    }
    document.getElementById("nodes_count").innerHTML = simulation.nodes_count()
}
const data = {
    mouse: {},
    times: [],
    previous_state: null,
    status: 'paused',
    colors: ["#ddd", "#ff4", "#4ff"],
    tool: 'add_node',
}
const simulation = await Vellipsis.create({
    crdv: 1.0,
    crdp: 1.0,
    crdv2: 0.0,
    crdp2: 0.0,
    diameter: 0.02,
    gravity: 0.0,
    central_gravity: 0.0,
    ticker: 1,
    friction_ratio: 0.0,
    max_speed: 1.0,
})
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
            <p>status: <span id="status"></span></p>
        </div>
    </div>
    <canvas id="canvas"></canvas>
`
const graphics = new Graphics("canvas")
graphics.resize_canvas()
graphics.draw_zoom = 1.0
document.addEventListener('mouseover', update_mouse(graphics, simulation), false)
graphics.context.canvas.addEventListener('mousemove', update_mouse(graphics, simulation))
graphics.context.canvas.addEventListener('click', click(graphics, simulation))
// graphics.context.canvas.addEventListener('mousedown', mousedown(graphics, simulation))
// graphics.context.canvas.addEventListener('mouseup', mouseup(graphics, simulation))
tick(simulation, graphics)
