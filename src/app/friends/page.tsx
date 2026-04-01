'use client';

import Link from 'next/link';
import Head from 'next/head';

export default function FriendsPage() {

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>Friends & Partners - ReflexX Reaction Time Test</title>
        <meta name="description" content="Discover our recommended cognitive training and performance improvement tools." />
        <meta name="keywords" content="reaction time test, cognitive training, ai tools" />
        <link rel="canonical" href="https://reflexx.uk/friends" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Header */}
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 text-6xl">🤝</div>
            <h1 className="mb-4 text-5xl font-bold text-white">
              Friends & Partners
            </h1>
            <p className="mb-8 text-xl text-gray-300">
              Explore our recommended cognitive training and performance improvement tools
            </p>
          </div>
        </div>

        {/* CodeMarket Widget */}
        <div className="container mx-auto px-4 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 md:grid-cols-3">
              {/* CodeMarket Badge */}
              <div
                data-codemarket-widget="reflexx-free-reaction-memory-tests"
                data-theme-bg="#ffffff"
                data-theme-text="slate-600"
                data-layout="grid"
                data-show-branding="false"
                className="rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm p-6 flex items-center justify-center"
              >
                <a href="https://code.market?code.market=verified" title="ai tools code.market">
                  <img src="https://code.market/assets/manage-product/featured-logo-bright.svg" alt="ai tools code.market" />
                </a>
              </div>

              {/* ShowMeBestAI Badge */}
              <div className="rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm p-6 flex items-center justify-center">
                <a href="https://showmebest.ai" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://showmebest.ai/badge/feature-badge-white.webp"
                    alt="Featured on ShowMeBestAI"
                    width="220"
                    height="60"
                    className="hover:scale-105 transition-transform"
                  />
                </a>
              </div>

              {/* Twelve Tools Badge */}
              <div className="rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm p-6 flex items-center justify-center">
                <a href="https://twelve.tools" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://twelve.tools/badge0-white.svg"
                    alt="Featured on Twelve Tools"
                    width="200"
                    height="54"
                    className="hover:scale-105 transition-transform"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 pb-16">
          <div className="mx-auto max-w-4xl rounded-2xl border-2 border-blue-400/30 bg-white/5 p-8 text-center backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Want to Exchange Links?
            </h2>
            <p className="mb-6 text-gray-300">
              We're always looking to connect with quality websites in the cognitive training, gaming, and performance improvement space.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
            >
              Contact Us
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
