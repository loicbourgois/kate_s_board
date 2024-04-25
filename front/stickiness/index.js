
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
const colors = ["#f00", "#ff4", "#4ff"]
const render = (simulation, graphics) => {
    graphics.clear_partial()
    for (const n of simulation.nodes()) {
        graphics.fill_circle(n.p, simulation.diameter*1.5, colors[n.kind])
    }
    // for (const l of simulation.links()) {
    //     if (! (l.active==1) ) {
    //         continue
    //     }
    //     const limit = 0.4
    //     let aa = l.stress / limit
    //     let r = 1
    //     let g = 1
    //     if (aa > 0.5) {
    //         g = (1-aa) * 2
    //     }
    //     r = parseInt(r*255)
    //     g = parseInt(g*255)
    //     let b = parseInt(0)
    //     if (l.stress > limit ) {
    //         simulation.delete_link(l.idx, l.uid)
    //     }
    // }
    document.getElementById("nodes_count").innerHTML = simulation.nodes_count()
    document.getElementById("links_count").innerHTML = simulation.links_count()
    document.getElementById("links_inactive_count").innerHTML = simulation.links_inactive_count()
}
const data = {
    mouse: {},
    times: [],
    previous_state: null,
}
const simulation = await Vellipsis.create({
    crdv: 10.0,
    crdp: 0.2,
    crdv2: 0.0,
    crdp2: 0.0,
    diameter: 0.01,
    gravity: 0.00001,
    central_gravity: 0.0,
    ticker: 2,
    friction_ratio: 0.0,
    max_speed: 0.001,
})
simulation.add_kind('default', 1)
simulation.add_kind('glue', 1)
simulation.add_kind('wall', 1)
simulation.set_linking_config({
    kind_1: 'glue',
    kind_2: 'wall',
    strength: 40.3,
    stress_limit: 1.,
    damping: 1.0,
    length: simulation.diameter,
})
simulation.set_linking_config({
    kind_1: 'glue',
    kind_2: 'glue',
    strength: 2.,
    stress_limit: 1.,
    damping: 1.0,
    length: simulation.diameter,
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
    simulation.add_node_js({
        x: p1.x, 
        y: p1.y,
        kind: 'wall',
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
            kind: 'wall',
            fixed: true,
        })
        i++
    }
}
add_line({
    ab: [0.0, 0.0, -0.15, 0.0],
})
add_line({
    ab: [-0.3, -0.1, 0.2, -0.2],
})
add_line({
    ab: [-1, -0.6, 1, -0.6],
})
setInterval(()=> {
    simulation.add_node_js({
        x: 0.2,
        y: 0.5,
        dx: -0.001,
        dy: 0.001,
        kind: 'glue',
    })
    simulation.add_node_js({
        x: 0.1,
        y: 0.6,
        dx: -0.001,
        dy: 0.001,
        kind: 'default',
    })
}, 50)
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
            <p>links: <span id="links_count"></span></p>
            <p>inactive links: <span id="links_inactive_count"></span></p>
        </div>
    </div>
    <canvas id="canvas"></canvas>
`
const graphics = new Graphics("canvas")
document.addEventListener('mouseover', update_mouse(graphics, simulation), false)
graphics.resize_canvas()
graphics.draw_zoom = 0.7
graphics.context.canvas.addEventListener('mousemove', update_mouse(graphics, simulation))
graphics.context.canvas.addEventListener('mousedown', () => {
    data.add_node = true
})
graphics.context.canvas.addEventListener('mouseup', () => {
    data.add_node = false
})
tick(simulation, graphics)
