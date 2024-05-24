{common}
@group(0) @binding(1) var<storage, read> particle : array<Particle>;
@group(0) @binding(2) var<storage, read_write> particle2 : array<Particle>;
@group(0) @binding(3) var<storage, read> grid : array<u32>;
@group(0) @binding(5) var<storage, read> grid_counter :  array<u32>;
@compute
@workgroup_size(${workgroup_size})
fn main(@builtin(global_invocation_id) global_invocation_id: vec3<u32>) {
    let total = arrayLength(&particle);
    let idx = global_invocation_id.x;
    if (idx >= total) {
        return;
    }
    let p1 = particle[idx];
    var dv = vec2<f32>(0.0, 0.0);
    var dp = vec2<f32>(0.0, 0.0);
    let crdv = 0.05;
    let crdp = 0.05;
    let gp = get_grid_coord(p1.p);
    let diam_sqrd = diameter * diameter;
    for (var a = max(0, gp.x-1); a < min(gp.x+2, GRID_CELL_COUNT_SIDE) ; a++) {
        for (var b = max(0, gp.y-1); b < min(gp.y+2, GRID_CELL_COUNT_SIDE) ; b++) {
            let grididx = u32(a + b * GRID_CELL_COUNT_SIDE);
            for (var i = u32(0); i < grid_counter[grididx] ; i++) {
                let idx2 = grid[ grididx * MAX_NODE_PER_GRID_CELL + i ];
                var p2 = particle[idx2];
                let d_sqrd = distance_sqrd(p1.p, p2.p);
                if d_sqrd <= diam_sqrd && u32(idx2) != idx {
                    let dist = sqrt(d_sqrd);
                    let delta_position = delta(p1.p, p2.p);
                    let dd = (dist - diameter);
                    let dpn_dd = normalize(delta_position) * dd * 1.0 / (2.0) * 2.0;
                    // let dpn_dd = normalize(delta_position) * dd * n1.m / (n1.m + n2.m) * 2.0;
                    dv += dpn_dd * crdv ;
                    dp += dpn_dd * crdp;
                }
            }
        }
    }
    particle2[idx].p = p1.p + dp ;
    // particle2[idx].pp = particle2[idx].p;
    particle2[idx].p += dv;
}
