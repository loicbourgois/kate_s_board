class Particle {
    constructor (x) {
        this.particle_count = 200
        this.particle_size = 2
        const size = this.particle_count * this.particle_size * 4
        const buffers = [
            x.device.createBuffer({
                label: `particle_a`,
                size: size,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            }),
            x.device.createBuffer({
                label: `particle_b`,
                size: size,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            }),
        ]
        const datas = [
            new Float32Array(size / 4),
            new Float32Array(size / 4),
        ]
        for (let i = 0; i < this.particle_count * this.particle_size; i++) {
            datas[0].set([
                Math.random() * 9.0 - 4.5
            ], i);
        }
        x.device.queue.writeBuffer(buffers[0], 0, datas[0]);
        x.device.queue.writeBuffer(buffers[1], 0, datas[1]);
        this.buffers = buffers
        this.datas = datas
        this.bindings = [1,2]
    }
}
export {
    Particle
}