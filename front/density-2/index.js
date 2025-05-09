import { Vellipsis } from "../vellipsis/vellipsis.js";
import { Graphics } from "../vellipsis/graphics.js"
import { get_elapsed_formatted } from "../vellipsis/utils.js"
import { 
    delta,  
    normalize,
    distance,
    norm,
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
const get_kind = () => {
    if (Math.random() > 0.5) {
        return 'fire_1'
    }  else {
        return 'fire_2'
    }
}
const tick = (simulation, graphics) => {
    const start = performance.now()
    if (data.add_node) {
        simulation.add_node_js({
            x: data.mouse.p.x + Math.random() * simulation.diameter - simulation.diameter*0.5,
            y: data.mouse.p.y + Math.random() * simulation.diameter - simulation.diameter*0.5,
            kind: get_kind(),
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
const colors = ["#1110", "#4ff8", "#F448"]
const render_times = []
const render = (simulation, graphics) => {
    render_times.push(performance.now())
    while (render_times.length > 100) {
        render_times.shift()
    }
    graphics.clear_partial()
    for (const n of simulation.nodes()) {
        if ( n.active!==1 ) {
            continue
        }
        if (isNaN(n.p.x)) {
            simulation.delete_node(n.idx)
            console.error(n)
        }
        let color = colors[n.kind]
        graphics.fill_circle(n.p2, simulation.diameter*1.5, color)
    }
    document.getElementById("nodes_count").innerHTML = simulation.nodes_count()
    document.getElementById("links_count").innerHTML = simulation.links_count()
    document.getElementById("links_inactive_count").innerHTML = simulation.links_inactive_count()
    document.getElementById("nodes_inactive_count").innerHTML = simulation.nodes_inactive_count()
    document.getElementById("fps").innerHTML = (1/((render_times[render_times.length-1] - render_times[0])/(render_times.length-1)/1000)).toFixed(0)
}
const data = {
    mouse: {},
    times: [],
    previous_state: null,
}
const simulation = await Vellipsis.create({
    crdv: 100.0,
    crdp: 0.0,
    crdv2: 0.0,
    crdp2: 0.0,
    diameter: 0.01,
    gravity: 0.000005,
    central_gravity: 0.0,
    ticker: 1,
    friction_ratio: 0.0,
    max_speed: 0.005,
})
simulation.add_kind('rock', 1.0)
simulation.add_kind('fire_1', 1.0)
simulation.add_kind('fire_2', 0.5)
const add_static_line = (kind, a, b, c, d) => {
    const p1 = {
        x: a,
        y: b,
    }
    const p2 = {
        x: c,
        y: d,
    }
    const delt = delta(p1, p2)
    const dist = distance(p1, p2)
    const n = normalize(delt)
    const v = {
        x: n.x * simulation.diameter,
        y: n.y * simulation.diameter,
    }
    simulation.add_node_js({
        x: p1.x, 
        y: p1.y,
        kind: kind,
        fixed: true,
    })
    let i = 1
    while (true) {
        const p3 = {
            x: p1.x + v.x * i,
            y: p1.y + v.y * i,
        }
        if (distance(p1, p3) > dist) {
            break
        }
        simulation.add_node_js({
            x: p3.x,
            y: p3.y,
            kind: kind,
            fixed: true,
        })
        i++
    }
}
const add_stack = (c) => {
    const width = c.width
    for (let index = 0; index < 10; index++) {
        add_static_line('rock', -width/2+c.x, -0.2, width/2+c.x, -0.2)
        add_static_line('rock', -width/2+c.x, 0.42, width/2+c.x, 0.42)
        add_static_line('rock', -width/2+c.x, -0.2, -width/2+c.x, 0.42)
        add_static_line('rock', width/2+c.x, -0.2, width/2+c.x, 0.42)
    }
    for (let x = -c.width/2 + simulation.diameter; x < c.width / 2 * 0.99 ; x+=simulation.diameter*0.7) {
        for (let y = 0; y < c.height-0.001; y+=simulation.diameter*0.75) {
            simulation.add_node_js({
                x: c.x+Math.random()*0.001+x,
                y: y-0.19,
                kind: 'fire_2',
                fixed: false,
            })
            simulation.add_node_js({
                x: c.x+Math.random()*0.001+x,
                y: y-0.19 + c.height,
                kind: 'fire_1',
                fixed: false,
            })
        }
    }
}
add_stack({
    width: 0.5,
    height: 0.3,
    x: 0,
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
            <p>fps:      <span id="fps"></span></p>
            <p>nodes: <span id="nodes_count"></span></p>
            <p>inactive nodes: <span id="nodes_inactive_count"></span></p>
            <p>links: <span id="links_count"></span></p>
            <p>inactive links: <span id="links_inactive_count"></span></p>
        </div>
    </div>
    <canvas id="canvas"></canvas>
`
const graphics = new Graphics("canvas")
document.addEventListener('mouseover', update_mouse(graphics, simulation), false)
graphics.resize_canvas()
graphics.draw_zoom = 1
graphics.draw_center = [0.0, 0.1]
graphics.context.canvas.addEventListener('mousemove', update_mouse(graphics, simulation))
graphics.context.canvas.addEventListener('mousedown', () => {
    data.add_node = true
})
graphics.context.canvas.addEventListener('mouseup', () => {
    data.add_node = false
})
tick(simulation, graphics)