import { test } from "./vellipsis/test.js";
import init, {Simulation} from "./vellipsis/vellipsis_wasm.js";
import {get_folders} from './list-folders.js'
init().then( async (wasm) => {
    await test(wasm, Simulation)
    const folders = get_folders()
    let links = ""
    for (const f of folders) {
        const aa = f.trim()
        if (aa.length) {
            links += `<a href="/${aa}">${aa}</a>`
        }
    }
    document.body.innerHTML = `
        <div id="links">
            ${links}
        </div>
    `
})
