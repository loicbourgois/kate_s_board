import { Vellipsis } from "../vellipsis/vellipsis.js";
import { Graphics } from "../vellipsis/graphics.js"
import { 
    get_elapsed_formatted, 
    set_html,
} from "../vellipsis/utils.js"
const config = {
    kinds: [
        {
            kind: 'dirt',
            color: '#422',
            density: 1.0,
        },
        {
            kind: 'water',
            color: '#4ff8',
            density: 1.0,
        },
        {
            kind: 'wet_dirt',
            color: '#ff3',
            density: 1.0,
        },
        {
            kind: 'wet_wet_dirt',
            color: '#f33',
            density: 1.0,
        },
        // {
        //     kind: 'sun',
        //     color: '#633',
        //     density: 1.0,
        // },
        // {
        //     kind: 'sunlight',
        //     color: '#633',
        //     density: 1.0,
        // },
    ],
    transformations: [
        // ['dirt', 'water', 'wet_dirt', null],
        // ['wet_dirt', 'water', 'wet_wet_dirt', null],
        // ['wet_wet_dirt', 'dirt', 'wet_dirt', 'wet_dirt'],
        // ['wet_wet_dirt', 'wet_dirt', 'wet_dirt', 'wet_wet_dirt'],
        // ['dirt', 'water', 'wet_dirt', null],
    ],
    collisions: [
        {

        }
    ],
}
const tick = (simulation, graphics) => {
    const start = performance.now()
    simulation.tick()
    set_html("physic", get_elapsed_formatted(start))
    const render_start = performance.now()
    render(simulation, graphics)
    set_html("graphics", get_elapsed_formatted(render_start))
    requestAnimationFrame(() => {
        tick(simulation, graphics)
    })
}
const render = (simulation, graphics) => {
    graphics.clear_partial()
    for (const n of simulation.active_nodes()) {
        graphics.fill_circle(n.p2, simulation.diameter, config.kinds[n.kind].color)
    }
    set_html("nodes_count", simulation.nodes_count())
    set_html("links_count", simulation.links_count())
    set_html("links_inactive_count", simulation.links_inactive_count())
    set_html("nodes_inactive_count", simulation.nodes_inactive_count())
    set_html("fps", graphics.get_fps())
}
document.body.innerHTML = `
    <div id="left">
        <div id="infos">
            <p>x: <span id="x"></span></p>
            <p>y: <span id="y"></span></p>
            <p>x2: <span id="x2"></span></p>
            <p>y2: <span id="y2"></span></p>
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
const graphics = new Graphics("canvas")
const simulation = await Vellipsis.create({
    crdv: 100.0,
    crdp: 0.1,
    crdv2: 0.0,
    crdp2: 0.0,
    diameter: 0.01,
    gravity: 0.000005,
    central_gravity: 0.0,
    ticker: 1,
    friction_ratio: 0.0,
    max_speed: 0.005,
})
for (const x of config.kinds) {
    simulation.add_kind(x.kind, x.density)
}
for (const x of config.transformations) {
    simulation.add_transformation(x[0], x[1], x[2], x[3])
}
simulation.add({
    structure: 'line',
    fixed: true,
    kind: 'dirt',
    ratio: 0.99,
    p1: {
        x: -0.5,
        y: -0.25,
    },
    p2: {
        x: 0.5,
        y: -0.25,
    }
})
simulation.add({
    structure: 'line',
    fixed: true,
    kind: 'dirt',
    ratio: 0.99,
    p1: {
        x: -0.5,
        y: -0.2599,
    },
    p2: {
        x: 0.5,
        y: -0.2599,
    }
})
simulation.add({
    structure: 'line',
    fixed: false,
    kind: 'water',
    ratio: 2,
    p1: {
        x: 0.0,
        y: 0.0,
    },
    p2: {
        x: 0.0,
        y: 1.25,
    }
})
tick(simulation, graphics)
