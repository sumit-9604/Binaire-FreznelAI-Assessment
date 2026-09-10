import React from 'react';
import { Flex, Picker, Item, Text, ActionButton } from '@adobe/react-spectrum';
import { SortOption } from '../../types/model';

interface SortControlsProps {
  totalCount: number;
  filteredCount: number;
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export const SortControls: React.FC<SortControlsProps> = ({
  totalCount,
  filteredCount,
  activeSort,
  onSortChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div
      style={{
        padding: '12px 16px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '16px',
      }}
    >
      <Flex direction="row" justifyContent="space-between" alignItems="center" wrap="wrap" gap="size-100">
        <Text UNSAFE_style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredCount}</strong> of{' '}
          {totalCount} models
        </Text>

        <Flex direction="row" alignItems="center" gap="size-150">
          <Picker
            label="Sort By"
            selectedKey={activeSort}
            onSelectionChange={(key) => onSortChange(key as SortOption)}
            width="size-2400"
          >
            <Item key="safetensor_desc">Safetensors (High to Low)</Item>
            <Item key="safetensor_asc">Safetensors (Low to High)</Item>
            <Item key="name_asc">Model Name (A to Z)</Item>
            <Item key="name_desc">Model Name (Z to A)</Item>
          </Picker>

          <Flex direction="row" gap="size-50">
            <ActionButton
              isQuiet={viewMode !== 'grid'}
              onPress={() => onViewModeChange('grid')}
              UNSAFE_style={{ fontSize: '0.8rem' }}
            >
              Grid
            </ActionButton>
            <ActionButton
              isQuiet={viewMode !== 'table'}
              onPress={() => onViewModeChange('table')}
              UNSAFE_style={{ fontSize: '0.8rem' }}
            >
              Table
            </ActionButton>
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
};
