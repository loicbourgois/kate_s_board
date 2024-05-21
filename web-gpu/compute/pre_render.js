import { get_shader } from "../misc.js";

class PreRender {
    constructor (x) {
        return Promise.resolve()
            .then(async () =>  {
                this.workgroup_size = 256
                const path = "compute/pre_render.wgsl"
                const module = x.device.createShaderModule({
                    label: path,
                    code: (await get_shader(path)).replace("${workgroup_size}", this.workgroup_size),
                });
                const pipeline = x.device.createComputePipeline({
                    label: 'pre_render.pipeline',
                    layout: 'auto',
                    compute: {
                        entryPoint: 'main',
                        module,
                    },
                });
                const bind_groups = [
                    x.device.createBindGroup({
                        layout: pipeline.getBindGroupLayout(0),
                        entries: [
                            { binding: x.screen.binding, resource: { buffer: x.screen.buffer }},
                            { binding: x.gpu_context.binding, resource: { buffer: x.gpu_context.buffer }},
                            { binding: x.particle.bindings[0], resource: { buffer: x.particle.buffers[1] }},
                        ],
                    }),
                    x.device.createBindGroup({
                        layout: pipeline.getBindGroupLayout(0),
                        entries: [
                            { binding: x.screen.binding, resource: { buffer: x.screen.buffer }},
                            { binding: x.gpu_context.binding, resource: { buffer: x.gpu_context.buffer }},
                            { binding: x.particle.bindings[0], resource: { buffer: x.particle.buffers[0] }},
                        ],
                    }),
                ];
                this.module = module
                this.bind_groups = bind_groups
                this.pipeline = pipeline
                return this;
            })
    }
    setup_pass(x) {
        const pass = x.encoder.beginComputePass({
            label: 'pre_render.pass',
        });
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, this.bind_groups[x.step%2]);
        const cc = parseInt(Math.ceil(x.particle.particle_count / this.workgroup_size))
        pass.dispatchWorkgroups(cc);
        pass.end();
    }
}

export {
    PreRender
}
