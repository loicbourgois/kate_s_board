import {find_angle} from "../math.js"
import {distance} from "../math.js"
import {normalize} from "../math.js"
import {delta} from "../math.js"


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



const inverted_pendulum = (Simulation, wasm, context) => {
    let s = Simulation.create(JSON.stringify({
        crdv: 8.0,
        crdp: 1.0,
        crdv2: 0.01,
        crdp2: 0.001,
        diameter: 0.008,
        gravity: 0.000002,
        ticker: 10,
        friction_ratio: 0.3,
        max_speed: 0.001,
    }))

    const ids = []
    ids.push(s.add_node(0, 0.0, true))
    let base_length = s.diameter * 1.75
    let link_strength = 10
    let link_damping = 3
    const count_ = 13
    for (let i = 1; i < count_; i++) {
        ids.push(s.add_node(0.0, -i*s.diameter*2, false))
        s.add_link(i-1, i, base_length,link_strength, link_damping)
        if (i>1) {
            s.add_clink(
                i-2, 
                i-1, 
                i, 
                0.5, 3, 1
            )
        }
    }
    console.log(ids)
    const t1 = s.add_node_3(JSON.stringify({
        y: -s.diameter*2*(count_-1.5),
        x: s.diameter*1.5,
        turbo_max_speed: 0.00005,
        fixed: false,
    }))
    const t2 = s.add_node_3(JSON.stringify({
        y: -s.diameter*2*(count_-1.5),
        x: -s.diameter*1.5,
        turbo_max_speed: 0.00005,
        fixed: false,
    }))
    s.add_link(t1, count_-1, base_length,link_strength, link_damping)
    s.add_link(t1, count_-2, base_length,link_strength, link_damping)
    s.add_link(t2, count_-1, base_length,link_strength, link_damping)
    s.add_link(t2, count_-2, base_length,link_strength, link_damping)
    const target = s.add_node(0.0, 0.25, true)
    const pid = get_pid(400.0, -300.0, -200.0, 0.0)
    return {
        simulation: s,
        draw_zoom: 0.8,
        draw_center: {x: 0, y: 0},
        stepper: () => {},
        render: (d) => {
            const t1p = s.get_node_position(t1)
            d.fill_circle(d.context, t1p, s.diameter*1.5, "#ff0")
            const t2p = s.get_node_position(t2)
            d.fill_circle(d.context, t2p, s.diameter*1.5, "#ff0")
            const tn = s.get_node_position(target)
            const origin = s.get_node_position(0)
            const end = s.get_node_position(count_-1)
            const angle = 0.5 - find_angle(tn, origin, end)
            const angle_abs = 0.5 - Math.abs(0.5 - find_angle(tn, origin, end))
            const sign = angle / Math.abs(angle)
            const error = sign * angle_abs
            const v = angle_abs*angle_abs*150
            const x = Math.abs(pid.update(error))
            if (error < 0 ) {
                s.set_turbo_rate(t1, x)
                s.set_turbo_rate(t2, 0)
            } else {
                s.set_turbo_rate(t1, 0)
                s.set_turbo_rate(t2, x)
            }
            d.text(d.context, {x:0.025, y: 0.23}, error.toFixed(3))
            d.text(d.context, {x:0.025, y: 0.21}, x.toFixed(3))
            d.text(d.context, {x:0.025, y: 0.19}, v.toFixed(3))
        }
    }
}


export {
    inverted_pendulum,
}
