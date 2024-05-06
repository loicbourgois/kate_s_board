use crate::app_state::AppState;
use crate::common::get_common;
use crate::particle_counter::ParticleCounter;
use crate::ComputeGridReset;
use crate::GridList;
use crate::NUM_PARTICLES;
use crate::PARTICLE_SIZE;
use crate::WINDOW_HEIGHT;
use crate::WINDOW_WIDTH;
use std::borrow::Cow;
use std::mem;
use wgpu::BindGroup;
use wgpu::Buffer;
use wgpu::CommandEncoder;
use wgpu::ComputePipeline;
use wgpu::Device;

pub fn get_compute_stuff(
    device: &Device,
    compute_grid_reset: &ComputeGridReset,
    particle_counter: &ParticleCounter,
    screen_buffers: &Vec<Buffer>,
    particle_buffers: &Vec<Buffer>,
    app_state_buffer: &Buffer,
    grid_list: &GridList,
) -> (ComputePipeline, Vec<BindGroup>) {
    let source = include_str!("compute_1.wgsl").replace("{common}", &get_common());
    let compute_shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
        label: None,
        source: wgpu::ShaderSource::Wgsl(Cow::Borrowed(&source)),
    });
    let compute_bind_group_layout =
        device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            entries: &[
                wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Uniform,
                        has_dynamic_offset: false,
                        min_binding_size: wgpu::BufferSize::new(
                            std::mem::size_of::<AppState>() as u64
                        ),
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: 1,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: true },
                        has_dynamic_offset: false,
                        min_binding_size: wgpu::BufferSize::new(
                            (NUM_PARTICLES * PARTICLE_SIZE * 4) as _,
                        ),
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: 2,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: false },
                        has_dynamic_offset: false,
                        min_binding_size: wgpu::BufferSize::new(
                            (NUM_PARTICLES * PARTICLE_SIZE * 4) as _,
                        ),
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: 3,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: false },
                        has_dynamic_offset: false,
                        min_binding_size: wgpu::BufferSize::new(
                            (WINDOW_WIDTH * WINDOW_HEIGHT * mem::size_of::<f32>()) as _,
                        ),
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: 4,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: false },
                        has_dynamic_offset: false,
                        min_binding_size: wgpu::BufferSize::new(
                            (WINDOW_WIDTH * WINDOW_HEIGHT * mem::size_of::<f32>()) as _,
                        ),
                    },
                    count: None,
                },
                particle_counter.bind_group_layout_entries[0],
                particle_counter.bind_group_layout_entries[1],
                wgpu::BindGroupLayoutEntry {
                    binding: 7,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: true },
                        has_dynamic_offset: false,
                        min_binding_size: compute_grid_reset.min_binding_size,
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: grid_list.binding,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: true },
                        has_dynamic_offset: false,
                        min_binding_size: grid_list.min_binding_size,
                    },
                    count: None,
                },
            ],
            label: None,
        });

    let compute_pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
        label: Some("compute"),
        bind_group_layouts: &[&compute_bind_group_layout],
        push_constant_ranges: &[],
    });
    let mut compute_bind_groups = Vec::<wgpu::BindGroup>::new();
    for i in 0..2 {
        compute_bind_groups.push(device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &compute_bind_group_layout,
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 0,
                    resource: app_state_buffer.as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 1,
                    resource: particle_buffers[i].as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 2,
                    resource: particle_buffers[(i + 1) % 2].as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 3,
                    resource: screen_buffers[i].as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 4,
                    resource: screen_buffers[(i + 1) % 2].as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: particle_counter.bindings[0],
                    resource: particle_counter.buffers[i].as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: particle_counter.bindings[1],
                    resource: particle_counter.buffers[(i + 1) % 2].as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: compute_grid_reset.counter_binding,
                    resource: compute_grid_reset.counter_buffer.as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: grid_list.binding,
                    resource: grid_list.buffer.as_entire_binding(),
                },
            ],
            label: None,
        }));
    }
    let compute_pipeline = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
        label: Some("Compute pipeline"),
        layout: Some(&compute_pipeline_layout),
        module: &compute_shader,
        entry_point: "main",
    });
    return (compute_pipeline, compute_bind_groups);
}

pub fn compute_setup_pass(
    encoder: &mut CommandEncoder,
    compute_pipeline: &ComputePipeline,
    compute_bind_groups: &Vec<BindGroup>,
    work_group_count: u32,
    frame_num: usize,
) {
    let mut cpass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
        label: None,
        timestamp_writes: None,
    });
    cpass.set_pipeline(&compute_pipeline);
    cpass.set_bind_group(0, &compute_bind_groups[frame_num % 2], &[]);
    cpass.dispatch_workgroups(work_group_count, 1, 1);
}
