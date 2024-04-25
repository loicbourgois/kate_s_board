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
const get_kind = () => {
    if (Math.random() > 0.5) {
        return 'fire_1'
    }  else {
        return 'fire_2'
    }
}
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
const config = [
    {
        kind: 'rock',
        color: '#422',
        density: 1.0,
    },
    {
        kind: 'water',
        color: '#4ff8',
        density: 1.0,
    }
]
const reservoir = {
    p1: {
        x: -0.29,
        y: 0.01,
    },
    p2: {
        x: -0.2,
        y: 0.19,
    }
}
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
        if (n.p.y < -0.4) {
            simulation.delete_node(n.idx)
            const x = Math.random() * Math.abs(reservoir.p1.x - reservoir.p2.x)*0.9 +  Math.min(reservoir.p1.x, reservoir.p2.x)
            const y = Math.random() * Math.abs(reservoir.p1.y - reservoir.p2.y)*0.9 +  Math.min(reservoir.p1.y, reservoir.p2.y)
            simulation.add_node_js({
                x: x,
                y: y,
                kind: 'water',
                fixed: false,
            })
        }
        let color = config[n.kind].color
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
    crdv: 20.0,
    crdp: 0.01,
    crdv2: 0.0,
    crdp2: 0.0,
    diameter: 0.01,
    gravity: 0.00005,
    central_gravity: 0.0,
    ticker: 1,
    friction_ratio: 0.0,
    max_speed: 0.05,
})
for (const x of config) {
    simulation.add_kind(x.kind, x.density)
}
const add_static_line = (c) => {
    const p1 = c.p1
    const p2 = c.p2
    const delt = delta(p1, p2)
    const dist = distance(p1, p2)
    const n = normalize(delt)
    const v = {
        x: n.x * simulation.diameter * c.ratio,
        y: n.y * simulation.diameter * c.ratio,
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
const add_rect = (c) => {
    const xmin = Math.min(c.p1.x, c.p2.x)
    const xmax = Math.max(c.p1.x, c.p2.x)
    const ymin = Math.min(c.p1.y, c.p2.y)
    const ymax = Math.max(c.p1.y, c.p2.y)
    for (let x = xmin; x < xmax; x+=simulation.diameter*c.ratio) {
        for (let y = ymin; y < ymax; y+=simulation.diameter*c.ratio) {
            simulation.add_node_js({
                x: x,
                y: y,
                kind: c.kind,
                fixed: false,
            })
        }
    }
}
const ratio_line = 0.1
add_static_line({
    kind: 'rock',
    ratio: ratio_line,
    p1: {
        x: -0.3,
        y: 0.2,
    },
    p2: {
        x: -0.3,
        y: 0.0,
    }
})
add_static_line({
    kind: 'rock',
    ratio: ratio_line,
    p1: {
        x: -0.3,
        y: 0.2,
    },
    p2: {
        x: -0.2,
        y: 0.2,
    }
})
add_static_line({
    kind: 'rock',
    ratio: ratio_line,
    p1: {
        x: -0.2,
        y: 0.2,
    },
    p2: {
        x: -0.2,
        y: 0.0,
    }
})
add_static_line({
    kind: 'rock',
    ratio: ratio_line,
    p1: {
        x: -0.3,
        y: 0.,
    },
    p2: {
        x: -0.15,
        y: -0.15,
    }
})
add_static_line({
    kind: 'rock',
    ratio: ratio_line,
    p1: {
        x: -0.2,
        y: 0.,
    },
    p2: {
        x: -0.15,
        y: -0.1,
    }
})
add_static_line({
    kind: 'rock',
    ratio: ratio_line,
    p1: {
        x: -0.,
        y: -0.1,
    },
    p2: {
        x: -0.15,
        y: -0.15,
    }
})
add_static_line({
    kind: 'rock',
    ratio: ratio_line,
    p1: {
        x: -0.15,
        y: -0.1,
    },
    p2: {
        x: -0.,
        y: -0.05,
    }
})
add_rect({
    kind: 'water',
    ratio: 0.4,
    p1: {
        x: -0.29,
        y: 0.01,
    },
    p2: {
        x: -0.2,
        y: 0.19,
    }
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
graphics.draw_zoom = 1.
graphics.context.canvas.addEventListener('mousemove', update_mouse(graphics, simulation))
graphics.context.canvas.addEventListener('mousedown', () => {
    data.add_node = true
})
graphics.context.canvas.addEventListener('mouseup', () => {
    data.add_node = false
})
tick(simulation, graphics)