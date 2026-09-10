import React from 'react';
import { Flex, Text, ActionButton } from '@adobe/react-spectrum';

interface OfflineBannerProps {
  isOnline: boolean;
  isSimulated: boolean;
  onRestore: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  isSimulated,
  onRestore,
}) => {
  if (isOnline) return null;

  return (
    <div
      style={{
        background: '#fffbeb',
        borderBottom: '1px solid #fef3c7',
        color: '#92400e',
        padding: '10px 24px',
        fontSize: '0.85rem',
      }}
    >
      <Flex direction="row" justifyContent="space-between" alignItems="center">
        <Flex direction="row" alignItems="center" gap="size-100">
          <span style={{ fontWeight: 600 }}>Offline Mode Active:</span>
          <Text>
            {isSimulated
              ? 'You are running in simulated offline mode.'
              : 'Internet connection is unavailable.'}{' '}
            The app is serving complete model data, search, filter, and sorting from local IndexedDB cache.
          </Text>
        </Flex>
        {isSimulated && (
          <ActionButton isQuiet onPress={onRestore} UNSAFE_style={{ color: '#92400e', fontWeight: 600 }}>
            Re-enable Online
          </ActionButton>
        )}
      </Flex>
    </div>
  );
};
