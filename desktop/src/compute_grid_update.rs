use crate::ComputeGridReset;
use crate::Nodes;
use crate::MAX_NODE_PER_GRID_CELL;
use crate::NUM_PARTICLES;
use crate::PARTICLE_SIZE;
use std::borrow::Cow;
use std::mem;
use wgpu::util::DeviceExt;
use wgpu::BindGroup;
use wgpu::BindGroupLayout;
use wgpu::BindGroupLayoutEntry;
use wgpu::Buffer;
use wgpu::CommandEncoder;
use wgpu::ComputePipeline;
use wgpu::Device;
use wgpu::ShaderModule;

const GRID_CELL_COUNT_SIDE: usize = 64;

pub struct ComputeGridUpdate {
    // Data related
    pub buffer: Buffer,
    pub bind_group_layout_entry: BindGroupLayoutEntry,
    pub binding: u32,
    // Shader related
    pub shader: ShaderModule,
    pub pipeline: ComputePipeline,
    pub bind_group: BindGroup,
    pub bind_group_layout: BindGroupLayout,
    pub work_group_count: u32,
}

impl ComputeGridUpdate {
    pub fn new(
        device: &Device,
        nodes: &Nodes,
        app_state_buffer: &Buffer,
        compute_grid_reset: &ComputeGridReset,
        work_group_count: u32,
    ) -> ComputeGridUpdate {
        let mut data: Vec<i32> = Vec::new();
        for _ in 0..GRID_CELL_COUNT_SIDE * GRID_CELL_COUNT_SIDE * MAX_NODE_PER_GRID_CELL {
            data.push(0);
        }
        let buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("ComputeGrid.list_buffer"),
            contents: bytemuck::cast_slice(&data),
            usage: wgpu::BufferUsages::VERTEX
                | wgpu::BufferUsages::STORAGE
                | wgpu::BufferUsages::COPY_DST
                | wgpu::BufferUsages::COPY_SRC,
        });
        let shader_source = include_str!("compute_grid_update.wgsl")
            .replace("{common}", include_str!("common.wgsl"));
        let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: None,
            source: wgpu::ShaderSource::Wgsl(Cow::Borrowed(&shader_source)),
        });
        let binding = 8;
        let bind_group_layout_entry = wgpu::BindGroupLayoutEntry {
            binding: binding,
            visibility: wgpu::ShaderStages::COMPUTE,
            ty: wgpu::BindingType::Buffer {
                ty: wgpu::BufferBindingType::Storage { read_only: false },
                has_dynamic_offset: false,
                min_binding_size: wgpu::BufferSize::new((data.len() * mem::size_of::<i32>()) as _),
            },
            count: None,
        };
        let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            entries: &[
                wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Uniform,
                        has_dynamic_offset: false,
                        min_binding_size: wgpu::BufferSize::new(16), //std::mem::size_of::<AppState>() as u64,
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: nodes.binding_in,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: true },
                        has_dynamic_offset: false,
                        min_binding_size: nodes.min_binding_size,
                    },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: compute_grid_reset.counter_binding,
                    visibility: wgpu::ShaderStages::COMPUTE,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Storage { read_only: false },
                        has_dynamic_offset: false,
                        min_binding_size: compute_grid_reset.min_binding_size,
                    },
                    count: None,
                },
            ],
            label: None,
        });
        let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &bind_group_layout,
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 0,
                    resource: app_state_buffer.as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 1,
                    resource: nodes.buffers[0].as_entire_binding(),
                },
                wgpu::BindGroupEntry {
                    binding: 7,
                    resource: compute_grid_reset.counter_buffer.as_entire_binding(),
                },
            ],
            label: None,
        });
        let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
            label: Some("compute"),
            bind_group_layouts: &[&bind_group_layout],
            push_constant_ranges: &[],
        });
        let pipeline = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
            label: Some("Compute pipeline"),
            layout: Some(&pipeline_layout),
            module: &shader,
            entry_point: "main",
        });
        ComputeGridUpdate {
            buffer,
            bind_group_layout_entry,
            binding,
            shader,
            pipeline,
            bind_group,
            bind_group_layout,
            work_group_count,
        }
    }

    pub fn setup_encoder(&self, encoder: &mut CommandEncoder) {
        let mut pass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
            label: None,
            timestamp_writes: None,
        });
        pass.set_pipeline(&self.pipeline);
        pass.set_bind_group(0, &self.bind_group, &[]);
        pass.dispatch_workgroups(self.work_group_count, 1, 1);
        // cpass.set_pipeline(&compute_pipeline);
        // cpass.set_bind_group(0, &compute_bind_groups[frame_num % 2], &[]);
        // cpass.dispatch_workgroups(work_group_count, 1, 1);
    }
}
