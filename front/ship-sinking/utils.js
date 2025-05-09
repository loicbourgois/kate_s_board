const add_structure_from_str = (s, model_str, position) => {
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
    const height = model_str.split("\n").length
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
                const x2 = x*s.diameter *0.25 + position.x - max_length * s.diameter * 0.12 
                const y2 = -y*s.diameter*.43 + position.y + height * s.diameter * 0.2
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
    let base_length = s.diameter * 0.1
    let link_strength = 2
    let link_damping = 4
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
    }
}
export {
    add_structure_from_str,
}