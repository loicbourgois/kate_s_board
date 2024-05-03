{common}


@group(0) @binding(0) var<uniform> sp : AppState;
@group(0) @binding(1) var<storage, read> nis : array<Node>;
@group(0) @binding(7) var<storage, read_write> grid_counter : array<atomic<i32>>;
@group(0) @binding(8) var<storage, read_write> grid_list : array<i32>;


@compute
@workgroup_size(64)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
  let total = arrayLength(&nis);
  let idx = global_invocation_id.x;
  if (idx >= total) {
    return;
  }
  var n1 = nis[idx];
  let p = n1.p;
  let gp = get_grid_coord(p);
  let grididx = min(gp.x + gp.y * grid_cell_count_side, grid_cell_count_side*grid_cell_count_side-1);
  let aa = atomicAdd(&grid_counter[grididx], 1);
  let grid_list_idx = grididx * MAX_NODE_PER_GRID_CELL + (aa % MAX_NODE_PER_GRID_CELL);
  grid_list[grid_list_idx] = i32(idx);
}
