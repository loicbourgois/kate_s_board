import { Vellipsis } from "../vellipsis/vellipsis.js";
import { Graphics } from "../vellipsis/graphics.js"
import { get_elapsed_formatted } from "../vellipsis/utils.js"
import { 
    delta,  
    normalize,
    distance,
    find_angle,
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
        kind: 'rock',
        color: '#422',
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
    for (const n of simulation.nodes()) {
        if ( n.active!==1 ) {
            continue
        }
        if (isNaN(n.p.x)) {
            simulation.delete_node(n.idx)
            console.error(n)
        }
        let color = config[n.kind].color
        graphics.fill_circle(n.p2, simulation.diameter*1.5, color)
    }
    for (const l of simulation.links()) {
        graphics.line(l.a.p, l.b.p, "#fff", 1)
        // console.log(l)
        // throw "wop"
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
    // crdv: 20.0,
    // crdp: 0.01,
    // crdv2: 0.0,
    // crdp2: 0.0,
    // diameter: 0.01,
    // gravity: 0.0,
    // central_gravity: 0.0,
    // ticker: 1,
    // friction_ratio: 0.0,
    // max_speed: 0.05,
    crdv: 8.0,
    crdp: 1.0,
    crdv2: 0.01,
    crdp2: 0.001,
    diameter: 0.008,
    gravity: 0.0,
    ticker: 10,
    friction_ratio: 0.3,
    max_speed: 0.001,
    central_gravity: 0.0,
})
for (const x of config) {
    simulation.add_kind(x.kind, x.density)
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
graphics.draw_zoom = 1.
graphics.context.canvas.addEventListener('mousemove', update_mouse(graphics, simulation))
graphics.context.canvas.addEventListener('mousedown', () => {
    data.add_node = true
})
graphics.context.canvas.addEventListener('mouseup', () => {
    data.add_node = false
})

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
    graphics.fill_circle(scm, s.diameter*1.5, "#0ff")
    let aa = 0;
    for (const p of targets) {
        graphics.fill_circle({
            x: p[0],
            y: p[1],
        }, s.diameter*1.5, "#080")
        graphics.text({
            x: p[0],
            y: p[1],
        }, `${aa}`)
        aa += 1
    }
    graphics.fill_circle(ship.target, s.diameter*1.5, "#0f0")
    graphics.fill_circle(ship.next_target, s.diameter*1.5, "#0b0")
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
            graphics.fill_circle(tp, s.diameter*1.5, "#f00")
        } else {
            s.set_turbo_rate(tid, -0.0)
            graphics.fill_circle(tp, s.diameter*1.5, "#ff0")
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

const get_pid = (kp, ki, kd, target, mul, base) => {
    const pid = {
        kp: kp,
        ki: ki,
        kd: kd,
        errors: [],
        errors_long: [],
        target: target,
        last_error: 0.0,
        y_mul: mul,
        y_base: base,
    }
    for (let index = 0; index < 80; index++) {
        pid.errors.push(0.0)
    }
    for (let index = 0; index < 500; index++) {
        pid.errors_long.push(0.0)
    }
    pid.update = (value) => {
        let error = pid.target - value
        if (!value) {
            error = 0
        }
        pid.errors.push(error)
        pid.errors.shift()
        pid.errors_long.push(error)
        pid.errors_long.shift()
        let es = 0.0
        let a = 0
        let b = 0
        for (let i = 0; i < pid.errors.length; i++) {
            const e = pid.errors[i];
            es += e
        }
        for (let i = 0; i < pid.errors_long.length; i++) {
            const e = pid.errors_long[i];
            if (e > 0) {
                a += 1
            } else {
                b += 1
            }
        }
        a = Math.abs(a)
        b = Math.abs(b)
        pid.overshoots = (Math.max(a, b) / (a+b)).toFixed(4)
        pid.p = pid.kp * error
        pid.i = pid.ki * es / pid.errors.length
        pid.d = pid.kd * (pid.target - pid.last_error)
        pid.last_error = error
        return pid.p + pid.i + pid.d;
    }
    return pid
}
const add_ship = (s, model_str, position) => {
    let max_length = 0
    for (const line of model_str.split("\n")) {
        max_length = Math.max(line.length, max_length)
    }
    max_length += 1
    const ship2 = []
    for (const line of model_str.split("\n")) {
        let spaces = ""
        for (let index = line.length; index < max_length; index++) {
            spaces += " "
        }
        ship2.push(`${line}${spaces}`)
    }
    const ids = {}
    const turbo_ids = []
    const ids_2 = []
    const orientation = {}
    for (let y = 0; y < ship2.length; y++) {
        const line = ship2[y]
        for (let x = 0; x < max_length; x++) {
            const e = line[x];
            if (
                '*t123f'.includes(e)
            ) {
                const x2 = x*s.diameter *0.5 + position.x
                const y2 = -y*s.diameter*1.0 + position.y
                let id = -1;
                if (e=='*') {
                    id = s.add_node(x2, y2, false)
                } else if (e=='f') {
                    id = s.add_node(x2, y2, true)
                } else if (
                    e == "1"
                    || e == "2"
                    || e == "3"
                ) {
                    id = s.add_node(x2, y2, false)
                    orientation[e] = id
                } else if (e=='t') {
                    id = s.add_node_3(JSON.stringify({
                        x: x2,
                        y: y2,
                        turbo_max_speed: 0.00005,
                        fixed: false,
                    }))
                    turbo_ids.push(id)
                }
                ids[`${x}/${y}`] = id
                ids_2.push(id)
            }
        }
    }
    let base_length = s.diameter * 1.2
    let link_strength = 2
    let link_damping = 3
    for (let y = 0; y < ship2.length; y++) {
        const line = ship2[y]
        for (let x = 0; x < max_length; x++) {
            const e = line[x];
            if (e == "/") {
                let idx1 = ids[`${x+1}/${y-1}`]
                let idx2 = ids[`${x-1}/${y+1}`]
                s.add_link_2(idx1, idx2, base_length,link_strength, link_damping, 1000.0)
            }
            if (e == "\\") {
                let idx1 = ids[`${x+1}/${y+1}`]
                let idx2 = ids[`${x-1}/${y-1}`]
                s.add_link_2(idx1, idx2, base_length,link_strength, link_damping, 1000.0)
            }
            if (
                e == "-" 
                && '*t123f'.includes(line[x-1])
            ) {
                let idx1 = ids[`${x-1}/${y}`]
                let idx2 = ids[`${x+3}/${y}`]
                s.add_link_2(idx1, idx2, base_length,link_strength, link_damping, 1000.0)
            }
        }
    }
    const ship_id = s.create_entity(
        ids_2,
        [
            orientation["1"],
            orientation["2"],
            orientation["3"],
        ]
    )
    return {
        id: ship_id,
        target: {
            x: targets[0][0],
            y: targets[0][1],
        },
        next_target: {
            x: targets[1][0],
            y: targets[1][1],
        },
        turbo_ids: turbo_ids,
        pid1: get_pid(3.0, -2.2, 0.0, 0.5, 300, 300),
        pid2: get_pid(1.0, 0.0, 0.0, 0.000075, 1000000, 200),
        pid4: get_pid(1.0, 0.0, -0.0, 0.0, 1000000, 100),
    }
}
for (let i = 0; i < 1; i++) {
    ships.push(add_ship(
        simulation,
        ship_str,
        { x: Math.random()*0.5-0.25, y: Math.random()*0.5-0.25, },
    ))
}
tick(simulation, graphics)