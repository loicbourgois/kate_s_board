class Screen {
    constructor (x) {
        this.w = 2000
        this.h = 2000
        const size = this.w*this.h*4
        const buffer = x.device.createBuffer({
            label: `screen`,
            size: size,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        const data = new Float32Array(size / 4);
        for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 100; j++) {
                const id = i + j * 2000
                data.set([1], id);
            }
        }
        x.device.queue.writeBuffer(buffer, 0, data);
        this.buffer = buffer
        this.data = data
        this.binding = 4
    }
}
export {
    Screen
}