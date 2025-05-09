import {ClearScreen} from "./compute/clear_screen.js"
import {Screen} from "./data/screen.js"
import {Render} from "./compute/render.js"
import {GpuContext} from "./data/gpu_context.js"
import { ColorTest } from "./compute/color_test.js";
import { Particle } from "./data/particle.js";
import { PreRender } from "./compute/pre_render.js";
import { Physic } from "./compute/physic.js";
import { Grid } from "./data/grid.js";
import { GridCounter } from "./data/grid_counter.js";
import { ResetGridCounter } from "./compute/reset_grid_counter.js";
import { UpdateGrid } from "./compute/update_grid.js";

async function main() {
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();
    if (!device) {
        fail('need a browser that supports WebGPU');
        return;
    }
    const canvas = document.querySelector('canvas');
    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            const canvas = entry.target;
            const width = entry.contentBoxSize[0].inlineSize;
            const height = entry.contentBoxSize[0].blockSize;
            canvas.width = Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
            canvas.height = Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
        }
    });
    observer.observe(canvas);
    const context = canvas.getContext('webgpu');
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format: presentationFormat,
    });
    // data
    const gpu_context = new GpuContext({
        device: device, 
    })
    const screen = new Screen({
        device: device, 
    })
    const particle = new Particle({
        device: device,
    })
    const grid = new Grid({
        device: device,
    })
    const grid_counter = new GridCounter({
        device: device,
        grid: grid,
    })
    // compute
    const clear_screen = await (new ClearScreen({
        device: device,
        screen: screen,
    }))
    const color_test = await (new ColorTest({
        device: device,
        screen: screen,
        gpu_context: gpu_context,
    }))
    const reset_grid_counter = await (new ResetGridCounter({
        device: device,
        grid_counter: grid_counter,
        grid: grid,
    }))
    const update_grid = await (new UpdateGrid({
        device: device,
        particle: particle,
        grid_counter: grid_counter,
        grid: grid,
    }))
    const physic = await (new Physic({
        device: device,
        screen: screen,
        gpu_context: gpu_context,
        particle: particle,
        grid: grid,
        grid_counter: grid_counter,
    }))
    const pre_render = await (new PreRender({
        device: device,
        screen: screen,
        gpu_context: gpu_context,
        particle: particle,
    }))
    const render = await (new Render ({
        device,
        presentationFormat,
        screen,
        gpu_context,
    }))
    // go
    step({
        render: render,
        context: context,
        device: device,
        gpu_context: gpu_context,
        screen: screen,
        clear_screen: clear_screen,
        color_test: color_test,
        pre_render: pre_render,
        particle: particle,
        physic: physic,
        step: 0,
        grid: grid,
        grid_counter: grid_counter,
        reset_grid_counter: reset_grid_counter,
        update_grid: update_grid,
    });
}
let start = performance.now()
async function step(x) {
    const elapsed = performance.now() - start
    document.querySelector("#elapsed").innerHTML = elapsed.toFixed(1)
    start = performance.now()
    const encoder = x.device.createCommandEncoder({ label: 'encoder' });
    x.gpu_context.update({
        canvas: {
            w: x.context.canvas.width,
            h: x.context.canvas.height,
        },
        screen: {
            w: x.screen.w,
            h: x.screen.h,
        },
        device: x.device,
    })
    x.clear_screen.setup_pass({encoder, screen:x.screen});
    x.color_test.setup_pass({encoder, screen:x.screen});
    x.reset_grid_counter.setup_pass({encoder, grid:x.grid});
    x.update_grid.setup_pass({encoder, grid:x.grid, particle:x.particle, step:x.step});
    x.physic.setup_pass({encoder, screen:x.screen, particle:x.particle, step:x.step});
    x.pre_render.setup_pass({encoder, screen:x.screen, particle:x.particle, step:x.step});
    x.render.setup_pass({encoder,context:x.context});
    encoder.copyBufferToBuffer(x.grid_counter.buffer, 0, x.grid_counter.read_buffer, 0, x.grid_counter.read_buffer.size);
    const commandBuffer = encoder.finish();
    x.device.queue.submit([commandBuffer]);
    await x.grid_counter.read_buffer.mapAsync(GPUMapMode.READ);
    const result = new Uint32Array(x.grid_counter.read_buffer.getMappedRange());
    let s = 0
    let max_value = 0
    let max_idx = 0
    for (let index = 0; index < result.length; index++) {
        const value = result[index];
        s += value
        if (value > max_value) {
            max_value = value
            max_idx = index
        }
    }
    x.grid_counter.read_buffer.unmap();
    document.querySelector("#grid_total").innerHTML = s
    document.querySelector("#grid_max_idx").innerHTML = max_idx
    document.querySelector("#grid_max_value").innerHTML = max_value
    x.step += 1;
    setTimeout(async ()=>{
        await step(x)
    },0)
}
main()
