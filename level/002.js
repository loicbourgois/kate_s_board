

const delta = (a, b) => {
    return {
        x: b.x - a.x,
        y: b.y - a.y,
    }
}


const distance = (a, b) => {
    const d = delta(a, b)
    return Math.sqrt(d.x * d.x + d.y * d.y)
}


const distance_sqrd = (a, b) => {
    const d = delta(a, b)
    return (d.x * d.x + d.y * d.y)
}

const level_002 = (Simulation) => {
    let s = Simulation.new(0.2, 0.01)
    let start = -1.0
    let end = 0.2
    let stepper = 0.00001
    let a = {
        x: start,
        y: start*start,
    }
    s.add_node(a.x, a.y, true)
    // let diam = 
    let b = {
        x: a.x,
        y: a.y,
    }



    while (a.x < end) {
        while ( distance_sqrd(a, b) < s.diameter * s.diameter ) {
            b.x += stepper
            b.y = b.x * b.x
        }
        a.x = b.x - stepper
        a.y = a.x * a.x
        s.add_node(b.x, b.y, true)
    }


    

    // let aa = 300
    // for (let i = 0; i < aa*0.63; i++) {
    //     // const element = array[index];
    //     const x = i/aa*2.0-1.0;
    //     const y = x*x
    //     s.add_node(x, y, true)
    // }

    let aa = 19
    for (let i = 0; i <= aa; i++) {
        // const element = array[index];
        const x = i/aa*2-1.0;
        const y = x*x
        s.add_node(
            x*0.05 + 0.78, 
            y*0.05 - 0.01, 
            true
        )
    }

    s.add_node(-0.99, 1.0, false)
    return s
}

export {
    level_002,
}