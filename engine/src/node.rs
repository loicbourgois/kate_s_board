use crate::link::Linking;
use crate::vector::Vector;
use serde::{Deserialize, Serialize};
pub const NODE_SIZE: usize = 6 * 16 + 4 * 8 + 4 * 4;

#[derive(Deserialize, Serialize)]
pub struct InteractionConfig {
    pub k1: String,
    pub k2: String,
    pub linking: Option<Linking>,
    pub crdv: f64, // collision response velocity
    pub crdp: f64, // collision response position
    pub friction_ratio: f64,
}

#[derive(Clone)]
pub struct Interaction {
    pub k1: usize,
    pub k2: usize,
    pub k1_str: String,
    pub k2_str: String,
    pub linking: Option<Linking>,
    pub crdv: f64, // collision response velocity
    pub crdp: f64, // collision response position
    pub friction_ratio: f64,
}

pub struct VectorIsize {
    pub x: isize,
    pub y: isize,
}

#[derive(Clone)]
pub struct Kind {
    pub id: usize,
    pub mass: f64,
}

#[derive(Deserialize, Serialize)]
pub struct NodeConfig {
    pub x: f64,
    pub y: f64,
    pub turbo_max_speed: f64,
    pub fixed: bool,
}

#[derive(Deserialize, Serialize)]
pub struct NodeConfig2 {
    pub x: f64,
    pub y: f64,
    pub turbo_max_speed: Option<f64>,
    pub fixed: Option<bool>,
    pub dx: Option<f64>,
    pub dy: Option<f64>,
    pub kind: String,
}

pub struct Node {
    pub p: Vector,
    pub pp: Vector,
    pub dp: Vector,
    pub dv: Vector,
    pub v: Vector,
    pub direction: Vector,

    pub grid: VectorIsize,
    pub m: f64,
    pub turbo_max_speed: f64,
    pub turbo_rate: f64,

    pub z: usize,
    pub idx: usize,
    pub kind: usize,
    pub active: u8,
    pub fixed: bool,
}
