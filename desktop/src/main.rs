mod app_state;
mod compute_1;
mod compute_grid_reset;
mod compute_grid_update;
mod data;
mod main_loop;
mod misc;
mod particle_counter;
mod render;
use crate::app_state::AppState;
use crate::compute_1::get_compute_stuff;
use crate::compute_grid_reset::ComputeGridReset;
use crate::compute_grid_update::ComputeGridUpdate;
use crate::data::grid_list::GridList;
use crate::data::nodes::Nodes;
use crate::main_loop::run_event_loop;
use crate::misc::get_device_queue;
use crate::misc::get_gpu_adapter;
use crate::misc::get_required_downlevel_capabilities;
use crate::misc::get_swapchain_format;
use crate::particle_counter::ParticleCounter;
use crate::render::get_render_bind_group;
use crate::render::get_render_bind_group_layout;
use crate::render::get_render_pipeline;
use crate::render::get_render_pipeline_layout;
use crate::render::get_render_shader;
use nanorand::Rng;
use nanorand::WyRand;
use wgpu::util::DeviceExt;
use wgpu::Adapter;
use wgpu::Device;
use wgpu::Surface;
use wgpu::SurfaceConfiguration;
use winit::event_loop::EventLoop;
use winit::window::Window;

const NUM_PARTICLES: usize = 1024 * 16;
const PARTICLE_SIZE: usize = 4;
const PARTICLES_PER_GROUP: u32 = 64;
const WINDOW_WIDTH: usize = 512;
const WINDOW_HEIGHT: usize = 512;
const MAX_NODE_PER_GRID_CELL: usize = 1024;
const GRID_CELL_COUNT_SIDE: usize = 64;

fn configure(
    window: &Window,
    surface: &Surface,
    adapter: &Adapter,
    device: &Device,
) -> SurfaceConfiguration {
    let mut size = window.inner_size();
    size.width = size.width.max(1);
    size.height = size.height.max(1);
    let config = surface
        .get_default_config(&adapter, size.width, size.height)
        .unwrap();
    surface.configure(&device, &config);
    config
}

async fn run(event_loop: EventLoop<()>, window: Window) {
    println!("general setup");
    let backends = wgpu::util::backend_bits_from_env().unwrap_or_default();
    let dx12_shader_compiler = wgpu::util::dx12_shader_compiler_from_env().unwrap_or_default();
    let gles_minor_version = wgpu::util::gles_minor_version_from_env().unwrap_or_default();
    let instance = wgpu::Instance::new(wgpu::InstanceDescriptor {
        backends,
        flags: wgpu::InstanceFlags::from_build_config().with_env(),
        dx12_shader_compiler,
        gles_minor_version,
    });
    let surface = instance.create_surface(&window).unwrap();
    let adapter = get_gpu_adapter(&instance, &surface).await;
    let required_downlevel_capabilities = get_required_downlevel_capabilities();
    let downlevel_capabilities = adapter.get_downlevel_capabilities();
    assert!(
        downlevel_capabilities.shader_model >= required_downlevel_capabilities.shader_model,
        "Adapter does not support the minimum shader model required to run this example: {:?}",
        required_downlevel_capabilities.shader_model
    );
    assert!(
        downlevel_capabilities
            .flags
            .contains(required_downlevel_capabilities.flags),
        "Adapter does not support the downlevel capabilities required to run this example: {:?}",
        required_downlevel_capabilities.flags - downlevel_capabilities.flags
    );
    let (device, queue) = get_device_queue(&adapter).await;
    let mut config = configure(&window, &surface, &adapter, &device);
    let work_group_count = ((NUM_PARTICLES as f32) / (PARTICLES_PER_GROUP as f32)).ceil() as u32;
    println!("data & buffers");
    let app_state_buffer = AppState::get_buffer(&device);
    let particle_counter = ParticleCounter::new(&device);
    let mut screen_buffers = Vec::<wgpu::Buffer>::new();
    for i in 0..2 {
        let mut v_: Vec<f32> = Vec::new();
        for _ in 0..(WINDOW_WIDTH * WINDOW_HEIGHT * 16) {
            v_.push(0.0);
        }
        screen_buffers.push(
            device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
                label: Some("screen_buffer"),
                contents: bytemuck::cast_slice(&v_),
                usage: wgpu::BufferUsages::VERTEX
                    | wgpu::BufferUsages::STORAGE
                    | wgpu::BufferUsages::COPY_DST,
            }),
        );
    }
    let nodes = Nodes::new(&device);
    let grid_list = GridList::new(&device);
    // shaders
    let compute_grid_reset = ComputeGridReset::new(&device);
    let compute_grid_update = ComputeGridUpdate::new(
        &device,
        &nodes,
        &app_state_buffer,
        &compute_grid_reset,
        work_group_count,
        &grid_list,
    );
    println!("setup render pipeline");
    let shader = get_render_shader(&device);
    let render_bind_group_layout = get_render_bind_group_layout(&device);
    let render_bind_groups = get_render_bind_group(
        &device,
        &render_bind_group_layout,
        &app_state_buffer,
        &screen_buffers,
    );
    let render_pipeline_layout = get_render_pipeline_layout(&device, &render_bind_group_layout);
    let swapchain_format = get_swapchain_format(&surface, &adapter);
    let render_pipeline =
        get_render_pipeline(&device, &render_pipeline_layout, &shader, swapchain_format);
    println!("setup compute pipeline");
    let (compute_pipeline, compute_bind_groups) = get_compute_stuff(
        &device,
        &compute_grid_reset,
        &particle_counter,
        &screen_buffers,
        &nodes.buffers,
        &app_state_buffer,
        &grid_list,
    );
    run_event_loop(
        event_loop,
        &instance,
        &adapter,
        &shader,
        &queue,
        &device,
        &render_pipeline,
        &surface,
        &window,
        &mut config,
        &app_state_buffer,
        &render_bind_groups,
        &compute_pipeline,
        &compute_bind_groups,
        work_group_count,
        &particle_counter,
        &compute_grid_reset,
        &compute_grid_update,
    );
}

pub fn main() {
    env_logger::init();
    let event_loop = EventLoop::new().unwrap();
    let builder = winit::window::WindowBuilder::new();
    let window = builder.build(&event_loop).unwrap();
    pollster::block_on(run(event_loop, window));
}
