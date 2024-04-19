import { test } from "./vellipsis/test.js";
import init, {Simulation} from "./vellipsis/vellipsis_wasm.js";
init().then( async (wasm) => {
    test(wasm, Simulation)
})
