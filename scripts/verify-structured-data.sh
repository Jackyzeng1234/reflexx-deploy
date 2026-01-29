#!/bin/bash

# 🔍 结构化数据验证脚本
# 用于验证所有页面的JSON-LD结构化数据

echo "🔍 结构化数据验证脚本"
echo "========================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
BASE_URL=${1:-"http://localhost:3000"}
PAGES=(
  "/:Home Page"
  "/tests/simple-reaction:Simple Reaction Test"
  "/tests/auditory-reaction:Auditory Reaction Test"
  "/tests/choice-reaction:Choice Reaction Test"
  "/tests/click-speed:Click Speed Test"
  "/tests/typing:Typing Test"
  "/tests/sequence-memory:Sequence Memory Test"
  "/tests/chimp-test:Chimp Test"
  "/tests/stroop-test:Stroop Test"
  "/tests/number-memory:Number Memory Test"
)

echo -e "${BLUE}测试服务器: $BASE_URL${NC}"
echo ""

# 测试每个页面
echo "📄 检查页面结构化数据..."
echo ""

TOTAL=0
PASSED=0
FAILED=0

for page_info in "${PAGES[@]}"; do
  IFS=':' read -r path name <<< "$page_info"
  url="$BASE_URL$path"
  TOTAL=$((TOTAL + 1))

  # 获取页面内容
  response=$(curl -s "$url" 2>&1)

  # 检查是否包含application/ld+json
  if echo "$response" | grep -q 'application/ld+json'; then
    # 提取JSON-LD内容
    json_ld=$(echo "$response" | grep -oP '(?<=<script type="application/ld\+json">).*?(?=</script>)' | sed 's/<script[^>]*>//g' | sed 's/<\/script>//g')

    if [ -n "$json_ld" ]; then
      # 验证JSON格式
      if echo "$json_ld" | jq empty 2>/dev/null; then
        echo -e "${GREEN}✅ $name${NC}"

        # 提取@type值
        types=$(echo "$json_ld" | jq -r '."@type"' 2>/dev/null)
        if [ -n "$types" ]; then
          echo "   Type: $types"
        fi

        # 检查必需字段
        has_name=$(echo "$json_ld" | jq -e '.name' 2>/dev/null && echo "✓" || echo "✗")
        has_description=$(echo "$json_ld" | jq -e '.description' 2>/dev/null && echo "✓" || echo "✗")
        has_url=$(echo "$json_ld" | jq -e '.url' 2>/dev/null && echo "✓" || echo "✗")

        echo "   Fields: name=$has_name, description=$has_description, url=$has_url"
        echo ""
        PASSED=$((PASSED + 1))
      else
        echo -e "${RED}❌ $name${NC} - Invalid JSON format"
        echo ""
        FAILED=$((FAILED + 1))
      fi
    else
      echo -e "${YELLOW}⚠️  $name${NC} - JSON-LD tag found but empty"
      echo ""
      FAILED=$((FAILED + 1))
    fi
  else
    echo -e "${RED}❌ $name${NC} - No structured data found"
    echo ""
    FAILED=$((FAILED + 1))
  fi
done

echo "========================"
echo ""
echo -e "${BLUE}📊 验证统计:${NC}"
echo "总计页面: $TOTAL"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo ""

# 测试特定页面示例
echo "========================"
echo ""
echo -e "${BLUE}🔍 详细示例：Simple Reaction Test${NC}"
echo ""

response=$(curl -s "$BASE_URL/tests/simple-reaction")
json_ld=$(echo "$response" | grep -oP '(?<=<script type="application/ld\+json">).*?(?=</script>)' | sed 's/<script[^>]*>//g' | sed 's/<\/script>//g' | head -1)

if [ -n "$json_ld" ]; then
  echo "找到的结构化数据："
  echo "$json_ld" | jq '.' 2>/dev/null || echo "$json_ld"
else
  echo "未找到结构化数据"
fi

echo ""
echo "========================"
echo ""

# 验证工具建议
echo -e "${BLUE}🛠️  在线验证工具：${NC}"
echo ""
echo "Google Rich Results Test:"
echo "https://search.google.com/test/rich-results"
echo ""
echo "Schema.org Validator:"
echo "https://validator.schema.org/"
echo ""
echo "使用方法：复制页面URL粘贴到上述工具中进行验证"
echo ""

# 检查jq是否安装
if ! command -v jq &> /dev/null; then
  echo -e "${YELLOW}⚠️  注意: jq未安装，无法详细验证JSON格式${NC}"
  echo "安装命令: brew install jq (macOS)"
  echo ""
fi

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ 所有页面的结构化数据验证通过！${NC}"
  exit 0
else
  echo -e "${RED}❌ 有 $FAILED 个页面验证失败${NC}"
  exit 1
fi
