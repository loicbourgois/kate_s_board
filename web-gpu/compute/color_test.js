import { get_shader } from "../misc.js";

class ColorTest {
    constructor (x) {
        return Promise.resolve()
            .then(async () =>  {
                this.workgroup_size = 1
                const path = "compute/color_test.wgsl"
                const module = x.device.createShaderModule({
                    label: path,
                    code: (await get_shader(path)).replace("${workgroup_size}", this.workgroup_size),
                });
                const pipeline = x.device.createComputePipeline({
                    label: 'color_test.pipeline',
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
                        { binding: x.gpu_context.binding, resource: { buffer: x.gpu_context.buffer }},
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
            label: 'color_test.pass',
        });
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, this.bindGroup);
        pass.dispatchWorkgroups(1);
        pass.end();
    }
}

export {
    ColorTest
}
