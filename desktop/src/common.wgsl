struct Node {
  p : vec2<f32>,
  pp: vec2<f32>,
};
struct AppState {
    window_width: f32,
    window_height: f32,
    num_particles: i32,
    diameter: f32,
};
fn delta(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return b - a;
}
fn distance_sqrd(a: vec2<f32>, b: vec2<f32>) -> f32{
  let dp = delta(a, b);
  return dp.x * dp.x + dp.y * dp.y;
}
fn distance(a: vec2<f32>, b: vec2<f32>) -> f32{
  return sqrt(distance_sqrd(a, b));
}
const grid_cell_count_side = 64;
const MAX_NODE_PER_GRID_CELL = 1024*8;
const diameter = 0.01;
fn get_grid_coord(p: vec2<f32>) -> vec2<i32> {
  let gridx = max(0, min(i32(floor(p.x / diameter)), grid_cell_count_side-1));
  let gridy = max(0, min(i32(floor(p.y / diameter)), grid_cell_count_side-1));
  return vec2(gridx, gridy);
}