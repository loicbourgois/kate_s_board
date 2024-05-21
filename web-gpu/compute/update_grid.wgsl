{common}
@group(0) @binding(1) var<storage, read> particle : array<Particle>;
@group(0) @binding(5) var<storage, read_write> grid_counter :  array<atomic<u32>>;
@group(0) @binding(3) var<storage, read_write> grid : array<u32>;
@compute
@workgroup_size(${workgroup_size})
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
    let total = arrayLength(&particle);
    let idx = global_invocation_id.x;
    if (idx >= total) {
        return;
    }
    let p1 = particle[idx];
    let p = p1.p;
    let gp = get_grid_coord(p);
    let grididx = max(0, min(gp.x + gp.y * GRID_CELL_COUNT_SIDE, GRID_CELL_COUNT_SIDE*GRID_CELL_COUNT_SIDE-1));
    let aa = atomicAdd(&grid_counter[grididx], u32(1));
    let uu = u32(grididx) * MAX_NODE_PER_GRID_CELL;
    let dd = aa % MAX_NODE_PER_GRID_CELL;
    let grid_list_idx = uu + dd;
    grid[grid_list_idx] = idx;
}
