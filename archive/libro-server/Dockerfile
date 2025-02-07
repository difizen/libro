# 使用 python 3.11 nodejs 20作为基础镜像
FROM nikolaik/python-nodejs:python3.11-nodejs20-slim

# 创建 ADMIN 用户并设置其为非特权用户
RUN useradd -m admin

# 安装 libro 包
RUN pip install libro
RUN pip install libro-flow
RUN npm install @difizen/libro-analyzer -g

# 创建 Jupyter 配置目录和工作区目录
RUN mkdir -p /home/admin/.jupyter /home/admin/workspace

# 复制 Jupyter 配置文件
COPY docker/jupyter_server_config.py /home/admin/.jupyter/jupyter_server_config.py

# 复制启动脚本到镜像中
COPY docker/start.sh /home/admin/start.sh

# 赋予启动脚本执行权限
RUN chmod +x /home/admin/start.sh

# 更改文件和目录的所有权为 admin 用户
RUN chown -R admin:admin /home/admin

# 切换到 admin 用户
USER admin

# 设置工作目录为 admin 用户的主目录
WORKDIR /home/admin

# 设置容器的默认端口
EXPOSE 6780

# 使用 ENTRYPOINT 来设置启动脚本
ENTRYPOINT ["/home/admin/start.sh"]
