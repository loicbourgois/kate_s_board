{common}
@group(0) @binding(7) var<storage, read_write> grid_counter : array<i32>;
@compute
@workgroup_size(64)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
  let total = arrayLength(&grid_counter);
  let idx = global_invocation_id.x;
  if (idx >= total) {
    return;
  }
  grid_counter[idx] = 0;
}
