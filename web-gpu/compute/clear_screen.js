import { get_shader } from "../misc.js";

class ClearScreen {
    constructor (x) {
        return Promise.resolve()
            .then(async () =>  {
                this.workgroup_size = 256
                const path = "compute/clear_screen.wgsl"
                const module = x.device.createShaderModule({
                    label: path,
                    code: (await get_shader(path)).replace("${workgroup_size}", this.workgroup_size),
                });
                const pipeline = x.device.createComputePipeline({
                    label: 'clear_screen.pipeline',
                    layout: 'auto',
                    compute: {
                        entryPoint: 'main',
                        module,
                    },
                });
                const bindGroup = x.device.createBindGroup({
                    layout: pipeline.getBindGroupLayout(0),
                    entries: [
                        { binding: x.screen.binding, resource: { buffer: x.screen.buffer }},
                    ],
                });
                this.module = module
                this.bindGroup = bindGroup
                this.pipeline = pipeline
                return this; 
            })
    }
    setup_pass(x) {
        const pass = x.encoder.beginComputePass({
            label: 'clearr_screen.pass',
        });
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, this.bindGroup);
        const c = parseInt(Math.ceil(x.screen.w*x.screen.h/this.workgroup_size))
        pass.dispatchWorkgroups(c);
        pass.end();
    }
}

export {
    ClearScreen
}
