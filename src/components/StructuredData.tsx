/**
 * StructuredData Component
 *
 * 添加结构化数据（JSON-LD格式）到页面
 * 这对SEO完全不可见，只给搜索引擎读取
 *
 * 使用方式：
 * <StructuredData data={yourStructuredDataObject} />
 */

interface StructuredDataProps {
  data: Record<string, any>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

/**
 * 辅助函数：创建测试应用的结构化数据
 */
export function createTestAppStructuredData(props: {
  name: string;
  description: string;
  url: string;
  category?: string;
  rating?: number;
  ratingCount?: number;
}) {
  const { name, description, url, category = 'GameApplication', rating, ratingCount } = props;

  const baseData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": name,
    "description": description,
    "url": url,
    "applicationCategory": category,
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "inLanguage": ["en", "zh", "es"],
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
  };

  // 如果有评分，添加聚合评分
  if (rating && ratingCount) {
    return {
      ...baseData,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating.toString(),
        "ratingCount": ratingCount.toString(),
        "bestRating": "5",
        "worstRating": "1"
      }
    };
  }

  return baseData;
}

/**
 * 辅助函数：创建FAQ页面的结构化数据
 */
export function createFAQStructuredData(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * 辅助函数：创建面包屑结构化数据
 */
export function createBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}
