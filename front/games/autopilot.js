import {find_angle} from "../math.js"
import {distance} from "../math.js"
import {normalize} from "../math.js"
import {delta} from "../math.js"


const ship_str = `
         *---*
        /\\ /\\
   t---*---1---*---t
  /\\ /\\ /\\ /\\ /\\
 t---*---2---3---*---t
 \\ /            \\ /
   t               t
`.replaceAll("\\"," \\")


const get_pid = (kp, ki, kd, target) => {
    const pid = {
        kp: kp,
        ki: ki,
        kd: kd,
        errors: [],
        target: target,
        // error: 0.0,
        last_error: 0.0,
    }
    for (let index = 0; index < 80; index++) {
        pid.errors.push(0.0)
    }
    pid.update = (value) => {
        let error = pid.target - value
        if (!value) {
            error = 0
        }
        pid.errors.push(error)
        pid.errors.shift()
        let es = 0.0
        for (const e of pid.errors) {
            es += e
        }
        pid.p = pid.kp * error
        pid.i = pid.ki * es / pid.errors.length
        pid.d = pid.kd * (pid.target - pid.last_error)
        pid.last_error = error
        return pid.p + pid.i + pid.d;
    }
    return pid
}


const add_ship = (s, model_str, position, target) => {
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
                s.add_link(idx1, idx2, base_length,link_strength, link_damping)
            }
            if (e == "\\") {
                let idx1 = ids[`${x+1}/${y+1}`]
                let idx2 = ids[`${x-1}/${y-1}`]
                s.add_link(idx1, idx2, base_length,link_strength, link_damping)
            }
            if (
                e == "-" 
                && '*t123f'.includes(line[x-1])
            ) {
                let idx1 = ids[`${x-1}/${y}`]
                let idx2 = ids[`${x+3}/${y}`]
                s.add_link(idx1, idx2, base_length,link_strength, link_damping)
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
        target: target,
        turbo_ids: turbo_ids,
        pid1: get_pid(1.0, -0.7, -0.001, 0.5),
        pid2: get_pid(1.0, 0.0, 0.0, 0.00007),
    }
}


const drive = (d, s, ship) => {
    const scm = s.get_position(ship.id) // ship center of mass
    const scmp = s.get_previous_position(ship.id) // ship center of mass previous
    const so = s.get_orientation(ship.id)
    const stt = distance( ship.target, scm ) // ship to target
    if (stt < 0.01) {
        ship.target = {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5,
        }
        drive(d, s, ship)
    } 
    const sttd = normalize(delta( ship.target, scm )) // ship to target direction
    const sttdp = normalize(delta( ship.target, scmp )) // ship to target direction previous
    const a3 = find_angle(sttd, {x:0,y:0}, so)
    const a3p = find_angle(sttdp, {x:0,y:0}, so)
    const sasat = a3 - a3p // ship angluar speed around target
    const pid_r = ship.pid1.update(a3)
    const dtt = distance(scm, ship.target)
    const dttp = distance(scmp, ship.target)
    const approach_speed = dttp - dtt
    const pid2_r = ship.pid2.update(approach_speed)
    d.fill_circle(d.context, scm, s.diameter*1.5, "#0ff")
    d.fill_circle(d.context, ship.target, s.diameter*1.5, "#0f0")

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
    d.text(d.context, {
        x: -0.2,
        y: 0.33
    }, `a3: ${a3.toFixed(5)}`)

    d.text(d.context, {
        x: -0.2,
        y: 0.32
    }, `      ${controls_to_activate}`)
    d.text(d.context, {
        x: -0.2,
        y: 0.31
    }, `      ${pid_r.toFixed(5)}`)
    d.text(d.context, {
        x: -0.2,
        y: 0.30
    }, `as:      ${approach_speed.toFixed(9)}`)
    d.text(d.context, {
        x: -0.2,
        y: 0.29
    }, `sasat: ${sasat.toFixed(9)}`)

    d.text(d.context, {
        x: -0.2,
        y: 0.28
    }, `stt: ${stt.toFixed(9)}`)

    
    const slack = 0.00000001
    if (sasat < -slack && Math.abs(a3 - 0.5) < 0.1) {
        controls_to_activate.push("left")
    } 
    if (sasat > slack && Math.abs(a3 - 0.5) < 0.1) {
        controls_to_activate.push("right")
    } 


    for (const tid of ship.turbo_ids) {
        const tp = s.get_node_position(tid)
        const td = s.get_node_direction(tid)
        const n_to_center_of_mass = normalize(delta( tp, scm ))
        const a1 = find_angle(n_to_center_of_mass, {x:0,y:0}, td)
        const a2 = find_angle(so, {x:0,y:0}, td)
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
            s.set_turbo_rate(tid, -.8)
            d.fill_circle(d.context, tp, s.diameter*1.5, "#f00")
        } else {
            s.set_turbo_rate(tid, 0.0)
            d.fill_circle(d.context, tp, s.diameter*1.5, "#ff0")
        }
        // d.text(d.context, tp, tid)

        // d.text(d.context, {
        //     x: 0.2,
        //     y: 0.4 - tid*0.04
        // }, `#${tid}: ${a1.toFixed(5)} - ${controls}`)
        // d.text(d.context, {
        //     x: 0.2,
        //     y: 0.38 - tid*0.04
        // }, `      ${a2.toFixed(5)}`)
    }
}


const autopilot = (Simulation, wasm, context) => {
    let s = Simulation.create(JSON.stringify({
        crdv: 8.0,
        crdp: 1.0,
        crdv2: 0.01,
        crdp2: 0.001,
        diameter: 0.008,
        gravity: 0.0,
        ticker: 10,
        friction_ratio: 0.3,
        max_speed: 0.001,
    }))
    let ships = []
    for (let i = 0; i < 1; i++) {
        ships.push(add_ship(
            s,
            ship_str,
            { x: Math.random()*0.5-0.25, y: Math.random()*0.5-0.25, },
            { x: Math.random()*0.5-0.25, y: Math.random()*0.5-0.25, }
        ))
    }
    return {
        simulation: s,
        draw_zoom: 0.8,
        draw_center: {x: 0, y: 0},
        stepper: () => {},
        render: (d) => {
            for (const ship of ships) {
                drive(d, s, ship)
            }
        }
    }
}


export {
    autopilot,
}
