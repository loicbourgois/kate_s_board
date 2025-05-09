const add_filled_rect = (simulation, c) => {
    
    for (let x = Math.min(c.p1.x, c.p2.x); x < Math.max(c.p1.x, c.p2.x); x+=simulation.diameter*c.ratio) {
        for (let y = Math.min(c.p1.y, c.p2.y); y < Math.max(c.p1.y, c.p2.y); y+=simulation.diameter*c.ratio) {
            simulation.add_node_js({
                x: x,
                y: y,
                kind: c.kind,
                fixed: c.fixed,
            })
        }
    }
}
export {
    add_filled_rect
}