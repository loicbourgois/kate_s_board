class GridCounter {
    constructor (x) {
        const size = x.grid.w*x.grid.h*4
        const buffer = x.device.createBuffer({
            label: `grid_counter.buffer`,
            size: size,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        });
        const read_buffer = x.device.createBuffer({
            label: 'grid_counter.read_buffer',
            size: size,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
        });
        const data = new Uint32Array(size / 4);
        x.device.queue.writeBuffer(buffer, 0, data);
        this.buffer = buffer
        this.data = data
        this.read_buffer = read_buffer
        this.binding = 5
    }
}
export {
    GridCounter
}
