import { link } from "./link.js";
import { node } from "./node.js";

let draw_center = [0, 0]
let draw_zoom = 1.


const set_draw_center = (a) => {
    draw_center[0] = a.x
    draw_center[1] = a.y
}


const control_point = (view, idx, item_size) => {
    const i = idx * item_size;
    return {
        x: view.getFloat64(i, true),
        y: view.getFloat64(i+8, true),
    }
}

const render = (wasm, s, context, mouse, custom_render) => {
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
        // fill_circle(context, {x:n.p.x-n.dv.x*3.5, y:n.p.y-n.dv.y*3.5}, s.diameter*1.3, colors[n.z])
        // fill_circle(context, {x:n.p.x-n.dv.x*7, y:n.p.y-n.dv.y*7}, s.diameter*1.0, colors[n.z])
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
    drawer.context = context
    custom_render(drawer)
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

  const resize = (canvas) => {
    canvas.width = window.innerWidth 
    canvas.height = window.innerHeight 
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

const min_dim = (context) => {
    return Math.min(context.canvas.width, context.canvas.height)
}


const text = (context, p, txt) => {
    context.font = "12px Arial";
    const cc = context_coordinates(context, p)
    context.fillStyle = "#eee";
    context.fillText(txt, cc.x, cc.y); 
    context.font = "11px Arial";
    // const cc = context_coordinates(context, p)
    context.fillStyle = "#222";
    context.fillText(txt, cc.x, cc.y); 
}


const drawer = {
    fill_circle: fill_circle,
    line: line,
    text: text,
}

export {
    render,
    resize,
    context_coordinates_2,
    set_draw_center,
}