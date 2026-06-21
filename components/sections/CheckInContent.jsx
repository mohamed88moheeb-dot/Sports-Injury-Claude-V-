'use client';

import { useState } from 'react';
import { Field } from '../ui/Field';
import { Slider } from '../ui/Slider';

function classifyStatus(status) {
  const pain = Number(status.pain ?? 0);
  const conf = Number(status.confidence ?? 100);
  const { swelling, response } = status;
  if (pain >= 7 || swelling === 'New swelling' || swelling === 'Worse' || response === 'Worse than yesterday') {
    return { tier: 'red', label: 'Red — session paused', desc: 'Symptoms are too high to train today. We\'ll pause the session and monitor.', color: '#EF4444' };
  }
  if (pain >= 5 || response === 'Sore but settled') {
    return { tier: 'amber', label: 'Amber — session eased', desc: 'Some symptoms present. Today\'s session will be made easier; repeat before progressing.', color: '#F59E0B' };
  }
  if (conf < 40) {
    return { tier: 'amber', label: 'Amber — low confidence', desc: 'Low confidence flagged. Session will be simplified with a clarifying prompt.', color: '#F59E0B' };
  }
  return { tier: 'green', label: 'Green — carry on', desc: 'Response looks good. Today\'s session proceeds as planned.', color: '#22C55E' };
}

export function CheckInContent({ addCheckin, checkins }) {
  const [status, setStatus] = useState({
    pain: 2,
    confidence: 60,
    swelling: 'No change',
    response: 'Stable',
    notes: '',
  });

  const result = classifyStatus(status);

  return (
    <section className="checkin-grid app-section app-section-soft">
      <div className="section-card">
        <p className="eyebrow">Daily check-in</p>
        <h2>How did the injury respond?</h2>
        <div className="ac-sliders">
          <Slider
            label="Pain today"
            value={status.pain}
            onChange={(v) => setStatus({ ...status, pain: v })}
          />
          <Slider
            label="Confidence to move"
            value={status.confidence}
            max={100}
            onChange={(v) => setStatus({ ...status, confidence: v })}
            invertColor
          />
        </div>
        <Field label="Swelling / tightness">
          <select
            value={status.swelling}
            onChange={(e) => setStatus({ ...status, swelling: e.target.value })}
          >
            <option>No change</option>
            <option>Better</option>
            <option>Worse</option>
            <option>New swelling</option>
          </select>
        </Field>
        <Field label="Next-day response">
          <select
            value={status.response}
            onChange={(e) => setStatus({ ...status, response: e.target.value })}
          >
            <option>Stable</option>
            <option>Better than yesterday</option>
            <option>Sore but settled</option>
            <option>Worse than yesterday</option>
          </select>
        </Field>

        <div style={{
          margin: '16px 0',
          padding: '12px 16px',
          borderRadius: 10,
          background: result.color + '18',
          borderLeft: `4px solid ${result.color}`,
        }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: result.color }}>{result.label}</p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-2)' }}>{result.desc}</p>
        </div>

        <textarea
          placeholder="Notes"
          value={status.notes}
          onChange={(e) => setStatus({ ...status, notes: e.target.value })}
        />
        <button className="primary-btn" onClick={() => addCheckin(status)}>
          Save check-in
        </button>
      </div>

      <div className="section-card">
        <p className="eyebrow">History</p>
        <h2>Recent entries</h2>
        <div className="history-list">
          {checkins.length === 0 && <p>No check-ins yet.</p>}
          {checkins.map((c) => (
            <div className="history-item" key={c.id}>
              <strong>{c.date}</strong>
              <span>Pain {c.pain}/10 · Confidence {c.confidence}%</span>
              <p>{c.response} · {c.swelling}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
