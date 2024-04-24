
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
    if (simulation.step % 20 == 0) {
        simulation.add_node_js({
            x: 0.04 ,
            y: 0.2, 
            dx: -0.001,
            dy: 0.001,
            kind: 'water',
        })
        simulation.add_node_js({
            x: -0.04 ,
            y: 0.2, 
            dx: 0.001,
            dy: 0.001,
            kind: 'oil',
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
const colors = ["#f88", "#8dF", "#322"]
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
            // console.error(n)
        }
        if (n.p.y < -0.5) {
            simulation.delete_node(n.idx)
        }
        graphics.fill_circle(n.p, simulation.diameter*1.5, colors[n.kind])
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
    crdv: 1.0,
    crdp: 0.,
    crdv2: 0.0,
    crdp2: 0.0,
    diameter: 0.01,
    gravity: 0.000001,
    central_gravity: 0.0,
    ticker: 30,
    friction_ratio: 0.0,
    max_speed: 0.0001,
})
simulation.add_kind('oil')
simulation.add_kind('water')
simulation.add_kind('rock')
// simulation.set_linking_config({
//     kind_1: 'oil',
//     kind_2: 'oil',
//     strength: 0.3,
//     stress_limit: 0.4,
//     damping: 1.0,
//     length: simulation.diameter,
// })
// simulation.set_linking_config({
//     kind_1: 'water',
//     kind_2: 'water',
//     strength: 0.3,
//     stress_limit: 0.4,
//     damping: 1.0,
//     length: simulation.diameter,
// })
// simulation.set_linking_config({
//     kind_1: 'fire_1',
//     kind_2: 'fire_1',
//     strength: 0.3,
//     stress_limit: 0.4,
//     damping: 1.0,
//     length: simulation.diameter,
// })
// simulation.set_linking_config({
//     kind_1: 'fire_1',
//     kind_2: 'fire_2',
//     strength: -0.3,
//     stress_limit: 0.4,
//     damping: 1.0,
//     length: simulation.diameter,
// })
// simulation.set_linking_config({
//     kind_1: 'rock',
//     kind_2: 'fire_1',
//     strength: 0.3,
//     stress_limit: 0.4,
//     damping: 1.0,
//     length: simulation.diameter,
// })
// simulation.set_linking_config({
//     kind_1: 'rock',
//     kind_2: 'fire_2',
//     strength: 0.3,
//     stress_limit: 0.4,
//     damping: 1.0,
//     length: simulation.diameter,
// })
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
        kind: c.kind,
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
            kind: c.kind,
            fixed: true,
        })
        i++
    }
}


for (let index = 0; index < 3; index++) {
    add_line({
        ab: [0.2, -0.3, -0.2, -0.3],
        kind: 'rock'
    })
    add_line({
        ab: [0.2, -0.3, 0.1, 0.1],
        kind: 'rock'
    })
    add_line({
        ab: [-0.2, -0.3, -0.1, 0.1],
        kind: 'rock'
    })
    // add_line({
    //     ab: [aa, -0.2, 0.1, -0.2],
    //     kind: 'rock'
    // })
    
    
    // add_line({
    //     ab: [-0.05, -0.1, -0.1, -0.2],
    //     kind: 'rock'
    // })
    // add_line({
    //     ab: [0.05, -0.1, 0.1, -0.2],
    //     kind: 'rock'
    // })
    
    // add_line({
    //     ab: [-0.05, -0.1, -0.03, 0.02],
    //     kind: 'rock'
    // })
    // add_line({
    //     ab: [0.05, -0.1, 0.03, 0.02],
    //     kind: 'rock'
    // })
    // add_line({
    //     ab: [0.02, 0.0, 0.03, 0.02],
    //     kind: 'rock'
    // })
    // add_line({
    //     ab: [-0.02, 0.0, -0.03, 0.02],
    //     kind: 'rock'
    // })
    // add_line({
    //     ab: [0.02, 0.0, -0.02, 0.0],
    //     kind: 'rock'
    // })
    // add_line({
    //     ab: [0.02, 0.0, -0.02, 0.0],
    //     kind: 'rock'
    // })
    // add_line({
    //     ab: [0.02, 0.0, -0.02, 0.0],
    //     kind: 'rock'
    // })
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
graphics.draw_zoom = 1.2
graphics.context.canvas.addEventListener('mousemove', update_mouse(graphics, simulation))
graphics.context.canvas.addEventListener('mousedown', () => {
    data.add_node = true
})
graphics.context.canvas.addEventListener('mouseup', () => {
    data.add_node = false
})
tick(simulation, graphics)
