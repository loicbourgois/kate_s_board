const ready_to_jump = (angular_springs, apidx) => {
    // angular_springs[apidx['shoulders/hips/lk']].angle = 0.824
    // angular_springs[apidx['shoulders/hips/rk']].angle = 0.955
    // angular_springs[apidx['rk/hips/lk']].angle = 0.792
    // angular_springs[apidx['hips/shoulders/le']].angle = 0.08
    // angular_springs[apidx['hips/shoulders/re']].angle = 0.853
    // angular_springs[apidx['shoulders/le/lw']].angle = 0.7
    // angular_springs[apidx['shoulders/re/rw']].angle = 0.7
    // angular_springs[apidx['hips/lk/lf']].angle = 0.111
    // angular_springs[apidx['hips/rk/rf']].angle = 0.272
    // angular_springs[apidx['lk/lf/lt']].angle = 0.969
    // angular_springs[apidx['rk/rf/rt']].angle = 0.697
    angular_springs[apidx['shoulders/hips/lk']].angle = 0.824
    angular_springs[apidx['shoulders/hips/rk']].angle = 0.955
    angular_springs[apidx['rk/hips/lk']].angle = 0.792
    angular_springs[apidx['hips/shoulders/le']].angle = 0.263
    angular_springs[apidx['hips/shoulders/re']].angle = 0.853
    angular_springs[apidx['shoulders/le/lw']].angle = 0.886
    angular_springs[apidx['shoulders/re/rw']].angle = 0.7
    angular_springs[apidx['hips/lk/lf']].angle = 0.111
    angular_springs[apidx['hips/rk/rf']].angle = 0.272
    angular_springs[apidx['lk/lf/lt']].angle = 0.969
    angular_springs[apidx['rk/rf/rt']].angle = 0.697
}


const do_jump = (angular_springs, apidx) => {
    angular_springs[apidx['shoulders/hips/lk']].angle = 0.682
    angular_springs[apidx['shoulders/hips/rk']].angle = 0.922
    angular_springs[apidx['rk/hips/lk']].angle = 0.792
    angular_springs[apidx['hips/shoulders/le']].angle = 0.263
    angular_springs[apidx['hips/shoulders/re']].angle = 0.853
    angular_springs[apidx['shoulders/le/lw']].angle = 0.886
    angular_springs[apidx['shoulders/re/rw']].angle = 0.7
    angular_springs[apidx['hips/lk/lf']].angle = 0.326
    angular_springs[apidx['hips/rk/rf']].angle = 0.272
    angular_springs[apidx['lk/lf/lt']].angle = 0.676
    angular_springs[apidx['rk/rf/rt']].angle = 0.697

    angular_springs[apidx['shoulders/hips/lk']].angle = 0.682
angular_springs[apidx['shoulders/hips/rk']].angle = 0.805
angular_springs[apidx['rk/hips/lk']].angle = 0.792
angular_springs[apidx['hips/shoulders/le']].angle = 0.263
angular_springs[apidx['hips/shoulders/re']].angle = 0.853
angular_springs[apidx['shoulders/le/lw']].angle = 0.886
angular_springs[apidx['shoulders/re/rw']].angle = 0.7
angular_springs[apidx['hips/lk/lf']].angle = 0.326
angular_springs[apidx['hips/rk/rf']].angle = 0.272
angular_springs[apidx['lk/lf/lt']].angle = 0.676
angular_springs[apidx['rk/rf/rt']].angle = 0.697

angular_springs[apidx['shoulders/hips/lk']].angle = 0.48
angular_springs[apidx['shoulders/hips/rk']].angle = 0.805
angular_springs[apidx['rk/hips/lk']].angle = 0.792
angular_springs[apidx['hips/shoulders/le']].angle = 0.263
angular_springs[apidx['hips/shoulders/re']].angle = 0.853
angular_springs[apidx['shoulders/le/lw']].angle = 0.886
angular_springs[apidx['shoulders/re/rw']].angle = 0.7
angular_springs[apidx['hips/lk/lf']].angle = 0.326
angular_springs[apidx['hips/rk/rf']].angle = 0.272
angular_springs[apidx['lk/lf/lt']].angle = 0.676
angular_springs[apidx['rk/rf/rt']].angle = 0.697

angular_springs[apidx['shoulders/hips/lk']].angle = 0.48
angular_springs[apidx['shoulders/hips/rk']].angle = 0.919
angular_springs[apidx['rk/hips/lk']].angle = 0.792
angular_springs[apidx['hips/shoulders/le']].angle = 0.263
angular_springs[apidx['hips/shoulders/re']].angle = 0.853
angular_springs[apidx['shoulders/le/lw']].angle = 0.886
angular_springs[apidx['shoulders/re/rw']].angle = 0.7
angular_springs[apidx['hips/lk/lf']].angle = 0.326
angular_springs[apidx['hips/rk/rf']].angle = 0.272
angular_springs[apidx['lk/lf/lt']].angle = 0.676
angular_springs[apidx['rk/rf/rt']].angle = 0.697


//     angular_springs[apidx['shoulders/hips/lk']].angle = 0.682
// angular_springs[apidx['shoulders/hips/rk']].angle = 0.644
// angular_springs[apidx['rk/hips/lk']].angle = 0.792
// angular_springs[apidx['hips/shoulders/le']].angle = 0.263
// angular_springs[apidx['hips/shoulders/re']].angle = 0.853
// angular_springs[apidx['shoulders/le/lw']].angle = 0.886
// angular_springs[apidx['shoulders/re/rw']].angle = 0.7
// angular_springs[apidx['hips/lk/lf']].angle = 0.326
// angular_springs[apidx['hips/rk/rf']].angle = 0.272
// angular_springs[apidx['lk/lf/lt']].angle = 0.676
// angular_springs[apidx['rk/rf/rt']].angle = 0.697

}


