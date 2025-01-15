#!/bin/bash

# PORT 默认值为 6780
LIBRO_PORT=6780
# 检查 PORT 环境变量是否设置
if [ -z "$PORT" ]; then
  echo "PORT 环境变量未设置"
else
  echo "PORT 环境变量设置为 $PORT"
  LIBRO_PORT=$PORT
fi

# 启动 libro，并将 PORT 环境变量传递给它
exec libro --port="$LIBRO_PORT" --notebook-dir="/home/admin/workspace"
