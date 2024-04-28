import { Vellipsis } from "../vellipsis/vellipsis.js";
import { Graphics } from "../vellipsis/graphics.js"
import { get_elapsed_formatted } from "../vellipsis/utils.js"
import { 
    delta,  
    normalize,
    distance,
    find_angle,
} from "../vellipsis/math.js"
import {
    add_ship
} from "./utils.js"
// const update_mouse = (graphics, simulation) => {
//     return (a) => {
//         data.mouse.canvas_p = {
//             x: a.clientX,
//             y: a.clientY
//         }
//         data.mouse.p = graphics.context_coordinates_2(data.mouse.canvas_p)
//         document.getElementById("x").innerHTML = data.mouse.canvas_p.x
//         document.getElementById("y").innerHTML = data.mouse.canvas_p.y
//         document.getElementById("x2").innerHTML = data.mouse.p.x.toFixed(2)
//         document.getElementById("y2").innerHTML = data.mouse.p.y.toFixed(2)
//         simulation.set_mouse(data.mouse.p.x, data.mouse.p.y)
//     }
// }
const tick = (simulation, graphics) => {
    const start = performance.now()
    simulation.tick()
    document.getElementById("physic").innerHTML = get_elapsed_formatted(start)
    const render_start = performance.now()
    render(simulation, graphics)
    drive(graphics, simulation, ships[0])
    document.getElementById("graphics").innerHTML = get_elapsed_formatted(render_start)
    requestAnimationFrame(() => {
        tick(simulation, graphics)
    })
}
const config = [
    {
        kind: 'metal',
        color: '#ff8',
        density: 1.0,
    },
]
const render_times = []
const render = (simulation, graphics) => {
    render_times.push(performance.now())
    while (render_times.length > 100) {
        render_times.shift()
    }
    graphics.clear()
    let aa = 0;
    for (const p of targets) {
        graphics.fill_circle({
            x: p[0],
            y: p[1],
        }, simulation.diameter*1.4, "#080")
        graphics.text({
            x: p[0],
            y: p[1],
        }, `${aa}`)
        aa += 1
    }
    for (const ship of ships) {
        graphics.fill_circle(ship.target, simulation.diameter*1.4, "#0f0")
        graphics.fill_circle(ship.next_target, simulation.diameter*1.4, "#0b0")
    }
    for (const n of simulation.nodes()){
        if (Math.abs(n.turbo_rate) > 0.1) {
            const r = 0.005+Math.random()*0.003
            const r2 = 0.004+Math.random()*0.001
            const p = {
                x: n.p2.x + n.direction.x * r,
                y: n.p2.y + n.direction.y * r,
            }
            const p2 = {
                x: n.p2.x + n.direction.x * r2,
                y: n.p2.y + n.direction.y * r2,
            }
            graphics.fill_circle(p, simulation.diameter*0.7, "#f00")
            graphics.fill_circle(p2, simulation.diameter*0.9, "#f80")
        }
    }
    for (const n of simulation.nodes()) {
        if ( n.active!==1 ) {
            continue
        }
        if (isNaN(n.p.x)) {
            simulation.delete_node(n.idx)
            console.error(n)
        }
        let color = config[n.kind].color
        graphics.fill_circle(n.p2, simulation.diameter*1.4, color)
    }
    document.getElementById("nodes_count").innerHTML = simulation.nodes_count()
    document.getElementById("links_count").innerHTML = simulation.links_count()
    document.getElementById("links_inactive_count").innerHTML = simulation.links_inactive_count()
    document.getElementById("nodes_inactive_count").innerHTML = simulation.nodes_inactive_count()
    document.getElementById("fps").innerHTML = (1/((render_times[render_times.length-1] - render_times[0])/(render_times.length-1)/1000)).toFixed(0)
}
// const data = {
//     mouse: {},
//     times: [],
//     previous_state: null,
// }
const simulation = await Vellipsis.create({
    crdv: 8.0,
    crdp: 1.0,
    crdv2: 0.0,
    crdp2: 0.0,
    diameter: 0.008,
    gravity: 0.0,
    ticker: 10,
    friction_ratio: 0.0,
    max_speed: 0.5,
    central_gravity: 0.0,
})
for (const x of config) {
    simulation.add_kind(x.kind, x.density)
}
for (const x of config) {
    for (const y of config) {
        simulation.add_interaction({
            k1: x.kind,
            k2: y.kind,
            crdv: 1.0,
            crdp: 1.0,
            friction_ratio: 0.0,
        })
    }
}
document.body.innerHTML = `
    <div id="left">
        <div id="infos">
            <p>x: <span id="-x"></span></p>
            <p>y: <span id="-y"></span></p>
            <p>x2: <span id="-x2"></span></p>
            <p>y2: <span id="-y2"></span></p>
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
const graphics = new Graphics("canvas", 1, "")
// document.addEventListener('mouseover', update_mouse(graphics, simulation), false)
graphics.resize_canvas()
graphics.draw_zoom = 1.5
// graphics.context.canvas.addEventListener('mousemove', update_mouse(graphics, simulation))
// graphics.context.canvas.addEventListener('mousedown', () => {
//     data.add_node = true
// })
// graphics.context.canvas.addEventListener('mouseup', () => {
//     data.add_node = false
// })

const ship_str = `
         *---*
        /\\ /\\
   t---*---1---*---t
  /\\ /\\ /\\ /\\ /\\
 t---*---2---3---*---t
 \\ /            \\ /
   t               t
