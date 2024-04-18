import init, {Simulation as Vellipsis} from "../wasm_engine.js";

Vellipsis.create = (x) => {
    let s = Vellipsis.new(x)
    s.add_wheel = (a, b) => {
        return add_wheel(s, a, b)
    }
    s.add_motor = (a, b, c) => {
        return add_motor(s, a, b, c)
    }
    return s
}

export {
    Vellipsis,
    init,
}
