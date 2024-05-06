use crate::GRID_CELL_COUNT_SIDE;
use crate::MAX_NODE_PER_GRID_CELL;
use std::mem;
use std::num::NonZeroU64;
use wgpu::util::DeviceExt;
use wgpu::Buffer;
use wgpu::Device;

pub struct GridList {
    pub binding: u32,
    pub buffer: Buffer,
    pub min_binding_size: Option<NonZeroU64>,
}

impl GridList {
    pub fn new(device: &Device) -> GridList {
        let binding = 8;
        let data = vec![
            0 as u32;
            (GRID_CELL_COUNT_SIDE * GRID_CELL_COUNT_SIDE * MAX_NODE_PER_GRID_CELL)
                as usize
        ];
        let buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some(&format!("particle buffer in")),
            contents: bytemuck::cast_slice(&data),
            usage: wgpu::BufferUsages::VERTEX
                | wgpu::BufferUsages::STORAGE
                | wgpu::BufferUsages::COPY_DST,
        });
        let min_binding_size = wgpu::BufferSize::new((data.len() * mem::size_of::<i32>()) as _);
        GridList {
            binding,
            buffer,
            min_binding_size,
        }
    }
}
