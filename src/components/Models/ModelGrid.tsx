import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Flex, Text, Button } from '@adobe/react-spectrum';
import { Model } from '../../models/Model';
import { ModelCard } from './ModelCard';

interface ModelGridProps {
  models: Model[];
  viewMode: 'grid' | 'table';
  onSelectModel: (model: Model) => void;
  onViewModelDetails: (model: Model) => void;
  savedModelIds: Set<string>;
  onResetFilters: () => void;
}

export const ModelGrid: React.FC<ModelGridProps> = ({
  models,
  viewMode,
  onSelectModel,
  onViewModelDetails,
  savedModelIds,
  onResetFilters,
}) => {
  if (models.length === 0) {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
          No Matching Models Found
        </h3>
        <Text UNSAFE_style={{ color: 'var(--text-muted)', marginBottom: '16px', display: 'block' }}>
          Try broadening your search query, increasing the safetensor range, or clearing tag filters.
        </Text>
        <Button variant="secondary" onPress={onResetFilters}>
          Clear All Filters
        </Button>
      </div>
    );
  }

  if (viewMode === 'table') {
    return (
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Model</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Family</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Pipeline</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Architecture</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Safetensors</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Weights</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => {
              const isSaved = savedModelIds.has(model.id);
              return (
                <tr
                  key={model.id}
                  style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                  onClick={() => onViewModelDetails(model)}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{model.displayName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {model.id}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{model.family}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                      }}
                    >
                      {model.hfTags.pipeline_tag || 'general'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                    {model.architectureCategory}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    {model.rawSafetensorCountString === 'TBD' ? 'TBD' : model.safetensorFileCount}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                    {model.weightFormat.slice(0, 16)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <Flex direction="row" gap="size-50" justifyContent="end">
                      <Button
                        variant={isSaved ? 'cta' : 'secondary'}
                        onPress={() => onSelectModel(model)}
                        UNSAFE_style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      >
                        {isSaved ? 'Saved' : 'Select'}
                      </Button>
                    </Flex>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}
    >
      <AnimatePresence>
        {models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            onSelect={onSelectModel}
            onViewDetails={onViewModelDetails}
            isSaved={savedModelIds.has(model.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
