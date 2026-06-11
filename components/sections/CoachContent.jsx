'use client';

export function CoachContent({ chat, chatInput, setChatInput, sendChat }) {
  return (
    <section className="coach-card app-section app-section-dark">
      <p className="eyebrow">Recovery coach</p>
      <h2>Ask about pain, training, or returning to sport.</h2>
      <div className="chat-window">
        {chat.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'chat-bubble user' : 'chat-bubble coach'}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Example: I feel good. Can I sprint today?"
          onKeyDown={(e) => e.key === 'Enter' && sendChat()}
        />
        <button className="primary-btn" onClick={sendChat}>
          Send
        </button>
      </div>
    </section>
  );
}
