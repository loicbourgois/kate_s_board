import { get_shader } from "../misc.js";
class Render {
    constructor (x) {
        return Promise.resolve()
            .then(async () =>  {
                const module = x.device.createShaderModule({
                    label: "compute/render.wgsl",
                    code: await get_shader("compute/render.wgsl"),
                });
                const pipeline = x.device.createRenderPipeline({
                    label: 'pipeline',
                    layout: 'auto',
                    vertex: {
                        entryPoint: 'vs',
                        module,
                    },
                    fragment: {
                        entryPoint: 'fs',
                        module,
                        targets: [{ format: x.presentationFormat }],
                    },
                });
                const bindGroup = x.device.createBindGroup({
                    layout: pipeline.getBindGroupLayout(0),
                    entries: [
                        { binding: x.screen.binding, resource: { buffer: x.screen.buffer }},
                        { binding: x.gpu_context.binding, resource: { buffer: x.gpu_context.buffer }},
                    ],
                });
                const passDescriptor = {
                    label: 'our basic canvas renderPass',
                    colorAttachments: [
                        {
                            clearValue: [0.3, 0.3, 0.3, 1],
                            loadOp: 'clear',
                            storeOp: 'store',
                        },
                    ],
                };
                this.pipeline = pipeline
                this.passDescriptor = passDescriptor
                this.bindGroup = bindGroup
                return this; 
            });
    }
    setup_pass(x) {
        this.passDescriptor.colorAttachments[0].view = x.context.getCurrentTexture().createView();
        const pass = x.encoder.beginRenderPass(this.passDescriptor);
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, this.bindGroup);
        pass.draw(6);
        pass.end();
    }
}

export {
    Render,
}