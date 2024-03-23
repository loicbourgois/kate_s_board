import { test } from "./test.js";
import init, {Simulation} from "./wasm_engine.js";
import { launch  } from "./launcher.js";
import { ping_pong } from "./games/ping_pong.js"
import { three_wheel_drive } from "./games/three_wheel_drive.js"
import { figure_eight } from "./games/figure_eight.js"
import { inverted_pendulum } from "./games/inverted_pendulum.js"
import { autopilot } from "./games/autopilot.js"


const games = {
    'ping_pong': ping_pong,
    'three_wheel_drive': three_wheel_drive,
    'figure_eight': figure_eight,
    'inverted_pendulum': inverted_pendulum,
    'autopilot': autopilot,
}


const main = (wasm) => {
    document.body.innerHTML = `
        <div id="left">
            <div id="infos">
                <p>x: <span id="x"></span></p>
                <p>y: <span id="y"></span></p>
                <p>x2: <span id="x2"></span></p>
                <p>y2: <span id="y2"></span></p>
                <p>physic: <span id="physic"></span></p>
                <p>nodes: <span id="nodes_count"></span></p>
            </div>
            <div id="sliders"></div>
        </div>
        <canvas id="canvas"></canvas>
    `
    launch(games['autopilot'], Simulation, wasm)
}


init().then( async (wasm) => {
    test(wasm, Simulation)
    main(wasm);
})
