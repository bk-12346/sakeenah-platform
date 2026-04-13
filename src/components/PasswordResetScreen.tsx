import { useState } from "react";
import { resetPassword } from "@/lib/auth";

interface Props {
  onBackToSignIn: () => void;
}

export default function PasswordResetScreen({ onBackToSignIn }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || loading) return;
    setLoading(true);
    setError("");

    const { error: resetError } = await resetPassword(email.trim());
    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ background: '#1A0F0A' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 20%, rgba(193,124,116,0.10) 0%, transparent 70%)' }}
      />

      <div className="max-w-sm w-full relative z-10 animate-fade-in">
        <h2
          className="font-display text-center"
          style={{ fontSize: '28px', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255, 248, 242, 0.9)', marginBottom: '16px' }}
        >
          Reset password
        </h2>

        {sent ? (
          <div className="text-center">
            <p
              className="font-body"
              style={{ fontSize: '14px', color: 'rgba(255, 248, 242, 0.40)', lineHeight: '1.8', marginBottom: '32px' }}
            >
              If an account exists with{" "}
              <span style={{ color: 'rgba(255, 248, 242, 0.65)' }}>{email}</span>,
              you'll receive a password reset link shortly.
            </p>
            <button
              onClick={onBackToSignIn}
              className="w-full font-body font-medium"
              style={{
                background: '#2C1810',
                color: '#FDF6F0',
                borderRadius: '100px',
                padding: '14px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <p
              className="font-body text-center"
              style={{ fontSize: '14px', color: 'rgba(255, 248, 242, 0.40)', lineHeight: '1.8', marginBottom: '32px' }}
            >
              Enter your email and we'll send you a link to reset your password.
            </p>

            {error && (
              <p className="font-body text-center" style={{ fontSize: '12px', color: '#C17C74', marginBottom: '16px' }}>
                {error}
              </p>
            )}

            <div style={{ marginBottom: '24px' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full font-body"
                style={{
                  background: '#FFFFFF',
                  border: '0.5px solid #E8D5C8',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  fontSize: '14px',
                  color: '#2C1810',
                  outline: 'none',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#C17C74')}
                onBlur={(e) => (e.target.style.borderColor = '#E8D5C8')}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!email.trim() || loading}
              className="w-full font-body font-medium"
              style={{
                background: !email.trim() || loading ? 'rgba(44, 24, 16, 0.3)' : '#2C1810',
                color: '#FDF6F0',
                borderRadius: '100px',
                padding: '14px',
                fontSize: '14px',
                border: 'none',
                cursor: !email.trim() || loading ? 'default' : 'pointer',
              }}
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </>
        )}

        <p className="text-center" style={{ marginTop: '20px' }}>
          <button
            onClick={onBackToSignIn}
            className="font-body"
            style={{ fontSize: '13px', color: 'rgba(255, 248, 242, 0.35)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  );
}
