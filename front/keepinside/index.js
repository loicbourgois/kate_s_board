
import {init, Vellipsis} from "../vellipsis.js";
import {
    rotate,
    crossing_segments,
} from "../math.js"
import {
    context_coordinates_2,
    resize,
    set_draw_center,
    clear,
    line,
} from "../render.js"
import { link } from "../link.js";


let mouse = {}
let data = []
let previous_state = null


const tick = (wasm, s, context) => {
    const start = performance.now()
    s.tick()
    let cross_count = 0
    let color = "#ddd"
    if (mouse.p) {
        const l1 = {
            a: {
                x: 100,
                y: 100,
            },
            b: mouse.p,
        }
        for (const l of links(s, wasm)) {
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
            if (previous_state != 'inside') {
                data.push({
                    start: performance.now(),
                })
                previous_state = 'inside'
            }
            data[data.length-1].end = performance.now()
        } else {
            color = "#ff8"
            previous_state = 'outside'
        }
    }
    document.getElementById("cross_count").innerHTML = cross_count
    let aa = ""
    const scores = []
    for (const xx of data) {
        scores.push(parseInt(xx.end - xx.start))
    }
    scores.sort(function(a, b) {
        return a - b;
      });
    for (const score of scores) {
        aa = `<p>  ${score}</p>` + aa
    }
    document.getElementById("scores").innerHTML = aa
    const d = performance.now() - start
    let m = `${d} ms`
    if (d < 10) {
        m = `0${m}`
    }
    document.getElementById("physic").innerHTML = m
    render(wasm, s, context, null, color)
    requestAnimationFrame(() => {
        tick(wasm, s, context)
    })
}


function* links(s, wasm) {
    const nodes_ptr = s.nodes_ptr();
    const node_size = s.node_size();
    const nodes_view = new DataView(wasm.memory.buffer, nodes_ptr, s.nodes_size());
    const links_ptr = s.links_ptr();
    const link_size = s.link_size();
    const links_count = s.links_count()
    const links_view = new DataView(wasm.memory.buffer, links_ptr, s.links_size());
    for (let index = 0; index < links_count; index++) {
        yield link(links_view, index, link_size, nodes_view, node_size);
    }
}


const render = (wasm, s, context, mouse, color) => {
    clear(context)
    for (const l of links(s, wasm)) {
        line(context, l.a.p, l.b.p, color, 2)
    }
    document.getElementById("nodes_count").innerHTML = s.nodes_count()
}


const make_circle = (c, s, center) => {
    let circonference = c * s.diameter
    let radius = circonference  / Math.PI * 0.25
    const ids = []
    const fixed = false
    // const fixed = true
    ids.push(s.add_node_3(JSON.stringify({
        x: radius+center[0],
        y: 0.0+center[1],
        turbo_max_speed: 0.0,
        fixed: fixed,
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
            fixed: fixed,
        })))
        s.add_link(ids[index-1], ids[index], base_length, link_strength, link_damping)
    }
    s.add_link(ids[c-1], ids[0], base_length, link_strength, link_damping)
}


const get_2d_context = (x) => {
    return document.getElementById("canvas").getContext("2d")
}

const update_mouse = (context, game) => {
    return (a) => {
        mouse.canvas_p = {
            x: a.clientX,
            y: a.clientY
        }
        mouse.p = context_coordinates_2(context, mouse.canvas_p)
        document.getElementById("x").innerHTML = mouse.canvas_p.x
        document.getElementById("y").innerHTML = mouse.canvas_p.y
        document.getElementById("x2").innerHTML = mouse.p.x.toFixed(2)
        document.getElementById("y2").innerHTML = mouse.p.y.toFixed(2)
        game.simulation.set_mouse(mouse.p.x, mouse.p.y)
    }
} 


const main = (wasm) => {
    document.body.innerHTML = `
        <div id="left">
            <div id="infos">
                <div id="scores"></div>
            </div>
            <div id="hidden_infos">
                <p>x: <span id="x"></span></p>
                <p>y: <span id="y"></span></p>
                <p>x2: <span id="x2"></span></p>
                <p>y2: <span id="y2"></span></p>
                <p>physic: <span id="physic"></span></p>
                <p>nodes: <span id="nodes_count"></span></p>
                <p>cross: <span id="cross_count"></span></p>
            </div>
        </div>
        <canvas id="canvas"></canvas>
    `
    const context = get_2d_context("canvas")
    resize(context.canvas)
    let simulation = Vellipsis.create(JSON.stringify({
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
    }))
    make_circle(1000, simulation, [-0., 0.])
    const game = {
        simulation: simulation,
        draw_zoom: 0.8,
        draw_center: {x: 0, y: 0},
    }
    set_draw_center(game.draw_center)
    document.addEventListener('mouseover', update_mouse(context, game), false)
    context.canvas.addEventListener("mousemove", update_mouse(context, game))
    tick(wasm, game.simulation, context)
}


init().then( async (wasm) => {
    main(wasm);
})
