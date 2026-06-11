'use client';

export function AuthCard({ authMode, setAuthMode, authForm, setAuthForm, handleAuth, authMessage, authLoading }) {
  return (
    <div className="auth-card-wrap">
      <form onSubmit={handleAuth} className="auth-form glass-card auth-form-transparent">
        <div className="auth-form-header">
          <p className="eyebrow stacked-eyebrow">
            <span>Secure Progress</span>
          </p>
          <h3>{authMode === 'signin' ? 'Sign in to continue' : 'Create a tester account'}</h3>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={authForm.email}
          onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={authForm.password}
          onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
        />
        <button className="primary-btn" type="submit" disabled={authLoading}>
          {authLoading ? 'Working' : authMode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
        <button
          className="text-btn"
          type="button"
          onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
        >
          {authMode === 'signin' ? 'Create a new account' : 'I already have an account'}
        </button>
        {authMessage && <p className="form-note">{authMessage}</p>}
      </form>
    </div>
  );
}
