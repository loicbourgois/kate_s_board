const run_motor = (s, motor) => {
    let a = s.step * motor.speed
    for (let index = 0; index < motor.clinks.length; index++) {
        s.set_clink_angle(motor.clinks[index], index / motor.clinks.length + a + motor.angle)
    }
}

const add_motor = (s, wheel, nid, angle, aa=1, speed = 1/1000.0) => {
    const clinks = []
    for (let index = 0; index < wheel.nids.length; index++) {
        if (index % aa == 0) {
            clinks.push(s.add_clink(
                nid, 
                wheel.cidx, 
                wheel.nids[index], 
                index / wheel.nids.length + angle, 0.1, 1.1)
            )
        }
    }
    return {
        clinks: clinks,
        angle: angle,
        run: run_motor,
        speed: speed,
    }
}


const add_motor_2 = (s, cid, nid, ps, angle, speed) => {
    const clinks = []
    let counter = 0
    for (const p of ps) {
        clinks.push(
            s.add_clink(
                nid, 
                cid,
                p.id, 
                counter / ps.length + angle, 0.1, 1.1
            )
        )
        counter += 1
    }
    // for (let index = 0; index < wheel.nids.length; index++) {
    //     if (index % aa == 0) {
            
    //     }
    // }
    return {
        clinks: clinks,
        angle: angle,
        run: run_motor,
        speed: speed,
    }
}


export {
    add_motor,
    add_motor_2,
}
