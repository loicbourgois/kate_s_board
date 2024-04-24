import init, {Simulation as Vellipsis, set_panic_hook} from "./vellipsis_wasm.js";
import { link } from "./link.js";
import { node } from "./node.js";
import { add_wheel } from "./elements/wheel.js"
import { add_motor } from "./elements/motor.js"


Vellipsis.create = (config) => {
    return init().then( async (wasm) => {
        set_panic_hook();
        let s = Vellipsis.new(JSON.stringify(config))
        s.add_wheel = (a, b) => {
            return add_wheel(s, a, b)
        }
        s.add_motor = (a, b, c) => {
            return add_motor(s, a, b, c)
        }
        s.add_node_js = (x) => {
            return s.add_node_4(JSON.stringify(x))
        }
        s.set_linking_config = (x) => {
            return s.set_linking_config_(JSON.stringify(x))
        }
        s.links = function* () {
            const nodes_ptr = s.nodes_ptr();
            const node_size = s.node_size();
            const nodes_view = new DataView(wasm.memory.buffer, nodes_ptr, s.nodes_size());
            const links_ptr = s.links_ptr();
            const link_size = s.link_size();
            const links_count = s.links_count()
            const links_view = new DataView(wasm.memory.buffer, links_ptr, s.links_size());
            for (let index = 0; index < links_count; index++) {
                yield link(links_view, index, link_size, nodes_view, node_size);
            }
        }
        s.nodes = function* () {
            const nodes_ptr = s.nodes_ptr();
            const node_size = s.node_size();
            const nodes_view = new DataView(wasm.memory.buffer, nodes_ptr, s.nodes_size());
            const nodes_count = s.nodes_count()
            for (let index = 0; index < nodes_count; index++) {
                yield node(nodes_view, index, node_size);
            }
        }
        return s
    })
}


export {
    Vellipsis,
}
