import {resize} from "./render.js"
import {render} from "./render.js"
import { tick } from "./tick.js"
import {context_coordinates_2} from "./render.js"
import {set_draw_center} from "./render.js"
import { add_wheel } from "./elements/wheel.js";
import { add_motor } from "./elements/motor.js";


let mouse = {}
let redo_beziers = 0


const launch = (Game, Simulation, wasm) => {
    Simulation.create = (x) => {
        let s = Simulation.new(x)
        s.add_wheel = (a, b) => {
            return add_wheel(s, a, b)
        }
        s.add_motor = (a, b, c) => {
            return add_motor(s, a, b, c)
        }
        return s
    }
    const canvas = document.getElementById("canvas")
    const context = canvas.getContext("2d")
    resize(canvas)
    const game = Game(Simulation, wasm, context)
    set_draw_center(game.draw_center)
    canvas.addEventListener("mousemove", (a) => {
        mouse.canvas_p = {
            x: a.clientX,
            y: a.clientY
        }
        mouse.p = context_coordinates_2(context, mouse.canvas_p)
        document.getElementById("x").innerHTML = mouse.canvas_p.x
        document.getElementById("y").innerHTML = mouse.canvas_p.y
        document.getElementById("x2").innerHTML = mouse.p.x.toFixed(2)
        document.getElementById("y2").innerHTML = mouse.p.y.toFixed(2)
        game.simulation.set_mouse(mouse.p.x, mouse.p.y)
        // if (a.buttons == 1) {
        //     redo_beziers = 1
        //     game.simulation.update_control_point(
        //         game.simulation.focused_cp, 
        //         mouse.p.x, 
        //         mouse.p.y,
        //     )
        // } else {
        //     if (redo_beziers == 1) {
        //         redo_beziers = 0
        //         game.simulation.redo_beziers();
        //         game.simulation.add_node(0.95, -0., false)
        //     }
        // }
    })
    
    render(wasm, game.simulation, context, mouse, game.render)
    tick(wasm, game.simulation, context, game.stepper, game.render)
}


export {
    launch,
}
