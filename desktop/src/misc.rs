pub fn get_required_downlevel_capabilities() -> wgpu::DownlevelCapabilities {
    wgpu::DownlevelCapabilities {
        flags: wgpu::DownlevelFlags::empty(),
        shader_model: wgpu::ShaderModel::Sm5,
        ..wgpu::DownlevelCapabilities::default()
    }
}
