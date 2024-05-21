{common}
// @group(0) @binding(0) var<uniform> gpu_context : GpuContext;
@group(0) @binding(1) var<storage, read> particle : array<Particle>;
@group(0) @binding(2) var<storage, read_write> particle2 : array<Particle>;
@compute
@workgroup_size(${workgroup_size})
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
    let total = arrayLength(&particle);
    let idx = global_invocation_id.x;
    if (idx >= total) {
        return;
    }
    let p1 = particle[idx];
    particle2[idx].p.x = p1.p.x;
    particle2[idx].p.y = p1.p.y;
}