const get_bonhomme = () => {
    const pidx_strs = ['zoop', 'le', 're', 'lw', 'rw', 'shoulders',   'hips',   'lk', 'rk','lf', 'rf','lt', 'rt']
    const pidx = {}
    const ps = []
    for (let index = 0; index < pidx_strs.length; index++) {
        const label = pidx_strs[index];
        pidx[label] = index
        // let x = Math.random() * index * 0.1
        // let y = Math.random() + 0.5 + index*0.2
        ps.push({
            p: {
                x: -0.5,
                y: 0.01,
            },
            c:"#0f0",
            ground: false,
            pp: {
                x: 1.0,
                y: 1.0,
            },
            d: {
                x: 0.0,
                y: 0.0,
            },
            dd: {
                x: 0.0,
                y: 0.0,
            },
            idx: index,
            label: label,
        })
    }
    const strengh = 4
    const angular_strength = 0.075 * 0.001;
    const springs = []
    springs.push({
        a: pidx['shoulders'],
        b: pidx['hips'],
        l: 0.3,
        s: strengh,
    })
    springs.push({
        a: pidx['hips'],
        b: pidx['rk'],
        l: 0.2,
        s: strengh,
    })
    springs.push({
        a: pidx['rk'],
        b: pidx['rf'],
        l: 0.2,
        s: strengh,
    })
    springs.push({
        a: pidx['rf'],
        b: pidx['rt'],
        l: 0.1,
        s: strengh,
    })
    springs.push({
        a: pidx['hips'],
        b: pidx['lk'],
        l: 0.2,
        s: strengh,
    })
    springs.push({
        a: pidx['lk'],
        b: pidx['lf'],
        l: 0.2,
        s: strengh,
    })
    springs.push({
        a: pidx['lf'],
        b: pidx['lt'],
        l: 0.1,
        s: strengh,
    })
    springs.push({
        a: pidx['shoulders'],
        b: pidx['le'],
        l: 0.2,
        s: strengh,
    })
    springs.push({
        a: pidx['shoulders'],
        b: pidx['re'],
        l: 0.2,
        s: strengh,
    })
    springs.push({
        a: pidx['le'],
        b: pidx['lw'],
        l: 0.15,
        s: strengh,
    })
    springs.push({
        a: pidx['re'],
        b: pidx['rw'],
        l: 0.15,
        s: strengh,
    })
    const springs2 = {}
    const springs3 = {}
    for (const s of springs) {
        springs2[`${ps[s.a].label}/${ps[s.b].label}`] = s
    }
    for (const s of springs) {
        springs3[`${ps[s.a].idx}/${ps[s.b].idx}`] = s
        springs3[`${ps[s.b].idx}/${ps[s.a].idx}`] = s
    }
    const leg_strength = 2.5
    const angular_springs = [
        {
            a: pidx['shoulders'],
            b: pidx['hips'],
            c: pidx['lk'],
            angle: 0.45,
            s: angular_strength*leg_strength,
        },
        {
            a: pidx['shoulders'],
            b: pidx['hips'],
            c: pidx['rk'],
            angle: 0.55,
            s: angular_strength*leg_strength,
        },
        {
            a: pidx['rk'],
            b: pidx['hips'],
            c: pidx['lk'],
            angle: -0.15,
            s: angular_strength*0.0,
        },
        {
            a: pidx['hips'],
            b: pidx['shoulders'],
            c: pidx['le'],
            angle: 0.1,
            s: angular_strength,
        },
        {
            a: pidx['hips'],
            b: pidx['shoulders'],
            c: pidx['re'],
            angle: -0.1,
            s: angular_strength,
        },
        {
            a: pidx['shoulders'],
            b: pidx['le'],
            c: pidx['lw'],
            angle: -0.3,
            s: angular_strength,
        },
        {
            a: pidx['shoulders'],
            b: pidx['re'],
            c: pidx['rw'],
            angle: -0.3,
            s: angular_strength,
        },
        {
            a: pidx['hips'],
            b: pidx['lk'],
            c: pidx['lf'],
            angle: -0.5,
            s: angular_strength*leg_strength,
        },
        {
            a: pidx['hips'],
            b: pidx['rk'],
            c: pidx['rf'],
            angle: -0.5,
            s: angular_strength*leg_strength,
        },
        {
            a: pidx['lk'],
            b: pidx['lf'],
            c: pidx['lt'],
            angle: -0.2,
            s: angular_strength,
        },
        {
            a: pidx['rk'],
            b: pidx['rf'],
            c: pidx['rt'],
            angle: -0.2,
            s: angular_strength,
        },
    ]
    ps[pidx['hips']].p = {
        x: 0.5,
        y: 0.5,
    }
    ps[pidx['hips']].setup = true
    console.log(springs2)
    ps[pidx['shoulders']].p = {
        x: ps[pidx['hips']].p.x,
        y: ps[pidx['hips']].p.y + springs2['shoulders/hips'].l,
    }
    ps[pidx['shoulders']].setup = true

    const apidx = {}
    for (let index = 0; index < angular_springs.length; index++) {
        const s = angular_springs[index];
        s.label = `${ps[s.a].label}/${ps[s.b].label}/${ps[s.c].label}`
        // s.label = `${ps[s.a].label}/${ps[s.b].label}/${ps[s.c].label}`
        while (s.angle < 0.0) {
            s.angle += 1;
        }
        apidx[s.label] = index
        apidx[`${ps[s.c].label}/${ps[s.b].label}/${ps[s.a].label}`] = index
    }
    console.log(apidx)

    ready_to_jump(angular_springs, apidx)
    // do_jump(angular_springs, apidx)

    for (const x of angular_springs) {
        const a = ps[x.a]
        const b = ps[x.b]
        const c = ps[x.c]
        if ( !a.setup ) {
            throw("zoop", x)
        }
        if ( !b.setup ) {
            throw("zoop", x)
        }
        let angle = x.angle
        const aa = `${x.b}/${x.c}`
        let distance = springs3[aa].l
        let center = b.p
        let uv = unit_vector(delta(b.p, a.p))
        let projection = {
            x: uv.x * distance + center.x,
            y: uv.y * distance + center.y,
        }
        let cr = rotate(projection, center, angle)
        c.p.x = cr.x
        c.p.y = cr.y
        c.setup = true
    }
    for (const p of ps) {
        p.pp.x = p.p.x
        p.pp.y = p.p.y
        if ( p.label[0] == "r" ) {
            p.c = "#f00"
        }
    }
    console.log(springs3)
    
    // for (const s of angular_springs) {
    //     apidx[`${ps[s.a].label}/${ps[s.b].label}`] = s
    // }
    return {
        pidx: pidx,
        ps: ps,
        springs: springs,
        angular_springs: angular_springs,
        apidx: apidx,
    }
}

const unit_vector = (d) => {
    const dist = Math.sqrt(d.x * d.x + d.y * d.y)
    return {
        x: d.x / dist,
        y: d.y / dist,
    }
}