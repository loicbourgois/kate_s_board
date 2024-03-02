use crate::vector::Vector;

pub struct VectorIsize {
    pub x: isize,
    pub y: isize,
}

pub struct Node {
    pub p: Vector,
    pub pp: Vector,
    pub dp: Vector,
    pub dv: Vector,
    pub v: Vector,
    pub grid: VectorIsize,
    pub m: f64,
    pub z: usize,
    pub idx: usize,
    pub fixed: bool,
}
