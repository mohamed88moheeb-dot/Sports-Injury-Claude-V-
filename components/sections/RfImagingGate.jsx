'use client';

import { useState } from 'react';

const IMAGING_REASON_LABELS = {
  structural_defect:       'A palpable gap or dip in the muscle was reported — possible Grade 3 structural disruption.',
  functional_loss:         'You were unable to continue activity — a significant functional loss indicator.',
  non_ambulatory:          'Walking is severely painful or not possible — requires clinical assessment.',
  audible_pop:             'An audible pop or snap occurred at the time of injury — associated with structural disruption.',
  immediate_bruising:      'Significant bruising appeared within 2 hours of injury — indicates possible deep tissue damage.',
  red_flag_triggered:      'One or more red flags were reported that warrant immediate clinical assessment.',
  structural_tear_pattern: 'The combination of pop, bruising, and inability to continue is consistent with a structural tear.',
  neural_concern:          'Weakness without significant pain may indicate nerve involvement — requires clinical assessment.',
  high_severity_score:     'The overall injury severity score is high — imaging is recommended to confirm the extent.',
};

const WHAT_TO_DO = [
  'See a physiotherapist, sports medicine doctor, or GP as soon as possible.',
  'Request an MRI or diagnostic ultrasound of the anterior thigh / rectus femoris.',
  'Do not begin the exercise programme below until you have been cleared by a clinician.',
  'If you have severe pain, cannot weight-bear, or have visible deformity — go to A&E.',
];

export function RfImagingGate({ diagnosis }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!diagnosis?.imaging_gate) return null;

  const reasons = (diagnosis.imaging_reason || '')
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r && IMAGING_REASON_LABELS[r]);

  return (
    <div style={{
      background: 'var(--amber-dim)',
      border: '1.5px solid rgba(232,160,32,0.40)',
      borderRadius: 18,
      marginBottom: 20,
      overflow: 'hidden',
    }}>

      {/* ── Collapsed header (always visible — tap to expand) ── */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Icon */}
        <div style={{
          flexShrink: 0,
          width: 34, height: 34, borderRadius: 11,
          background: 'rgba(232,160,32,0.20)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        {/* Labels */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.10em', textTransform: 'uppercase', color: 'var(--amber)', margin: '0 0 2px' }}>
            Imaging recommended
          </p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: 0, lineHeight: 1.25 }}>
            Get assessed before starting this plan
          </p>
        </div>

        {/* Chevron */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* ── Expanded body ── */}
      <div style={{
        maxHeight: isOpen ? '600px' : '0px',
        overflow: 'hidden',
        transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ padding: '0 18px 18px' }}>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(232,160,32,0.22)', marginBottom: 16 }} />

          {/* Why */}
          {reasons.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
                Why imaging is recommended
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {reasons.map((r) => (
                  <div key={r} style={{
                    display: 'flex', gap: 8, alignItems: 'flex-start',
                    background: 'rgba(255,255,255,0.55)', borderRadius: 10, padding: '9px 12px',
                    border: '1px solid rgba(232,160,32,0.20)',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.45, margin: 0 }}>
                      {IMAGING_REASON_LABELS[r]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What to do */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
              What to do now
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {WHAT_TO_DO.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{
                    flexShrink: 0,
                    width: 20, height: 20, borderRadius: 999,
                    background: 'rgba(232,160,32,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: 'var(--amber)',
                  }}>{i + 1}</span>
                  <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div style={{
            paddingTop: 12,
            borderTop: '1px solid rgba(232,160,32,0.22)',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, lineHeight: 1.5 }}>
              Your rehab plan is shown below for reference only. Do not begin exercises until cleared.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
