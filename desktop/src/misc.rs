use wgpu::Adapter;
use wgpu::Device;
use wgpu::Instance;
use wgpu::Queue;
use wgpu::Surface;
use wgpu::TextureFormat;

pub fn get_required_downlevel_capabilities() -> wgpu::DownlevelCapabilities {
    wgpu::DownlevelCapabilities {
        flags: wgpu::DownlevelFlags::empty(),
        shader_model: wgpu::ShaderModel::Sm5,
        ..wgpu::DownlevelCapabilities::default()
    }
}

pub async fn get_gpu_adapter(instance: &Instance, surface: &Surface<'_>) -> Adapter {
    log::info!("Available adapters:");
    for a in instance.enumerate_adapters(wgpu::Backends::all()) {
        log::info!("    {:?}", a.get_info())
    }
    let adapter = instance
        .request_adapter(&wgpu::RequestAdapterOptions {
            power_preference: wgpu::PowerPreference::default(),
            force_fallback_adapter: false,
            compatible_surface: Some(surface),
        })
        .await
        .expect("Failed to find an appropriate adapter");
    log::info!("Selected adapter: {:?}", adapter.get_info());
    adapter
}

pub async fn get_device_queue(adapter: &Adapter) -> (Device, Queue) {
    let mut limits = wgpu::Limits::default().using_resolution(adapter.limits());
    limits.max_storage_buffer_binding_size = 128 << 21;
    adapter
        .request_device(
            &wgpu::DeviceDescriptor {
                label: None,
                required_features: wgpu::Features::empty(),
                required_limits: limits,
            },
            None,
        )
        .await
        .expect("Failed to create device")
}

pub fn get_swapchain_format(surface: &Surface, adapter: &Adapter) -> TextureFormat {
    let swapchain_capabilities = surface.get_capabilities(adapter);
    swapchain_capabilities.formats[0]
}
