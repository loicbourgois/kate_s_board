use serde::Deserialize;
use wasm_bindgen::prelude::wasm_bindgen;
#[derive(Copy, Clone, Debug, Deserialize)]
#[wasm_bindgen]
pub struct Vector {
    pub x: f64,
    pub y: f64,
}

impl Vector {
    pub fn new() -> Vector {
        Vector { x: 0.0, y: 0.0 }
    }
}