`.replaceAll("\\"," \\")
let ships = []
const targets = [
    [0.125, 0.125],
    [-0.125, 0.125],
    [-0.125, -0.125],
    [0.125, -0.125],
]
let ti = 0
const drive = (graphics, s, ship) => {
    const scm = s.get_position(ship.id) // ship center of mass
    const scmp = s.get_previous_position(ship.id) // ship center of mass previous
    const so = s.get_orientation(ship.id)
    const stt = distance( ship.target, scm ) // ship to target
    if (stt < 0.01) {
        ti += 1
        ship.target = {
            x: targets[ti%targets.length][0],
            y: targets[ti%targets.length][1],
        }
        ship.next_target = {
            x: targets[(ti+1)%targets.length][0],
            y: targets[(ti+1)%targets.length][1],
        }
        drive(graphics, s, ship)
    } 
    const sttd = normalize(delta( ship.target, scm )) // ship to target direction
    const sttdp = normalize(delta( ship.target, scmp )) // ship to target direction previous
    const ttntd = normalize(delta( ship.target, ship.next_target )) // target to next target direction
    const a3 = find_angle(sttd, {x:0,y:0}, so)
    const a3p = find_angle(sttdp, {x:0,y:0}, so)
    const a4 = find_angle(sttd, {x:0,y:0}, ttntd)
    const a4p = find_angle(sttdp, {x:0,y:0}, ttntd)
    const sasat = a3 - a3p // ship angular speed around target
    const sasat2 = a4 - a4p //
    const pid_r = ship.pid1.update(a3)
    const dtt = distance(scm, ship.target)
    const dttp = distance(scmp, ship.target)
    const approach_speed = dttp - dtt
    const pid2_r = ship.pid2.update(approach_speed)
    const pid4_r = ship.pid4.update(sasat)
    // graphics.fill_circle(scm, s.diameter*1.5, "#0ff")
    
    const controls_to_activate = []
    if (pid_r < 0.0) {
        controls_to_activate.push('clock');
    }
    if (pid_r > 0.0) {
        controls_to_activate.push('anticlock');
    }
    if (pid2_r > 0.0 && Math.abs(a3 - 0.5) < 0.01 ) {
        controls_to_activate.push('forward');
    }
    if (pid2_r < 0.0 && Math.abs(a3 - 0.5) < 0.4 ) {
        controls_to_activate.push('reverse');
    }
    if (pid4_r > 0.0) {
        controls_to_activate.push("left")
    }
    if (pid4_r < 0.0) {
        controls_to_activate.push("right")
    }
    graphics.text({
        x: -0.2,
        y: 0.33
    }, `a3: ${a3.toFixed(5)}`)
    graphics.text({
        x: -0.2,
        y: 0.32
    }, `      ${controls_to_activate}`)
    graphics.text({
        x: -0.2,
        y: 0.31
    }, `      pid_r: ${pid_r.toFixed(5)}`)
    graphics.text({
        x: -0.2,
        y: 0.30
    }, `as:      ${approach_speed.toFixed(9)}`)
    graphics.text({
        x: -0.2,
        y: 0.29
    }, `sasat: ${sasat.toFixed(9)}`)
    graphics.text({
        x: -0.2,
        y: 0.28
    }, `stt: ${stt.toFixed(9)}`)
    graphics.text({
        x: -0.2,
        y: 0.27
    }, `a4: ${a4.toFixed(9)}`)
    for (const tid of ship.turbo_ids) {
        const tp = s.get_node_position(tid)
        const td = s.get_node_direction(tid)
        const n_to_center_of_mass = normalize(delta( tp, scm ))
        const a1 = find_angle(n_to_center_of_mass, {x:0,y:0}, td)
        const a2 = find_angle(so, {x:0,y:0}, td)
        if (isNaN(a2)) {
            throw "nan"
        }
        const controls = []
        if (Math.abs(a2 - 0.5) < 0.1) {
            controls.push('forward');
        }
        if (Math.abs(a2 - 0.25) < 0.1) {
            controls.push('right');
        }
        if (Math.abs(a2 - 0.75) < 0.1) {
            controls.push('left');
        }
        if (Math.abs(a2 - 1.0) < 0.1) {
            controls.push('reverse');
        }
        if (Math.abs(a2 - 0.0) < 0.1) {
            controls.push('reverse');
        }
        if (Math.abs(a1 - 0.25) < 0.2) {
            controls.push('anticlock');
        }
        if (Math.abs(a1 - 0.75) < 0.2) {
            controls.push('clock');
        }
        let fire = false
        // console.log(controls)
        for (const c of controls) {
            if (controls_to_activate.includes(c)) {
                fire = true
            }
        }
        if ( controls.includes("reverse") && approach_speed < 0) {
            fire = false
        }
        if (
            fire
        ) {
            s.set_turbo_rate(tid, -1.0)
            // graphics.fill_circle(tp, s.diameter*1.5, "#f00")
        } else {
            s.set_turbo_rate(tid, -0.0)
            // graphics.fill_circle(tp, s.diameter*1.5, "#ff0")
        }
    }
    for (const pid of [
        ship.pid1,
        ship.pid2,
        ship.pid4,
    ]) {
        for (let x = 0; x < pid.errors_long.length; x++) {
            const y = pid.errors_long[x];
            const base = graphics.context.canvas.height - pid.y_base
            line_2(graphics.context, {
                x: x,
                y: base,
            }, {
                x: x,
                y: parseInt(base + y*pid.y_mul),
            }, "#FF0", 1)
        }
        graphics.text({
            x: pid.errors_long.length,
            y: graphics.context.canvas.height - pid.y_base
        }, `      ${pid.overshoots}`)
    }
}

const line_2 = (context, p1, p2, color, line_width) => {
    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.strokeStyle = color;
    context.lineWidth = line_width?line_width:2;
    context.stroke();
}

for (let i = 0; i < 1; i++) {
    ships.push(add_ship(
        simulation,
        ship_str,
        // { x: Math.random()*0.5-0.25, y: Math.random()*0.5-0.25, },
        { x: 0.125, y: 0, },
        targets,
    ))
}
tick(simulation, graphics)