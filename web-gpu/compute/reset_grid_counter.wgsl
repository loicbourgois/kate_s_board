@group(0) @binding(5) var<storage, read_write> grid_counter : array<u32>;
@compute
@workgroup_size(${workgroup_size})
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
    let total = arrayLength(&grid_counter);
    let idx = global_invocation_id.x;
    if (idx >= total) {
        return;
    }
    grid_counter[idx] = u32(0);
}
