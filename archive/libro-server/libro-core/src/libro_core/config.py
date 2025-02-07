import logging
import os
import yaml

logger = logging.getLogger('jupyter_server')

default_config = {
}

def load_config_from_file(file_path):
    with open(file_path, 'r') as file:
        config = yaml.safe_load(file)  # 解析 YAML 文件
    return config if config else {}

def load_config_from_env(default_config, prefix='LIBRO_SERVER'):
    env_config = {}
    for key, value in default_config.items():
        if isinstance(value, dict):
            env_config[key] = load_config_from_env(
                value, f"{prefix}_{key.upper()}")
        else:
            env_var = f"{prefix}_{key.upper()}"
            env_value = os.getenv(env_var)
            if env_value is not None:
                if isinstance(value, bool):
                    env_value = env_value.lower() in ['true', '1', 'yes']
                elif isinstance(value, int):
                    env_value = int(env_value)
                env_config[key] = env_value
    return env_config


def merge_dicts(default, override):
    for key, value in override.items():
        if isinstance(value, dict) and key in default:
            default[key] = merge_dicts(default[key], value)
        else:
            default[key] = value
    return default


def load_config(config=default_config, project_root_path=None):
    config = merge_dicts(default_config, config)

    # 用户目录配置文件路径
    user_config_path = os.path.expanduser('~/.libro/libro_config.yaml')

    # 加载用户目录配置文件
    if os.path.exists(user_config_path):
        user_config = load_config_from_file(user_config_path)
        logger.info(f"Load user config from {user_config_path}.")
        config = merge_dicts(config, user_config)

    # # 工作目录配置文件路径
    # if project_root_path is None:
    #     project_root_path = os.getcwd()

    # # 加载项目根目录配置文件
    # project_config_path = os.path.join(
    #     project_root_path, 'config/libro_config.yaml')
    # if os.path.exists(project_config_path):
    #     project_config = load_config_from_file(project_config_path)
    #     logger.info(f"Load project config from {project_config_path}.")
    #     config = merge_dicts(config, project_config)

    # project_root_config_path = os.path.join(
    #     project_root_path, '.libro_config.yaml')
    # if os.path.exists(project_root_config_path):
    #     project_config = load_config_from_file(project_root_config_path)
    #     logger.info(f"Load project config from {project_config_path}.")
    #     config = merge_dicts(config, project_config)

    # # 加载环境变量配置
    # env_config = load_config_from_env(default_config)
    # if len(env_config.keys()):
    #     logger.info("Load env config.")
    # config = merge_dicts(config, env_config)

    return config

config_count = 0

class LibroConfig():
    config: dict
    is_loaded_config: bool = False

    def __init__(self):
        global config_count
        config_count += 1

    def load_config(self, project_root_path=None, **kwargs):
        config = load_config(kwargs, project_root_path)
        self.config = config
        self.is_loaded_config = True
    
    def get_config(self, project_root_path=None, **kwargs):
        if self.is_loaded_config:
            return self.config
        else:
            self.load_config(project_root_path, **kwargs)
            return self.config
        
    def set_config(self, new_config):
        self.config = merge_dicts(self.config,new_config)

    def save_config(self):
        import yaml
        config_dir = os.path.expanduser("~/.libro")
        config_file = os.path.join(config_dir, "libro_config.yaml")
        with open(config_file, 'w') as file:
            yaml.dump(self.config, file, default_flow_style=False, allow_unicode=True)

libro_config = LibroConfig()
