import { useState } from "react";
import { signUp } from "@/lib/auth";

interface Props {
  onSignUpSuccess: (email: string) => void;
  onSignIn: () => void;
}

export default function SignUpPrompt({ onSignUpSuccess, onSignIn }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || loading) return;
    setLoading(true);
    setErrors({});

    const { error } = await signUp(email.trim(), password);
    if (error) {
      setErrors({ general: error.message });
      setLoading(false);
      return;
    }

    setLoading(false);
    onSignUpSuccess(email.trim());
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
          style={{ fontSize: '28px', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255, 248, 242, 0.9)', marginBottom: '12px' }}
        >
          Save your reflections
        </h2>
        <p
          className="font-body text-center"
          style={{ fontSize: '14px', color: 'rgba(255, 248, 242, 0.40)', marginBottom: '32px', lineHeight: '1.8' }}
        >
          Create an account to keep your journal entries safe and access them anytime.
        </p>

        {errors.general && (
          <p className="font-body text-center" style={{ fontSize: '12px', color: '#C17C74', marginBottom: '16px' }}>
            {errors.general}
          </p>
        )}

        <div style={{ marginBottom: '16px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full font-body"
            style={{
              background: '#FFFFFF',
              border: `0.5px solid ${errors.email ? '#C17C74' : '#E8D5C8'}`,
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '14px',
              color: '#2C1810',
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#C17C74')}
            onBlur={(e) => { if (!errors.email) e.target.style.borderColor = '#E8D5C8'; }}
          />
          {errors.email && (
            <p className="font-body" style={{ fontSize: '12px', color: '#A85E56', marginTop: '6px' }}>{errors.email}</p>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 8 characters)"
            className="w-full font-body"
            style={{
              background: '#FFFFFF',
              border: `0.5px solid ${errors.password ? '#C17C74' : '#E8D5C8'}`,
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '14px',
              color: '#2C1810',
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#C17C74')}
            onBlur={(e) => { if (!errors.password) e.target.style.borderColor = '#E8D5C8'; }}
          />
          {errors.password && (
            <p className="font-body" style={{ fontSize: '12px', color: '#A85E56', marginTop: '6px' }}>{errors.password}</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full font-body font-medium"
          style={{
            background: loading ? 'rgba(44, 24, 16, 0.5)' : '#2C1810',
            color: '#FDF6F0',
            borderRadius: '100px',
            padding: '14px',
            fontSize: '14px',
            border: 'none',
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center" style={{ marginTop: '20px' }}>
          <button
            onClick={onSignIn}
            className="font-body"
            style={{ fontSize: '13px', color: 'rgba(255, 248, 242, 0.40)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Already have an account? <span style={{ color: 'rgba(255, 248, 242, 0.65)' }}>Sign in</span>
          </button>
        </p>
      </div>
    </div>
  );
}
