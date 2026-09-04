import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string | React.ReactNode;
  icon?: string;
}

export function FAQItem({ question, answer, icon = '❓' }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-3 text-lg font-semibold text-gray-100">
          <span>{icon}</span>
          <span>{question}</span>
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 text-gray-300 leading-relaxed">
          {typeof answer === 'string' ? (
            <p dangerouslySetInnerHTML={{ __html: answer }} />
          ) : (
            answer
          )}
        </div>
      )}
    </div>
  );
}
