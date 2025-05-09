class Grid {
    constructor (x) {
        this.w = 512
        this.h = this.w
        this.max_node_per_grid_cell = 128
        const size = this.w*this.h*this.max_node_per_grid_cell*4
        const buffer = x.device.createBuffer({
            label: `grid`,
            size: size,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        const data = new Uint32Array(size / 4);
        x.device.queue.writeBuffer(buffer, 0, data);
        this.buffer = buffer
        this.data = data
        this.binding = 3
    }
}
export {
    Grid
}