class GpuContext {
    constructor (x) {
        const size = 6*4
        const buffer = x.device.createBuffer({
            label: `context`,
            size: size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        const data = new Float32Array(size / 4);
        this.buffer = buffer
        this.data = data
        this.binding = 0
    }
    update (x) {
        this.data.set([
            x.canvas.w,
            x.canvas.h,
            x.screen.w,
            x.screen.h,
            Math.max(0.0001, x.diameter),
        ], 0)
        x.device.queue.writeBuffer(this.buffer, 0, this.data);
    }
}
export {
    GpuContext
}