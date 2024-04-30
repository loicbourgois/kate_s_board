use std::mem;
use wgpu::util::DeviceExt;
use wgpu::Buffer;
use wgpu::Device;

pub struct ParticleCounter {
    pub buffers: Vec<Buffer>,
    pub bind_group_layout_entries: Vec<wgpu::BindGroupLayoutEntry>,
    pub bindings: Vec<u32>,
}

impl ParticleCounter {
    pub fn new(device: &Device) -> ParticleCounter {
        let bindings: Vec<u32> = vec![5, 6];
        let mut buffers = Vec::<wgpu::Buffer>::new();
        let mut bind_group_layout_entries = Vec::<wgpu::BindGroupLayoutEntry>::new();
        for i in 0..2 {
            let mut data: Vec<i32> = Vec::new();
            data.push(0);
            buffers.push(
                device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
                    label: Some("particle_counter_buffer"),
                    contents: bytemuck::cast_slice(&data),
                    usage: wgpu::BufferUsages::VERTEX
                        | wgpu::BufferUsages::STORAGE
                        | wgpu::BufferUsages::COPY_DST
                        | wgpu::BufferUsages::COPY_SRC,
                }),
            );
            bind_group_layout_entries.push(wgpu::BindGroupLayoutEntry {
                binding: bindings[i],
                visibility: wgpu::ShaderStages::COMPUTE,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Storage { read_only: false },
                    has_dynamic_offset: false,
                    min_binding_size: wgpu::BufferSize::new(
                        (data.len() * mem::size_of::<i32>()) as _,
                    ),
                },
                count: None,
            });
        }
        // println!("{:?}", buffers[0]);

        // let slice = buffers[0].slice(0..4);
        // slice.map_async(wgpu::MapMode::Read, |result| {
        //     match result {
        //         Ok(()) => {
        //             let view = slice.get_mapped_range();
        //             println!("{:?}", view);
        //             // read data from `view`, which dereferences to `&[u8]`
        //         }
        //         Err(e) => {
        //             // handle mapping error
        //         }
        //     }
        // });

        ParticleCounter {
            buffers,
            bindings,
            bind_group_layout_entries,
        }
    }
}
