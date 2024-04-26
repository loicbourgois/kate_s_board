import { delta, distance, normalize } from "../math.js"

const add_line = (simulation, c) => {
    const p1 = c.p1
    const p2 = c.p2
    const delt = delta(p1, p2)
    const dist = distance(p1, p2)
    const n = normalize(delt)
    const v = {
        x: n.x * simulation.diameter * c.ratio,
        y: n.y * simulation.diameter * c.ratio,
    }
    simulation.add_node_js({
        x: p1.x, 
        y: p1.y,
        kind: c.kind,
        fixed: c.fixed,
    })
    let i = 1
    while (true) {
        const p3 = {
            x: p1.x + v.x * i,
            y: p1.y + v.y * i,
        }
        if (distance(p1, p3) > dist) {
            break
        }
        simulation.add_node_js({
            x: p3.x,
            y: p3.y,
            kind: c.kind,
            fixed: c.fixed,
        })
        i++
    }
}
export {
    add_line
}