use crate::DIAMETER;
use crate::NUM_PARTICLES;
use crate::NUM_PARTICLE_SQRT;
use crate::PARTICLE_SIZE;
use nanorand::Rng;
use nanorand::WyRand;
use std::mem;
use std::num::NonZeroU64;
use wgpu::util::DeviceExt;
use wgpu::Buffer;
use wgpu::Device;

pub struct Nodes {
    pub binding_in: u32,
    pub buffers: Vec<Buffer>,
    pub min_binding_size: Option<NonZeroU64>,
}

impl Nodes {
    pub fn new(device: &Device) -> Nodes {
        let binding_in = 1;
        let mut data = vec![0.0f32; PARTICLE_SIZE * NUM_PARTICLES];
        let aa = NUM_PARTICLE_SQRT as f32 * DIAMETER;
        let mut rng = WyRand::new_seed(42);
        for i in 0..NUM_PARTICLE_SQRT {
            for j in 0..NUM_PARTICLE_SQRT {
                let idx = (i + j * NUM_PARTICLE_SQRT) * PARTICLE_SIZE;
                data[idx] = i as f32 * DIAMETER * 2.0 - aa;
                data[idx + 1] = j as f32 * DIAMETER * 2.0 - aa;
                data[idx + 2] = data[idx];
                data[idx + 3] = data[idx + 1];
                data[idx + 4] = if rng.generate::<f32>() < 0.1 {
                    1.0
                } else {
                    0.5
                };
                // data[idx + 4] = rng.generate::<f32>() * 0.9 + 0.1;
            }
        }
        let mut buffers = Vec::new();
        for _ in 0..2 {
            buffers.push(
                device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
                    label: Some("particle buffer in"),
                    contents: bytemuck::cast_slice(&data),
                    usage: wgpu::BufferUsages::VERTEX
                        | wgpu::BufferUsages::STORAGE
                        | wgpu::BufferUsages::COPY_DST,
                }),
            );
        }
        let min_binding_size = wgpu::BufferSize::new((data.len() * mem::size_of::<i32>()) as _);
        Nodes {
            binding_in,
            buffers,
            min_binding_size,
        }
    }
}
