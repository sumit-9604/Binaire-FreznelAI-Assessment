import React from 'react';
import {
  Flex,
  Heading,
  Text,
  StatusLight,
  ActionButton,
  Button,
} from '@adobe/react-spectrum';
import { AuthUserProfile } from '../../auth/authService';

interface NavbarProps {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  savedCount: number;
  onOpenSavedDrawer: () => void;
  currentUser: AuthUserProfile | null;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isOnline,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  savedCount,
  onOpenSavedDrawer,
  currentUser,
  onOpenAuthModal,
  onSignOut,
}) => {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <Flex direction="row" justifyContent="space-between" alignItems="center" wrap="wrap" gap="size-150">
        {/* Brand & App Title */}
        <Flex direction="row" alignItems="center" gap="size-150">
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '-0.5px',
            }}
          >
            B
          </div>
          <div>
            <Heading level={4} margin={0} UNSAFE_style={{ fontSize: '1rem', fontWeight: 600 }}>
              Binaire Freznel AI
            </Heading>
            <Text UNSAFE_style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Model Selection Utility
            </Text>
          </div>
        </Flex>

        {/* Status, Simulation Toggle & User Actions */}
        <Flex direction="row" alignItems="center" gap="size-150">
          {/* Real-time Network Indicator */}
          <StatusLight variant={isOnline ? 'positive' : 'notice'}>
            {isOnline ? 'Online' : isSimulatedOffline ? 'Offline (Simulated)' : 'Offline (Disconnected)'}
          </StatusLight>

          {/* Random Offline Mode Toggle (Assessment Requirement 8) */}
          <ActionButton
            isQuiet
            onPress={onToggleSimulatedOffline}
            UNSAFE_style={{ fontSize: '0.8rem' }}
          >
            {isSimulatedOffline ? 'Restore Online' : 'Simulate Offline'}
          </ActionButton>

          {/* Saved Selections Drawer Button */}
          <Button
            variant="secondary"
            onPress={onOpenSavedDrawer}
            UNSAFE_style={{ fontSize: '0.85rem' }}
          >
            Saved Models ({savedCount})
          </Button>

          {/* Auth Button */}
          {currentUser ? (
            <Flex direction="row" alignItems="center" gap="size-100">
              <Text UNSAFE_style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                {currentUser.displayName || currentUser.email}
              </Text>
              <ActionButton isQuiet onPress={onSignOut} UNSAFE_style={{ fontSize: '0.8rem' }}>
                Sign Out
              </ActionButton>
            </Flex>
          ) : (
            <Button variant="cta" onPress={onOpenAuthModal} UNSAFE_style={{ fontSize: '0.85rem' }}>
              Sign In
            </Button>
          )}
        </Flex>
      </Flex>
    </header>
  );
};
