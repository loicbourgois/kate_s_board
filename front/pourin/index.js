import { Vellipsis } from "../vellipsis/vellipsis.js";
import { Graphics } from "../vellipsis/graphics.js"
import { get_elapsed_formatted } from "../vellipsis/utils.js"
import { 
    delta,  
    normalize,
    distance,
} from "../vellipsis/math.js"
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
const colors = ["#add2", "#4ff8", "#F44"]
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
    crdv: 0.25,
    crdp: 10.0,
    diameter: 0.01,
    gravity: 0.000005,
    central_gravity: 0.0,
    ticker: 3,
    friction_ratio: 0.0,
    max_speed: 0.5,
})
simulation.add_kind('glass', 1.0)
simulation.add_kind('water', 1.0)
simulation.add_interaction({
    k1: 'glass',
    k2: 'water',
    crdv: 0.5,
    crdp: 10.0,
    friction_ratio: 0.0,
})
simulation.add_interaction({
    k1: 'water',
    k2: 'water',
    crdv: 0.25,
    crdp: 10.0,
    friction_ratio: 0.0,
})
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
    add_static_line('glass', -width/2+c.x, -0.2, width/2+c.x, -0.2)
    add_static_line('glass', -width/2+c.x, -0.2, -width/2+c.x, 0.32)
    add_static_line('glass', width/2+c.x, -0.2, width/2+c.x, 0.32)
    for (let y = 0; y < c.height-0.001; y+=simulation.diameter) {
        simulation.add_node_js({
            x: c.x+Math.random()*0.001,
            y: y-0.19,
            kind: 'water',
            fixed: false,
        })
    }
    simulation.add_node_js({
        x: c.x+c.width*0.5+simulation.diameter,
        y: c.height-0.2,
        kind: 'water',
        fixed: true,
    })
}
add_stack({
    width: 0.17,
    height: 9.0,
    x: 0,
})
document.body.innerHTML = `
    <div id="left">
        <div id="infos">
            <p>x: <span id="s0-x"></span></p>
            <p>y: <span id="s0-y"></span></p>
            <p>x2: <span id="s0-x2"></span></p>
            <p>y2: <span id="s0-y2"></span></p>
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
const graphics = new Graphics("canvas", 1.0, "s0")
graphics.draw_center = [0.0, 0.1]
tick(simulation, graphics)