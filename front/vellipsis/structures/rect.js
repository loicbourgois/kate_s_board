const add_rect = (simulation, x) => {
    for (const abcd of [
        [x.p2.x, x.p2.y, x.p1.x, x.p2.y],
        [x.p2.x, x.p1.y, x.p1.x, x.p1.y],
        [x.p1.x, x.p2.y, x.p1.x, x.p1.y],
        [x.p2.x, x.p2.y, x.p2.x, x.p1.y],
    ]) {
        simulation.add({
            structure: 'line',
            fixed: x.fixed,
            kind: x.kind,
            ratio: x.ratio,
            p1: {
                x: abcd[0],
                y: abcd[1],
            },
            p2: {
                x: abcd[2],
                y: abcd[3],
            }
        })
    }
}
export {
    add_rect
}