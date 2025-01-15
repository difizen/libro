import sys
from .generate_libro_config import launch_generate_libro_config
from .app import LibroApp

import argparse
from ._version import __version__


def main():
    parser = argparse.ArgumentParser(description="libro cli")
    parser.add_argument('--version', action='store_true',
                        help='show the versions of core abc packages and exit')
    # 创建子命令解析器
    subparsers = parser.add_subparsers(dest='command')

    # 添加 'config' 子命令
    config_parser = subparsers.add_parser('config', help='libro config related commands')

    # 为 'config' 子命令添加子命令 'generate'
    config_parser.add_argument('action', choices=['generate'], help='Action to perform on config')

    args, unknown_args = parser.parse_known_args()
    if args.version:
        for package in [
            "libro",
            "libro_server",
            "libro_ai",
            # "libro_sql",
            "libro_flow",
            "jupyter_server",
        ]:
            try:
                if package == "libro_server":  # We're already here
                    version = __version__
                else:
                    mod = __import__(package)
                    version = mod.__version__
            except ImportError:
                version = "not installed"
            print(f"{package:<17}:", version)
        return

    # 处理子命令 'config'
    if args.command == 'config':
        if args.action == 'generate':
            launch_generate_libro_config()
        else:
            print("Unknown config command. Available: generate")
    else:
        LibroApp.launch_instance()
