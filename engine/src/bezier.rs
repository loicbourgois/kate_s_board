#[derive(Clone)]
pub struct Bezier {
    pub idxs: Vec<usize>,
    pub ratio: f64,
    pub z: usize,
}
