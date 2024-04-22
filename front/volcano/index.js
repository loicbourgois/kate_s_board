
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
            kind: get_kind(),
        })
    }
    simulation.add_node_js({
        x: 0.01 + 0.001 * (Math.random() -0.5),
        y: 0.01, 
        dx: -0.00,
        dy: 0.001,
        kind: get_kind(),
    })
    simulation.add_node_js({
        x: -0.01 + 0.001 * (Math.random() -0.5),
        y: 0.01, 
        dx: -0.00,
        dy: 0.001,
        kind: get_kind(),
    })
    simulation.tick()
    document.getElementById("physic").innerHTML = get_elapsed_formatted(start)
    const render_start = performance.now()
    render(simulation, graphics)
    document.getElementById("graphics").innerHTML = get_elapsed_formatted(render_start)
    requestAnimationFrame(() => {
        tick(simulation, graphics)
    })
}
const colors = ["#525657", "#ff4", "#F44"]
const render = (simulation, graphics) => {
    graphics.clear_partial()
    for (const n of simulation.nodes()) {
        if ( n.active!==1 ) {
            continue
        }
        if (isNaN(n.p.x)) {
            simulation.delete_node(n.idx)
            console.error(n)
            // throw "isNaN(p.n.x)"
        }
        if (n.p.y < -0.5) {
            simulation.delete_node(n.idx)
        }
        graphics.fill_circle(n.p, simulation.diameter*1.5, colors[n.kind])
    }
    for (const l of simulation.links()) {
        if ( l.active!==1 ) {
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
        if (l.stress > limit ) {
            simulation.delete_link(l.idx, l.uid)
        }
    }
    document.getElementById("nodes_count").innerHTML = simulation.nodes_count()
    document.getElementById("links_count").innerHTML = simulation.links_count()
    document.getElementById("links_inactive_count").innerHTML = simulation.links_inactive_count()
    document.getElementById("nodes_inactive_count").innerHTML = simulation.nodes_inactive_count()
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
simulation.add_kind('rock')
simulation.add_kind('fire_1')
simulation.add_kind('fire_2')
simulation.set_friction_ratio('fire_2', 'fire_2', 1.)
simulation.set_friction_ratio('fire_1', 'fire_1', 1.)
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


const aa = 0.75

add_line({
    ab: [-aa, -0.2, -0.1, -0.2],
    kind: 'rock'
})
add_line({
    ab: [aa, -0.2, 0.1, -0.2],
    kind: 'rock'
})


add_line({
    ab: [-0.05, -0.1, -0.1, -0.2],
    kind: 'rock'
})
add_line({
    ab: [0.05, -0.1, 0.1, -0.2],
    kind: 'rock'
})

add_line({
    ab: [-0.05, -0.1, -0.03, 0.02],
    kind: 'rock'
})
add_line({
    ab: [0.05, -0.1, 0.03, 0.02],
    kind: 'rock'
})
add_line({
    ab: [0.02, 0.0, 0.03, 0.02],
    kind: 'rock'
})
add_line({
    ab: [-0.02, 0.0, -0.03, 0.02],
    kind: 'rock'
})
add_line({
    ab: [0.02, 0.0, -0.02, 0.0],
    kind: 'rock'
})
add_line({
    ab: [0.02, 0.0, -0.02, 0.0],
    kind: 'rock'
})
add_line({
    ab: [0.02, 0.0, -0.02, 0.0],
    kind: 'rock'
})
// add_line({
//     ab: [0.02, -0.001, -0.01, -0.001],
//     kind: 'rock'
// })
// add_line({
//     ab: [0.02, -0.002, -0.01, -0.002],
//     kind: 'rock'
// })
// add_line({
//     ab: [-0.3, -0.1, 0.2, -0.2],
// })
// add_line({
//     ab: [-0.5, -0.3, 0.2, -0.4],
// })
// add_line({
//     ab: [0.5, -0.3, 0.2, -0.4],
// })
// add_line({
//     ab: [-1, -0.6, 1, -0.6],
// })

const get_kind = () => {
    if (Math.random() > 0.5) {
        return 'fire_1'
    }  else {
        return 'fire_2'
    }
}

// setInterval(()=> {
//     simulation.add_node_js({
//         x: 0.01 + 0.001 * (Math.random() -0.5),
//         y: 0.01, 
//         dx: -0.00,
//         dy: 0.001,
//         kind: get_kind(),
//     })
//     simulation.add_node_js({
//         x: -0.01 + 0.001 * (Math.random() -0.5),
//         y: 0.01, 
//         dx: -0.00,
//         dy: 0.001,
//         kind: get_kind(),
//     })
// }, 0)
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
