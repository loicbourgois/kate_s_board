use crate::MAX_NODE_PER_GRID_CELL;
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
}

impl ComputeGridUpdate {
    pub fn new(device: &Device) -> ComputeGridUpdate {
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
            entries: &[bind_group_layout_entry],
            label: None,
        });

        let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &bind_group_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: binding,
                resource: buffer.as_entire_binding(),
            }],
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
        }
    }

    // pub fn setup_encoder(&self, encoder: &mut CommandEncoder) {
    //     let mut pass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
    //         label: None,
    //         timestamp_writes: None,
    //     });
    //     pass.set_pipeline(&self.compute_pipeline);
    //     pass.set_bind_group(0, &self.compute_bind_group, &[]);
    //     pass.dispatch_workgroups(64, 1, 1);
    // }
}
