import { level_001 } from "./level/001.js";
import { level_002 } from "./level/002.js";
import { level_003 } from "./level/003.js";
import { level_004 } from "./level/004.js";
import { level_005 } from "./level/005.js";
import { level_006 } from "./level/006.js";
import { level_007 } from "./level/007.js";
import { level_008 } from "./level/008.js";
import { level_009 } from "./level/009.js";
import { level_010 } from "./level/010.js";
import { level_011 } from "./level/011.js";
import { level_012 } from "./level/012.js";
import { level_013 } from "./level/013.js";
import { level_014 } from "./level/014.js";
import { node } from "./node.js";
import { link } from "./link.js";
import { test } from "./test.js";
import init, {Simulation} from "./wasm_engine.js";


let draw_zoom = 0.036
let draw_center = [1.55, 0.65]


init().then( async (wasm) => {
    test(wasm, Simulation)
    main(wasm);
})


const mouse = {}
let redo_beziers = 0


const main = (wasm) => {
    document.body.innerHTML = `
        <canvas id="canvas"></canvas>
        <div id="right">
            <div id="infos">
                <p>x: <span id="x"></span></p>
                <p>y: <span id="y"></span></p>
                <p>x2: <span id="x2"></span></p>
                <p>y2: <span id="y2"></span></p>
                <p>physic: <span id="physic"></span></p>
                <p>nodes: <span id="nodes_count"></span></p>
            </div>
            <div id="sliders"></div>
        </div>
    `
    const canvas = document.getElementById("canvas")
    const context = canvas.getContext("2d")
    resize(canvas)
    // const level = level_001(Simulation)
    // const level = level_003(Simulation)
    const level = level_004(Simulation) // 3 wheel drive
    // const level = level_005(Simulation)
    // const level = level_006(Simulation)
    // const level = level_007(Simulation)
    // const level = level_008(Simulation)
    // const level = level_009(Simulation)
    // const level = level_010(Simulation, wasm)
    // const level = level_011(Simulation, wasm)
    // const level = level_012(Simulation, wasm)
    // const level = level_013(Simulation, wasm)
    // const level = level_014(Simulation, wasm)
    draw_zoom = level.draw_zoom
    draw_center = level.draw_center
    canvas.addEventListener("mousemove", (a) => {
        mouse.canvas_p = {
            x: a.clientX,
            y: a.clientY
        }
        mouse.p = context_coordinates_2(context, mouse.canvas_p)
        document.getElementById("x").innerHTML = mouse.canvas_p.x
        document.getElementById("y").innerHTML = mouse.canvas_p.y
        document.getElementById("x2").innerHTML = mouse.p.x.toFixed(2)
        document.getElementById("y2").innerHTML = mouse.p.y.toFixed(2)
        level.simulation.set_mouse(mouse.p.x, mouse.p.y)
        if (a.buttons == 1) {
            redo_beziers = 1
            level.simulation.update_control_point(
                level.simulation.focused_cp, 
                mouse.p.x, 
                mouse.p.y,
            )
        } else {
            if (redo_beziers == 1) {
                redo_beziers = 0
                level.simulation.redo_beziers();
                level.simulation.add_node(0.95, -0., false)
            }
        }
    })
    render(wasm, level.simulation, context, mouse)
    tick(wasm, level.simulation, context, level.stepper)
}

const control_point = (view, idx, item_size) => {
    const i = idx * item_size;
    return {
        x: view.getFloat64(i, true),
        y: view.getFloat64(i+8, true),
    }
}


const render = (wasm, s, context) => {
    const nodes_ptr = s.nodes_ptr();
    const node_size = s.node_size();
    const nodes_count = s.nodes_count()
    const nodes_view = new DataView(wasm.memory.buffer, nodes_ptr, s.nodes_size());
    const links_ptr = s.links_ptr();
    const link_size = s.link_size();
    const links_count = s.links_count()
    const links_view = new DataView(wasm.memory.buffer, links_ptr, s.links_size());
    const control_points_ptr = s.control_points_ptr();
    const control_point_size = s.control_point_size();
    const control_points_count = s.control_points_count()
    const control_points_view = new DataView(wasm.memory.buffer, control_points_ptr, s.control_points_size());
    clear(context)
    const colors = ["#ddd", "#ff4", "#4ff"]
    for (let index = 0; index < links_count; index++) {
        let l = link(links_view, index, link_size, nodes_view, node_size);
        line(context, l.a.p, l.b.p, "#ddd", 1)
    }
    for (let index = 0; index < nodes_count; index++) {
        let n = node(nodes_view, index, node_size);
        fill_circle(context, n.p, s.diameter*1.5, colors[n.z])
        fill_circle(context, {x:n.p.x-n.dv.x*3.5, y:n.p.y-n.dv.y*3.5}, s.diameter*1.3, colors[n.z])
        fill_circle(context, {x:n.p.x-n.dv.x*7, y:n.p.y-n.dv.y*7}, s.diameter*1.0, colors[n.z])
    }
    for (let index = 0; index < control_points_count; index++) {
        let cp = control_point(control_points_view, index, control_point_size);
        fill_circle(context, cp, s.diameter*2, "#ff08")
    }
    if (s.focused_cp !== undefined) {
        let cp = control_point(control_points_view, s.focused_cp, control_point_size);
        fill_circle(context, cp, s.diameter*3, "#ff0")
    }
    document.getElementById("nodes_count").innerHTML = nodes_count
}


const tick = (wasm, s, context, stepper) => {
    const start = performance.now()
    s.tick()
    const d = performance.now() - start
    let m = `${d} ms`
    if (d < 10) {
        m = `0${m}`
    }
    document.getElementById("physic").innerHTML = m
    stepper()
    render(wasm, s, context)
    requestAnimationFrame(() => {
        tick(wasm, s, context, stepper)
    })
}


const resize = (canvas) => {
    canvas.width = window.innerWidth 
    canvas.height = window.innerHeight 
}

const min_dim = (context) => {
    return Math.min(context.canvas.width, context.canvas.height)
}


const context_coordinates = (context, p) => {
  return {
    x: min_dim(context) * ((p.x - draw_center[0]) * draw_zoom + 0.5) + (context.canvas.width - min_dim(context))*0.5,
    y: context.canvas.height - min_dim(context) * ((p.y - draw_center[1]) * draw_zoom + 0.5) - (context.canvas.height - min_dim(context))*0.5,
  }
}


const context_coordinates_2 = (context, p) => {
    return {
        x: ((p.x - (context.canvas.width - min_dim(context))*0.5) / min_dim(context) - 0.5) / draw_zoom + draw_center[0],
        y: ((p.y - context.canvas.height + (context.canvas.height - min_dim(context))*0.5) / min_dim(context) * (-1) - 0.5) / draw_zoom + draw_center[1]
    }
  }


const fill_circle = (context, p, diameter, color) => {
    const cc = context_coordinates(context, p)
    const radius = diameter * min_dim(context) * 0.5 * draw_zoom;
    context.beginPath();
    context.arc(cc.x, cc.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
}


const line = (context, p1, p2, color, line_width) => {
    const cc1 = context_coordinates(context, p1)
    const cc2 = context_coordinates(context, p2)
    context.beginPath();
    context.moveTo(cc1.x, cc1.y);
    context.lineTo(cc2.x, cc2.y);
    context.strokeStyle = color;
    context.lineWidth = line_width?line_width:2;
    context.stroke();
  }


const clear = (context) => {
    context.clearRect(0,0,context.canvas.width, context.canvas.height)
    // context.fillStyle = '#00000020';
    // context.fillRect(0,0,context.canvas.width, context.canvas.height);
}
