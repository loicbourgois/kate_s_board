import {find_angle} from "../math.js"
import {distance} from "../math.js"
import {normalize} from "../math.js"
import {delta} from "../math.js"


const ship_str = `
         *---*
        /\\ /\\
   *---*---1---*---*
  /\\ /\\ /\\ /\\ /\\
 *---*---2---3---*---*
 \\ /            \\ /
   t               t
`.replaceAll("\\"," \\")


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
    // console.log(ship2.join("\n").replaceAll(" ", "."))
    const ids = {}
    const turbo_ids = []
    const ids_2 = []
    const orientation = {}
    for (let y = 0; y < ship2.length; y++) {
        const line = ship2[y]
        for (let x = 0; x < max_length; x++) {
            const e = line[x];
            if (
                e == "*" 
                || e == "t"
                || e == "1"
                || e == "2"
                || e == "3"
            ) {
                const x2 = x*s.diameter *0.5 + position.x
                const y2 = -y*s.diameter*1.0 + position.y
                let id = -1;
                if (e=='*') {
                    id = s.add_node(x2, y2, false)
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
    let base_length = s.diameter * 2
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
                && (
                    line[x-1] == "*" 
                    || line[x-1] == "t"
                    || line[x-1] == "1"
                    || line[x-1] == "2"
                    || line[x-1] == "3"
                )
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
    }
}


const drive = (d, s, ship) => {
    const p = s.get_position(ship.id)
    const pp = s.get_previous_position(ship.id)
    const v = s.get_vellocity(ship.id)
    const s_orientation = s.get_orientation(ship.id)
    const s_orientation_p = s.get_orientation_previous(ship.id)

    const angle_5 = find_angle(s_orientation_p, {x:0,y:0}, s_orientation)
    const aa5 = 0.5 - angle_5

    const dtt = distance(p, ship.target)
    const dttp = distance(pp, ship.target)
    const going_clockwise = aa5 < 0
    const going_anticlockwise = !going_clockwise
    const approach_speed = dttp - dtt
    if (dtt < dttp) {
        d.text(d.context, {x:0.1, y: 0.1}, "closer")
    } else {
        d.text(d.context, {x:0.1, y: 0.1}, "farther")
    }
    if (going_clockwise) {
        d.text(d.context, {x:0.1, y: 0.12}, "clokwise")
    } else {
        d.text(d.context, {x:0.1, y: 0.12}, "anticlokwise")
    }
    d.text(d.context, {x:0.1, y: 0.16}, `approach_speed: ${approach_speed.toFixed(8)}`)
    const absolute_rota_speed = 0.5 - Math.abs(aa5)
    d.text(d.context, {x:0.1, y: 0.14}, absolute_rota_speed)
    const vn = normalize(v)
    d.fill_circle(d.context, p, s.diameter*1.5, "#ff0")
    d.fill_circle(d.context, ship.target, s.diameter*1.5, "#ff0")
    d.line(d.context, p, ship.target, "#ff0", 1)
    let max_dist = 0.0
    let id_max_dist = -1
    for (const tid of ship.turbo_ids) {
        const tp = s.get_node_position(tid)
        let d = distance(tp, ship.target)
        if (d > max_dist) {
            id_max_dist = tid;
            max_dist = d;
        }
    }
    const direction_to_target = normalize(delta( p, ship.target ))
    const angle_4 = find_angle(direction_to_target, {x:0,y:0}, s_orientation)
    const aa4 = 0.5 - Math.abs(0.5 - angle_4)
    
    d.text(d.context, {x:0.1, y: 0.18}, `aa4: ${aa4}`)

    for (const tid of ship.turbo_ids) {
        const tp = s.get_node_position(tid)
        const td = s.get_node_direction(tid)

        const n_to_center_of_mass = normalize(delta( tp, p ))

        const angle = find_angle(direction_to_target, {x:0,y:0}, td)
        const angle_2 = find_angle(direction_to_target, {x:0,y:0}, vn)
        const angle_3 = find_angle(n_to_center_of_mass, {x:0,y:0}, s_orientation)
        const aa = 0.5 - angle
        const aa2 = Math.abs(0.5 - angle_2)
        const aa3 = 0.5 - angle_3


        const rotation_speed = 0.499899
        const push_clockwise = aa3 > 0
        const push_anticlockwise = !push_clockwise

        const rota_speed_limit = 0.0001;
        

        const respect_speed_limit = (
            (push_clockwise && going_clockwise)
            || (push_anticlockwise && going_anticlockwise)
        )

        let go = true 
        if (respect_speed_limit) {
            go = absolute_rota_speed < rota_speed_limit
        }


        const closer = dtt < dttp
        const farther = !closer
        
        let go2 = false
        if ( approach_speed < 0.00005 || aa4 > 0.02) {
            go2 = true
        }
        const aa13 = aa * aa3
        const fire = (
            closer && aa13 < 0.001 && go && go2
            || farther && aa13 < 0.02 && go
        )
        if (
            fire
        ) {
            s.set_turbo_rate(tid, -0.8)
            d.fill_circle(d.context, tp, s.diameter*1.5, "#f00")
        } else {
            s.set_turbo_rate(tid, 0.0)
            d.fill_circle(d.context, tp, s.diameter*1.5, "#ff0")
        }
    }
    d.line(d.context, p, {
        x: p.x + s_orientation.x * s.diameter * 4.0,
        y: p.y + s_orientation.y * s.diameter * 4.0,
    }, "#cc0", 5)
    d.line(d.context, p, {
        x: p.x + s_orientation.x * s.diameter * 4.0,
        y: p.y + s_orientation.y * s.diameter * 4.0,
    }, "#000", 2)

}


const figure_eight = (Simulation, wasm, context) => {
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
    let ships = [
        add_ship(
            s,
            ship_str,
            { x: 0, y:0,},
            { x: 0, y: 0.0, }
        ),
        // add_ship(
        //     s,
        //     ship_str,
        //     { x: 0.2, y:0.1,},
        //     { x: 0.0, y: 0.0, }
        // ),
        // add_ship(
        //     s,
        //     ship_str,
        //     { x: -0.2, y:0.1,},
        //     { x: 0.0, y: 0.0, }
        // ),
        // add_ship(
        //     s,
        //     ship_str,
        //     { x: 0, y:0.2,},
        //     { x: 0.0, y: 0.0, }
        // )
    ]
    // let go = true
    // context.canvas.addEventListener("click", () => {
    //     console.log("click")
    //     go = false
    //     throw "woop"
    // });
    return {
        simulation: s,
        draw_zoom: .8,
        draw_center: {x: 0, y: 0},
        stepper: () => {},
        render: (d) => {
            // if (!go) {
            //     throw "stop"
            // }
            for (const ship of ships) {
                drive(d, s, ship)
            }
            // throw "Zoop"
        }
    }
}


export {
    figure_eight,
}
