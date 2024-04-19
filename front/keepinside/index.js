
import { Vellipsis } from "../vellipsis/vellipsis.js";
import { Graphics } from "../vellipsis/graphics.js"
import {
    rotate,
    crossing_segments,
} from "../vellipsis/math.js"
const get_scores_txt = (times) => {
    let aa = ""
    const scores = []
    for (const xx of times) {
        scores.push(parseInt(xx.end - xx.start))
    }
    scores.sort(function(a, b) {
        return a - b;
      });
    for (const score of scores) {
        aa = `<p>  ${score}</p>` + aa
    }
    return aa
}
const make_circle = (c, s, center) => {
    let circonference = c * s.diameter
    let radius = circonference  / Math.PI * 0.25
    const ids = []
    ids.push(s.add_node_3(JSON.stringify({
        x: radius+center[0],
        y: 0.0+center[1],
        turbo_max_speed: 0.0,
        fixed: false,
    })))
    let base_length = s.diameter * 1.2
    let link_strength = 1
    let link_damping = 300
    for (let index = 1; index < c; index++) {
        let p = rotate({x:radius+center[0], y:center[1]}, {x:center[0], y:center[1]}, index/c)
        ids.push(s.add_node_3(JSON.stringify({
            x: p.x,
            y: p.y,
            turbo_max_speed: 0.0,
            fixed: false,
        })))
        s.add_link(ids[index-1], ids[index], base_length, link_strength, link_damping)
    }
    s.add_link(ids[c-1], ids[0], base_length, link_strength, link_damping)
}
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
    let cross_count = 0
    let color = "#ddd"
    if (data.mouse.p) {
        const l1 = {
            a: {
                x: 100,
                y: 100,
            },
            b: data.mouse.p,
        }
        for (const l of simulation.links()) {
            const l2 = {
                a: l.a.p,
                b: l.b.p,
            }
            if (crossing_segments(l1, l2)) {
                cross_count += 1
            }
        }
        const inside = cross_count%2
        if (inside) {
            color = "#8f8"
            if (data.previous_state != 'inside') {
                data.times.push({
                    start: performance.now(),
                })
                data.previous_state = 'inside'
            }
            data.times[data.times.length-1].end = performance.now()
            simulation.tick()
        } else {
            color = "#ff8"
            data.previous_state = 'outside'
        }
    }
    document.getElementById("cross_count").innerHTML = cross_count
    if (data.times.length) {
        document.getElementById("scores").innerHTML = get_scores_txt(data.times)
    } else {
        document.getElementById("scores").innerHTML = "Keep the mouse inside"
    }
    const d = performance.now() - start
    let m = `${d} ms`
    if (d < 10) {
        m = `0${m}`
    }
    document.getElementById("physic").innerHTML = m
    render(simulation, graphics, color)
    requestAnimationFrame(() => {
        tick(simulation, graphics)
    })
}
const render = (simulation, graphics, color) => {
    graphics.clear_partial()
    for (const l of simulation.links()) {
        graphics.line(l.a.p, l.b.p, color, 2)
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
    crdv2: 1.1,
    crdp2: 1.1,
    diameter: 0.005,
    gravity: 0.0,
    central_gravity: -0.00000001,
    ticker: 10,
    friction_ratio: 0.3,
    max_speed: 0.001,
})
document.body.innerHTML = `
    <div id="left">
        <div id="hidden_infos">
            <p>x: <span id="x"></span></p>
            <p>y: <span id="y"></span></p>
            <p>x2: <span id="x2"></span></p>
            <p>y2: <span id="y2"></span></p>
            <p>physic: <span id="physic"></span></p>
            <p>nodes: <span id="nodes_count"></span></p>
            <p>cross: <span id="cross_count"></span></p>
        </div>
        <div id="infos">
            <div id="scores"></div>
        </div>
    </div>
    <canvas id="canvas"></canvas>
`
const graphics = new Graphics("canvas")
document.addEventListener('mouseover', update_mouse(graphics, simulation), false)
graphics.resize_canvas()
make_circle(1000, simulation, [-0., 0.])
graphics.context.canvas.addEventListener('mousemove', update_mouse(graphics, simulation))
tick(simulation, graphics)
