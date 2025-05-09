@group(0) @binding(4) var<storage, read_write> screen : array<f32>;
@compute
@workgroup_size(${workgroup_size})
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
  let total = arrayLength(&screen);
  let idx = global_invocation_id.x;
  if (idx >= total) {
    return;
  }
  screen[idx] = 0.0;
}
