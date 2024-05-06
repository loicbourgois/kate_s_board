use crate::common::get_common;
use crate::GRID_CELL_COUNT_SIDE;
use std::borrow::Cow;
use std::mem;
use std::num::NonZeroU64;
use wgpu::util::DeviceExt;
use wgpu::BindGroup;
use wgpu::BindGroupLayout;
use wgpu::BindGroupLayoutEntry;
use wgpu::Buffer;
use wgpu::CommandEncoder;
use wgpu::ComputePipeline;
use wgpu::Device;
use wgpu::ShaderModule;

pub struct ComputeGridReset {
    pub counter_buffer: Buffer,
    pub shader_reset: ShaderModule,
    pub compute_pipeline: ComputePipeline,
    pub compute_bind_group: BindGroup,
    pub counter_binding: u32,
    pub compute_bind_group_layout: BindGroupLayout,
    pub compute_bind_group_layout_entry: BindGroupLayoutEntry,
    pub min_binding_size: Option<NonZeroU64>,
}

impl ComputeGridReset {
    pub fn new(device: &Device) -> ComputeGridReset {
        let mut data_1: Vec<i32> = Vec::new();
        for _ in 0..GRID_CELL_COUNT_SIDE * GRID_CELL_COUNT_SIDE {
            data_1.push(0);
        }
        let counter_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("ComputeGridReset.list_buffer"),
            contents: bytemuck::cast_slice(&data_1),
            usage: wgpu::BufferUsages::VERTEX
                | wgpu::BufferUsages::STORAGE
                | wgpu::BufferUsages::COPY_DST
                | wgpu::BufferUsages::COPY_SRC,
        });
        let shader_reset_source =
            include_str!("compute_grid_reset.wgsl").replace("{common}", &get_common());
        let shader_reset = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: None,
            source: wgpu::ShaderSource::Wgsl(Cow::Borrowed(&shader_reset_source)),
        });
        let min_binding_size = wgpu::BufferSize::new((data_1.len() * mem::size_of::<i32>()) as _);
        let counter_binding = 7;
        let compute_bind_group_layout_entry = wgpu::BindGroupLayoutEntry {
            binding: counter_binding,
            visibility: wgpu::ShaderStages::COMPUTE,
            ty: wgpu::BindingType::Buffer {
                ty: wgpu::BufferBindingType::Storage { read_only: false },
                has_dynamic_offset: false,
                min_binding_size: min_binding_size,
            },
            count: None,
        };
        let compute_bind_group_layout =
            device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
                entries: &[compute_bind_group_layout_entry],
                label: None,
            });
        let compute_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &compute_bind_group_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: counter_binding,
                resource: counter_buffer.as_entire_binding(),
            }],
            label: None,
        });

        let compute_pipeline_layout =
            device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: Some("compute"),
                bind_group_layouts: &[&compute_bind_group_layout],
                push_constant_ranges: &[],
            });
        let compute_pipeline = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
            label: Some("Compute pipeline"),
            layout: Some(&compute_pipeline_layout),
            module: &shader_reset,
            entry_point: "main",
        });
        ComputeGridReset {
            counter_buffer,
            shader_reset,
            compute_pipeline,
            compute_bind_group,
            counter_binding,
            compute_bind_group_layout,
            compute_bind_group_layout_entry,
            min_binding_size,
        }
    }

    pub fn setup_encoder(&self, encoder: &mut CommandEncoder) {
        let mut pass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
            label: None,
            timestamp_writes: None,
        });
        pass.set_pipeline(&self.compute_pipeline);
        pass.set_bind_group(0, &self.compute_bind_group, &[]);
        pass.dispatch_workgroups(
            (GRID_CELL_COUNT_SIDE * GRID_CELL_COUNT_SIDE / 64) as u32,
            1,
            1,
        );
    }
}
