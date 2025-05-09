import { Vellipsis } from "../vellipsis/vellipsis.js";
import { Graphics } from "../vellipsis/graphics.js"
import { get_elapsed_formatted } from "../vellipsis/utils.js"
const tick = (simulation, graphics) => {
    const start = performance.now()
    simulation.tick()
    document.getElementById("physic").innerHTML = get_elapsed_formatted(start)
    const render_start = performance.now()
    render(simulation, graphics)
    document.getElementById("graphics").innerHTML = get_elapsed_formatted(render_start)
    requestAnimationFrame(() => {
        tick(simulation, graphics)
    })
}
const colors = ["#444", "#4ff8", "#F448"]
const render_times = []
const render = (simulation, graphics) => {
    render_times.push(performance.now())
    while (render_times.length > 100) {
        render_times.shift()
    }
    graphics.clear_partial()
    for (const n of simulation.nodes()) {
        if ( n.active!==1 ) {
            continue
        }
        if (isNaN(n.p.x)) {
            simulation.delete_node(n.idx)
            console.error(n)
        }
        let color = colors[n.kind]
        graphics.fill_circle(n.p2, simulation.diameter*1.5, color)
    }
    document.getElementById("nodes_count").innerHTML = simulation.nodes_count()
    document.getElementById("links_count").innerHTML = simulation.links_count()
    document.getElementById("links_inactive_count").innerHTML = simulation.links_inactive_count()
    document.getElementById("nodes_inactive_count").innerHTML = simulation.nodes_inactive_count()
    document.getElementById("fps").innerHTML = (1/((render_times[render_times.length-1] - render_times[0])/(render_times.length-1)/1000)).toFixed(0)
}
const simulation = await Vellipsis.create({
    crdv: 0.0,
    crdp: 0.0,
    crdv2: 0.0,
    crdp2: 0.0,
    diameter: 0.01,
    gravity: 0.00005,
    central_gravity: 0.0,
    ticker: 1,
    friction_ratio: 0.0,
    max_speed: 0.3,
})
simulation.add_kind('rock', 1.0)
simulation.add_kind('fire_1', 1.0)
simulation.add_kind('fire_2', .5)
for (const k1 of ['fire_1', 'fire_2']) {
    for (const k2 of ['fire_1', 'fire_2']) {
        simulation.add_interaction({
            k1: k1,
            k2: k2,
            crdv: 0.1,
            crdp: 10.0,
            friction_ratio: 0.0,
        })
    }
}
for (const k1 of ['rock']) {
    for (const k2 of ['fire_1', 'fire_2']) {
        simulation.add_interaction({
            k1: k1,
            k2: k2,
            crdv: 1,
            crdp: 1,
            friction_ratio: 0.0,
        })
    }
}
const aquarium = (c) => {
    const width = c.width
    simulation.add({
        structure: 'rect',
        kind: 'rock',
        fixed: true,
        ratio: 1,
        p1: {
            x:-width/2+c.x,
            y:-0.2,
        },
        p2: {
            x:width/2+c.x,
            y:0.42,
        }
    })
    const aa = 0.5
    for (let x = -c.width/2 + simulation.diameter; x < c.width / 2 * 0.99 ; x+=simulation.diameter) {
        for (let y = 0; y < c.height-0.001; y+=simulation.diameter) {
            simulation.add_node_js({
                x: c.x+Math.random()*0.001+x,
                y: y*aa-0.19,
                kind: 'fire_2',
                fixed: false,
            })
            simulation.add_node_js({
                x: c.x+Math.random()*0.001+x,
                y: y*aa-0.19 + c.height*aa,
                kind: 'fire_1',
                fixed: false,
            })
        }
    }
}
aquarium({
    width: 0.75,
    height: 0.3,
    x: 0,
})
document.body.innerHTML = `
    <div id="left">
        <div id="infos">
            <p>x: <span id="-x"></span></p>
            <p>y: <span id="-y"></span></p>
            <p>x2: <span id="-x2"></span></p>
            <p>y2: <span id="-y2"></span></p>
            <p>physics:  <span id="physic"></span></p>
            <p>graphics: <span id="graphics"></span></p>
            <p>fps:      <span id="fps"></span></p>
            <p>nodes: <span id="nodes_count"></span></p>
            <p>inactive nodes: <span id="nodes_inactive_count"></span></p>
            <p>links: <span id="links_count"></span></p>
            <p>inactive links: <span id="links_inactive_count"></span></p>
        </div>
    </div>
    <canvas id="canvas"></canvas>
`
const graphics = new Graphics("canvas", 1, "")
graphics.draw_center = [0.0, 0.1]
tick(simulation, graphics)
