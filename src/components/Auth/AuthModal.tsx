import React, { useState } from 'react';
import {
  Dialog,
  Heading,
  Divider,
  Content,
  Form,
  TextField,
  Button,
  ButtonGroup,
  Flex,
  Text,
} from '@adobe/react-spectrum';
import { AuthService, AuthUserProfile } from '../../auth/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

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
      onSuccess(user);
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Dialog>
          <Heading level={3} margin={0} UNSAFE_style={{ fontSize: '1.2rem', fontWeight: 600 }}>
            {mode === 'signup' ? 'Create Your Account' : 'Sign In to Binaire'}
          </Heading>
          <Text UNSAFE_style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Authenticated via Firebase Authentication
          </Text>

          <Divider size="M" marginY="size-150" />

          <Content>
            {errorMsg && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  color: '#991b1b',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  marginBottom: '14px',
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Form necessityIndicator="label">
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  isRequired
                  autoFocus
                  width="100%"
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  isRequired
                  width="100%"
                />
              </Form>

              {mode === 'signup' && (
                <div style={{ marginTop: '8px' }}>
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
                >
                    {loading
                      ? 'Processing...'
                      : mode === 'signup'
                      ? 'Create Account'
                      : 'Sign In'}
                  </Button>
                </div>
            </form>

            <Flex direction="row" justifyContent="center" marginTop="size-150">
              <Text UNSAFE_style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
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
                    fontSize: '0.8rem',
                  }}
                >
                  {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                </button>
              </Text>
            </Flex>
          </Content>

          <ButtonGroup marginY="size-100">
            <Button variant="secondary" onPress={onClose} isDisabled={loading}>
              Cancel
            </Button>
          </ButtonGroup>
        </Dialog>
      </div>
    </div>
  );
};
