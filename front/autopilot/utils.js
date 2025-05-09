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
const add_ship = (s, model_str, position, targets) => {
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
    let base_length = s.diameter
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
        pid1: get_pid(1., -0.7, -0.0, 0.5, 300, 300),
        pid2: get_pid(1.0, 0.0, 0.0, 0.000075, 1000000, 200),
        pid4: get_pid(1.0, 0.0, -0.0, 0.0, 1000000, 100),
    }
}
export {
    add_ship,
}