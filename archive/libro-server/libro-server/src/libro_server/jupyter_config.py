c = get_config()  # noqa
c.MappingKernelManager.kernel_manager_class = (
    "libro_server.libro_kernel_manager.LibroKernelManager"
)
c.ServerApp.disable_check_xsrf = True
