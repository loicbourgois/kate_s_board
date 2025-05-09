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
            color: '#f22',
            density: 1.0,
        },
        // {
        //     kind: 'water',
        //     color: '#4ff8',
        //     density: 1.0,
        // },
        // {
        //     kind: 'wet_dirt',
        //     color: '#ff3',
        //     density: 1.0,
        // },
        // {
        //     kind: 'wet_wet_dirt',
        //     color: '#f33',
        //     density: 1.0,
        // },
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
    set_html(`${graphics.div_id}-physic`, get_elapsed_formatted(start))
    const render_start = performance.now()
    render(simulation, graphics)
    set_html(`${graphics.div_id}-graphics`, get_elapsed_formatted(render_start))
    requestAnimationFrame(() => {
        tick(simulation, graphics)
    })
}
const render = (simulation, graphics) => {
    graphics.clear_partial()
    let kinetic_energy = 0.0
    for (const n of simulation.active_nodes()) {
        graphics.fill_circle(n.p2, simulation.diameter, config.kinds[n.kind].color)
        kinetic_energy += n.kinetic_energy
    }
    // set_html("nodes_count", simulation.nodes_count())
    // set_html("links_count", simulation.links_count())
    // set_html("links_inactive_count", simulation.links_inactive_count())
    // set_html("nodes_inactive_count", simulation.nodes_inactive_count())
    set_html(`${graphics.div_id}-fps`, graphics.get_fps())
    set_html(`${graphics.div_id}-ke`, (kinetic_energy * 100000).toFixed(8))
}
document.body.innerHTML = `
    <div class="column">
        <div class="row">
            <div id="s0" class="simulation"></div>
            <div id="s1" class="simulation"></div>
        </div>
        <div class="row">
            <div id="s2" class="simulation"></div>
            <div id="s3" class="simulation"></div>
        </div>
    </div>
`
const crs = [
    [1.0, 1.],
    [1.0, 2.],
    [1.0, 0.75],
    [1.0, 0.5],
    // [0.0, 0.0, 0.99, 0.01],
]
const simulations = []
for (const id of [0,1,2,3]) {
    const div_id = `s${id}`
    const cr = crs[id]
    set_html(div_id, `
        <div class="left-panel-overlay">
            <div id="infos">
                <p>x: <span id="${div_id}-x"></span></p>
                <p>y: <span id="${div_id}-y"></span></p>
                <p>x2: <span id="${div_id}-x2"></span></p>
                <p>y2: <span id="${div_id}-y2"></span></p>
                <p>physics:  <span id="${div_id}-physic"></span></p>
                <p>graphics: <span id="${div_id}-graphics"></span></p>
                <p>fps:      <span id="${div_id}-fps"></span></p>
                <p>nodes: <span id="${div_id}-nodes_count"></span></p>
                <p>inactive nodes: <span id="${div_id}-nodes_inactive_count"></span></p>
                <p>links: <span id="${div_id}-links_count"></span></p>
                <p>inactive links: <span id="${div_id}-links_inactive_count"></span></p>
                <p>kinectic energy: <span id="${div_id}-ke"></span></p>
            </div>
        </div>
        <canvas id="canvas-${div_id}" class="graphics-canvas"></canvas>
    `)
    const graphics = new Graphics(`canvas-${div_id}`, 0.5, div_id)
    const simulation = await Vellipsis.create({
        crdv: cr[0],
        crdp: cr[1],
        diameter: 0.004,
        gravity: 0.00001,
        central_gravity: 0.0,
        ticker: 10,
        friction_ratio: 0.0,
        max_speed: 1,
    })
    simulations.push(simulation)
    for (const x of config.kinds) {
        simulation.add_kind(x.kind, x.density)
    }
    simulation.add_node_js({
        x: 0.0, 
        y: 0.01,
        kind: 'dirt',
        fixed: true,
    })
    for (let y = 0.02; y < 0.3; y+=0.01) {
        simulation.add_node_js({
            x: 0.0, 
            y: y,
            kind: 'dirt',
            fixed: false,
        })
    }
    graphics.draw_zoom = 2
    tick(simulation, graphics)
}
