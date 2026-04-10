'use client';

import { useState } from 'react';

export default function SBTIEmbed() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8">
      {/* 头部区域 */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
          SBTI 人格测试
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-white">
          了解你的人格类型、优势和理想工作环境。
          这项综合评估只需 10-15 分钟即可完成。
        </p>
      </div>

      {/* 测试说明 */}
      <div className="mb-6 rounded-xl border-2 border-orange-200 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-900/20">
        <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
          📋 测试说明
        </h2>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="mr-2 text-orange-600">•</span>
            <span>诚实回答所有问题 - 没有正确或错误的答案</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-orange-600">•</span>
            <span>选择在大多数情况下最能描述你的选项</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-orange-600">•</span>
            <span>一次性完成测试以获得准确结果</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-orange-600">•</span>
            <span>你将在最后收到详细的人格分析</span>
          </li>
        </ul>
      </div>

      {/* 内嵌容器 */}
      <div className="relative w-full">
        {/* 加载遮罩 */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent mx-auto"></div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">测试加载中...</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">请稍候，我们正在为你准备评估</p>
            </div>
          </div>
        )}

        {/* 内嵌框架 */}
        <iframe
          src="https://sbti.unun.dev/"
          className="h-[800px] w-full rounded-2xl border-2 border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
          title="SBTI 人格测试"
          onLoad={() => setIsLoading(false)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>

      {/* 额外信息 */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
            🧠 什么是 SBTI？
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            SBTI（简化布瑞格斯类型指标）是基于荣格心理学的人格评估。
            它帮助你了解自己的人格类型、偏好以及你如何与周围的世界互动。
          </p>
        </div>

        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
          <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
            🎯 了解你的人格类型的优势
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            了解你的人格类型可以帮助职业选择、团队动态、
            沟通风格和个人发展。做出符合你自然偏好的决策。
          </p>
        </div>
      </div>

      {/* 返回测试按钮 */}
      <div className="mt-8 text-center">
        <a
          href="/tests"
          className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回所有测试
        </a>
      </div>
    </div>
  );
}
