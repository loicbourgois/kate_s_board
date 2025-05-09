import { get_shader } from "../misc.js";

class ResetGridCounter {
    constructor (x) {
        return Promise.resolve()
            .then(async () =>  {
                this.workgroup_size = 64
                const path = "compute/reset_grid_counter.wgsl"
                const module = x.device.createShaderModule({
                    label: path,
                    code: (await get_shader(path)).replace("${workgroup_size}", this.workgroup_size),
                });
                const pipeline = x.device.createComputePipeline({
                    label: 'reset_grid_counter.pipeline',
                    layout: 'auto',
                    compute: {
                        entryPoint: 'main',
                        module,
                    },
                });
                const bindGroup = x.device.createBindGroup({
                    layout: pipeline.getBindGroupLayout(0),
                    entries: [
                        { binding: x.grid_counter.binding, resource: { buffer: x.grid_counter.buffer }},
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
            label: 'reset_grid_counter.pass',
        });
        const cc = parseInt(Math.ceil(x.grid.w * x.grid.h / this.workgroup_size))
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, this.bindGroup);
        pass.dispatchWorkgroups(cc);
        pass.end();
    }
}

export {
    ResetGridCounter
}
