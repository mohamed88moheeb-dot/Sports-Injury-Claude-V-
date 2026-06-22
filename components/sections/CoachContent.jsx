'use client';

import { useEffect, useRef } from 'react';

const QUICK_PROMPTS = [
  'Can I sprint today?',
  'Why is my pain up?',
  'Adjust my plan',
  'When can I return?',
];

export function CoachContent({ chat, chatInput, setChatInput, sendChat }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  return (
    <section className="coach-shell">
      {/* Header */}
      <div className="coach-header">
        <p className="eyebrow">Recovery coach</p>
        <h2 className="coach-title">Ask anything.</h2>
      </div>

      {/* Chat bubbles */}
      <div className="coach-chat-window">
        {chat.length === 0 && (
          <div className="coach-empty">
            <p>Tell me what you are thinking about today's training or your return to sport. I will keep the plan safe and realistic.</p>
          </div>
        )}
        {chat.map((m, i) => (
          <div key={i} className={`coach-bubble ${m.role === 'user' ? 'coach-bubble--user' : 'coach-bubble--ai'}`}>
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="coach-quick-row">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            className="coach-quick-chip"
            onClick={() => { setChatInput(p); }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="coach-input-bar">
        <input
          className="coach-input-field"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Message your recovery coach..."
          onKeyDown={(e) => e.key === 'Enter' && sendChat()}
        />
        <button className="coach-send-btn" onClick={sendChat} aria-label="Send">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
