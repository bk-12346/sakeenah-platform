import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  email: string;
  onBackToSignUp: () => void;
}

export default function EmailConfirmationScreen({ email, onBackToSignUp }: Props) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const handleResend = async () => {
    if (cooldown || resending) return;
    setResending(true);

    await supabase.auth.resend({ type: "signup", email });

    setResending(false);
    setResent(true);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 60000);
    setTimeout(() => setResent(false), 5000);
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

      <div className="max-w-sm w-full relative z-10 animate-fade-in text-center">
        {/* Mail icon */}
        <div style={{ marginBottom: '24px' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(193,124,116,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>

        <h2
          className="font-display"
          style={{ fontSize: '28px', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255, 248, 242, 0.9)', marginBottom: '16px' }}
        >
          Check your email
        </h2>

        <p
          className="font-body"
          style={{ fontSize: '14px', color: 'rgba(255, 248, 242, 0.40)', lineHeight: '1.8', marginBottom: '32px' }}
        >
          We sent a confirmation link to{" "}
          <span style={{ color: 'rgba(255, 248, 242, 0.65)' }}>{email}</span>.
          Please verify your email to continue.
        </p>

        <button
          onClick={handleResend}
          disabled={cooldown || resending}
          className="w-full font-body font-medium"
          style={{
            background: cooldown ? 'rgba(44, 24, 16, 0.3)' : '#2C1810',
            color: '#FDF6F0',
            borderRadius: '100px',
            padding: '14px',
            fontSize: '14px',
            border: 'none',
            cursor: cooldown ? 'default' : 'pointer',
          }}
        >
          {resending ? "Sending..." : cooldown ? "Email sent — check your inbox" : "Resend email"}
        </button>

        {resent && (
          <p className="font-body" style={{ fontSize: '12px', color: 'rgba(193, 124, 116, 0.8)', marginTop: '12px' }}>
            Confirmation email resent.
          </p>
        )}

        <p className="text-center" style={{ marginTop: '20px' }}>
          <button
            onClick={onBackToSignUp}
            className="font-body"
            style={{ fontSize: '13px', color: 'rgba(255, 248, 242, 0.35)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Use a different email
          </button>
        </p>
      </div>
    </div>
  );
}
