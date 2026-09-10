import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flex,
  Heading,
  Text,
  Form,
  TextField,
  Button,
  Divider,
} from '@adobe/react-spectrum';
import { AuthService, AuthUserProfile } from '../auth/authService';

interface AuthPageProps {
  onAuthenticated: (user: AuthUserProfile) => void;
  onSkipAsGuest?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated, onSkipAsGuest }) => {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const authService = AuthService.getInstance();

    try {
      let user: AuthUserProfile;
      if (mode === 'signup') {
        user = await authService.signUp(email, password);
      } else {
        user = await authService.signIn(email, password);
      }
      onAuthenticated(user);
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser: AuthUserProfile = {
      uid: `guest_${Date.now()}`,
      email: 'guest@binaire.ai',
      displayName: 'Guest Evaluator',
    };
    onAuthenticated(guestUser);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          maxWidth: '440px',
          width: '100%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: '36px 32px',
        }}
      >
        {/* Brand Icon & Heading */}
        <Flex direction="column" alignItems="center" marginBottom="size-250">
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '18px',
              marginBottom: '16px',
            }}
          >
            B
          </div>
          <Heading level={2} margin={0} UNSAFE_style={{ fontSize: '1.4rem', fontWeight: 700, textAlign: 'center' }}>
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </Heading>
          <Text UNSAFE_style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>
            {mode === 'signup'
              ? 'Sign up to access the Freznel AI model selection utility'
              : 'Sign in to access your models & selections'}
          </Text>
        </Flex>

        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#991b1b',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              marginBottom: '16px',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Form necessityIndicator="label">
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              isRequired
              autoFocus
              width="100%"
              marginBottom="size-150"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              isRequired
              width="100%"
              marginBottom={mode === 'signup' ? 'size-150' : 'size-200'}
            />
          </Form>

          {mode === 'signup' && (
            <div style={{ marginTop: '4px', marginBottom: '16px' }}>
              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                isRequired
                width="100%"
              />
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <Button
              type="submit"
              variant="cta"
              isDisabled={loading}
              width="100%"
              UNSAFE_style={{ padding: '10px 0', fontSize: '0.9rem', fontWeight: 600 }}
            >
              {loading
                ? 'Authenticating with Firebase...'
                : mode === 'signup'
                ? 'Sign Up with Firebase'
                : 'Sign In'}
            </Button>
          </div>
        </form>

        <Divider size="S" marginY="size-200" />

        {/* Mode Switch & Guest / Demo Button */}
        <Flex direction="column" alignItems="center" gap="size-100">
          <Text UNSAFE_style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup');
                setErrorMsg(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {mode === 'signup' ? 'Sign In' : 'Sign Up'}
            </button>
          </Text>

          {/* Skip / Guest Access & Demo Fill */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => {
                setEmail('evaluator@binaire.ai');
                setPassword('password123');
                setConfirmPassword('password123');
              }}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              ⚡ Auto-fill Demo Credentials
            </button>

            <button
              type="button"
              onClick={onSkipAsGuest || handleGuestLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                textDecoration: 'underline',
              }}
            >
              Or explore as Guest Evaluator &rarr;
            </button>
          </div>
        </Flex>
      </motion.div>
    </div>
  );
};
