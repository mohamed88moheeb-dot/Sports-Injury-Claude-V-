'use client';

import { useState } from 'react';
import { Field } from '../ui/Field';
import { Slider } from '../ui/Slider';

export function CheckInContent({ addCheckin, checkins }) {
  const [status, setStatus] = useState({
    pain: 2,
    confidence: 60,
    swelling: 'No change',
    response: 'Stable',
    notes: '',
  });

  return (
    <section className="checkin-grid app-section app-section-soft">
      <div className="section-card glass-card">
        <p className="eyebrow">Daily check-in</p>
        <h2>How did the injury respond?</h2>
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
        />
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
        <textarea
          placeholder="Notes"
          value={status.notes}
          onChange={(e) => setStatus({ ...status, notes: e.target.value })}
        />
        <button className="primary-btn" onClick={() => addCheckin(status)}>
          Save check-in
        </button>
      </div>

      <div className="section-card glass-card">
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
