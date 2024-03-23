import {render} from "./render.js"


const tick = (wasm, s, context, stepper, custom_render) => {
    const start = performance.now()
    s.tick()
    const d = performance.now() - start
    let m = `${d} ms`
    if (d < 10) {
        m = `0${m}`
    }
    document.getElementById("physic").innerHTML = m
    stepper()
    render(wasm, s, context, null, custom_render)
    requestAnimationFrame(() => {
        tick(wasm, s, context, stepper, custom_render)
    })
}

export {
    tick,
}
