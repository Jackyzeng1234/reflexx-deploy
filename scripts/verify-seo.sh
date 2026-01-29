#!/bin/bash

# 🔍 SEO文件验证脚本
# 用于快速验证sitemap和robots文件是否正常工作

echo "🔍 SEO文件验证脚本"
echo "===================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
BASE_URL=${1:-"http://localhost:3000"}

echo "📡 测试服务器: $BASE_URL"
echo ""

# 测试sitemap
echo "🗺️  测试 Sitemap.xml..."
SITEMAP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/sitemap.xml")

if [ "$SITEMAP_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Sitemap.xml 可访问 (HTTP $SITEMAP_RESPONSE)${NC}"

    # 检查内容
    SITEMAP_CONTENT=$(curl -s "$BASE_URL/sitemap.xml")
    URL_COUNT=$(echo "$SITEMAP_CONTENT" | grep -c "<url>")

    echo -e "${GREEN}✅ 包含 $URL_COUNT 个页面${NC}"

    # 显示前几个URL
    echo ""
    echo "📋 已包含的页面："
    echo "$SITEMAP_CONTENT" | grep "<loc>" | sed 's/<loc>//' | sed 's/<\/loc>//' | head -5
    echo "   ..."

else
    echo -e "${RED}❌ Sitemap.xml 无法访问 (HTTP $SITEMAP_RESPONSE)${NC}"
    echo "请检查开发服务器是否运行：npm run dev"
fi

echo ""
echo "===================="
echo ""

# 测试robots.txt
echo "🤖 测试 Robots.txt..."
ROBOTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/robots.txt")

if [ "$ROBOTS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Robots.txt 可访问 (HTTP $ROBOTS_RESPONSE)${NC}"

    # 显示内容
    echo ""
    echo "📋 Robots.txt 内容："
    curl -s "$BASE_URL/robots.txt"

    # 验证sitemap引用
    if curl -s "$BASE_URL/robots.txt" | grep -q "Sitemap:"; then
        echo ""
        echo -e "${GREEN}✅ Robots.txt 正确引用了 Sitemap${NC}"
    else
        echo ""
        echo -e "${YELLOW}⚠️  警告: Robots.txt 未引用 Sitemap${NC}"
    fi

else
    echo -e "${RED}❌ Robots.txt 无法访问 (HTTP $ROBOTS_RESPONSE)${NC}"
fi

echo ""
echo "===================="
echo ""

# 在浏览器中打开
echo "🌐 在浏览器中打开验证："
echo ""
echo "Sitemap: $BASE_URL/sitemap.xml"
echo "Robots:  $BASE_URL/robots.txt"
echo ""

# 如果是macOS，询问是否打开浏览器
if [[ "$OSTYPE" == "darwin"* ]]; then
    read -p "是否在浏览器中打开？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$BASE_URL/sitemap.xml"
        sleep 1
        open "$BASE_URL/robots.txt"
    fi
fi

echo ""
echo -e "${GREEN}✅ 验证完成！${NC}"
echo ""
echo "下一步："
echo "1. 部署到生产环境后，更新 .env.local 中的域名"
echo "2. 在 Google Search Console 提交 sitemap"
echo "3. 定期检查索引状态"
