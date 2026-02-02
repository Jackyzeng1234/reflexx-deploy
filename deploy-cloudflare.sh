#!/bin/bash

# Cloudflare Pages 部署脚本
# 使用方法：./deploy-cloudflare.sh

set -e

echo "🚀 开始部署 ReflexX 到 Cloudflare Pages..."

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装"
    echo "请运行: npm install -g wrangler"
    exit 1
fi

# 设置环境变量
export NEXT_PUBLIC_SUPABASE_URL="https://axertwlypazfplajfwjt.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZXJ0d2x5cGF6ZnBsYWpmd2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDcxMjMsImV4cCI6MjA4NDk4MzEyM30.dyPejdoPr7FknREDKrvsFYJLlD-uXoHyoWFqRPcUEMY"
export NEXT_PUBLIC_SITE_URL="https://reflexx.uk"
export RESEND_API_KEY="re_YsqAmfGk_6Z7aNxTaQnMe7xQVvQU1fT3P"
export CONTACT_EMAIL="jackyzeng1234@gmail.com"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 部署到 Cloudflare Pages
echo "☁️  部署到 Cloudflare Pages..."
wrangler pages deploy .next --project-name=reflexx-website

echo "✅ 部署完成！"
echo "🌐 访问: https://reflexx.uk"
