use serde::{Deserialize, Serialize};

pub const LINK_SIZE: usize = 5 * 8 + 6 * 4;

#[derive(Deserialize, Serialize, Clone)]
pub struct Linking {
    pub stress_limit: f64,
    pub damping: f64,
    pub length: f64,
    pub strength: f64,
}

pub struct Link {
    pub length: f64,
    pub strength: f64,
    pub damping: f64,
    pub stress: f64,
    pub stress_limit: f64,
    pub a: usize,
    pub b: usize,
    pub uid: usize,
    pub idx: usize,
    pub active: u8,
}
