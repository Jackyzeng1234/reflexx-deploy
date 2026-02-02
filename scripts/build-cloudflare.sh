#!/bin/bash

# Cloudflare Pages 构建脚本

set -e

echo "🔨 开始构建 ReflexX for Cloudflare Pages..."

# 设置环境变量
export NEXT_PUBLIC_SUPABASE_URL="https://axertwlypazfplajfwjt.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZXJ0d2x5cGF6ZnBsYWpmd2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDcxMjMsImV4cCI6MjA4NDk4MzEyM30.dyPejdoPr7FknREDKrvsFYJLlD-uXoHyoWFqRPcUEMY"
export NEXT_PUBLIC_SITE_URL="https://reflexx.uk"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建 Next.js 应用
echo "🏗️  构建 Next.js 应用..."
npm run build

# 使用 @cloudflare/next-on-pages 适配器
echo "☁️  适配 Cloudflare Pages..."
npx @cloudflare/next-on-pages

echo "✅ 构建完成！"
echo "📁 输出目录: .vercel/output/static"
