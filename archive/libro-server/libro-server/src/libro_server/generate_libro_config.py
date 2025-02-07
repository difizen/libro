import os


def generate_libro_config():
    # 定义生成的配置文件路径
    config_dir = os.path.expanduser("~/.libro")
    config_file = os.path.join(config_dir, "libro_config.yaml")

    # 如果目录不存在，创建目录
    if not os.path.exists(config_dir):
        os.makedirs(config_dir)

    if os.path.exists(config_file):
        print("Libro config file has already existed")
        return

    # 定义完全注释掉的 YAML 文件内容
    config_content = """
# llm:
#   DASHSCOPE_API_KEY: xxxxxxx
#   OPENAI_API_KEY: xxxxxxxx
#   default_model: qwen-max

# db:
#   - db_type: mysql
#     username: "root"
#     password: "12345678"
#     host: "127.0.0.1"
#     port: 3306
#     database: sql_demo

#   - db_type: postgresql
#     username: "libro"
#     password: "12345678"
#     host: "127.0.0.1"
#     port: 5432
#     database: libro

# ipython_extensions:
#   libro_ai: True
#   libro_sql: True
"""

    # 将内容写入 YAML 文件
    with open(config_file, 'w') as f:
        f.write(config_content)

    print(f"Config file generated at {config_file}")

# 用于注册 `libro config generate` 命令的入口函数


def launch_generate_libro_config():
    generate_libro_config()
