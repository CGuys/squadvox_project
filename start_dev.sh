#!/bin/bash

echo "==========================================="
echo "   SquadVox 本地全栈开发启动脚本 🚀"
echo "==========================================="

# 设置发生错误时退出，遇到未定义变量时报错
set -e

# 确保在脚本所在目录执行
cd "$(dirname "$0")"

# 杀死占用 3000 和 8080 (如果有H5) 端口的旧进程 (可选，按需放开)
# lsof -ti:3000 | xargs kill -9 2>/dev/null || true
# lsof -ti:8080 | xargs kill -9 2>/dev/null || true

echo "[1/3] 启动后端 Node.js API 服务 (squadvox-server)..."
cd squadvox-server
# 在后台启动服务端
npm start &
SERVER_PID=$!
cd ..

echo "[2/3] 启动前端小程序编译监听 (squadvox-miniprogram)..."
cd squadvox-miniprogram
# 在后台启动小程序编译
npm run dev:mp-weixin &
MP_PID=$!

echo "[3/3] 启动前端 H5 本地服务 (squadvox-miniprogram)..."
# 在后台启动H5编译（强制端口8080避免冲突）
npm run dev:h5 -- --port 8080 &
H5_PID=$!
cd ..

echo "==========================================="
echo "✅ 所有服务启动中！"
echo "👉 后端服务运行在: http://localhost:3000"
echo "👉 H5 网页端运行在: http://localhost:8080"
echo "👉 小程序编译产物: squadvox-miniprogram/dist/dev/mp-weixin"
echo "（请在微信开发者工具中导入该产物目录进行预览）"
echo ""
echo "按下 Ctrl+C 可同时停止所有服务"
echo "==========================================="

# 捕获 Ctrl+C (SIGINT) 信号，优雅地结束所有子进程
trap "echo '正在停止所有服务...'; kill $SERVER_PID $MP_PID $H5_PID; exit" SIGINT SIGTERM

# 等待所有后台进程，保持脚本运行不退出
wait
