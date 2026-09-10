import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flex, Button, ActionButton } from '@adobe/react-spectrum';
import { Model } from '../../models/Model';

interface ModelCardProps {
  model: Model;
  onSelect: (model: Model) => void;
  onViewDetails: (model: Model) => void;
  isSaved?: boolean;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  onSelect,
  onViewDetails,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCli = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (model.cliDownloadCommand) {
      navigator.clipboard.writeText(model.cliDownloadCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div>
        {/* Header Tags: Family & Pipeline */}
        <Flex direction="row" justifyContent="space-between" alignItems="center" marginBottom="size-100">
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-muted)',
            }}
          >
            {model.family}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: '9999px',
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #dbeafe',
            }}
          >
            {model.hfTags.pipeline_tag || 'general'}
          </span>
        </Flex>

        {/* Model Title */}
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '4px',
            lineHeight: 1.3,
          }}
        >
          {model.displayName}
        </h3>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
            marginBottom: '12px',
            wordBreak: 'break-all',
          }}
        >
          {model.id}
        </p>

        {/* Technical Attributes Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '14px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ background: 'var(--bg-subtle)', padding: '6px 8px', borderRadius: '6px' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>
              Architecture
            </span>
            <strong>{model.architectureCategory}</strong>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '6px 8px', borderRadius: '6px' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>
              Safetensors
            </span>
            <strong>
              {model.rawSafetensorCountString === 'TBD' ? 'TBD' : `${model.safetensorFileCount} files`}
            </strong>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '6px 8px', borderRadius: '6px' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>
              Weights
            </span>
            <strong>{model.weightFormat.slice(0, 16)}</strong>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '6px 8px', borderRadius: '6px' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>
              Namespace
            </span>
            <strong>{model.authorNamespace}</strong>
          </div>
        </div>

        {/* CLI Snippet Quick Copy */}
        {model.cliDownloadCommand && (
          <div
            style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              cursor: 'pointer',
            }}
            onClick={handleCopyCli}
            title="Click to copy CLI download command"
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '6px' }}>
              {model.cliDownloadCommand}
            </span>
            <span style={{ color: copied ? '#059669' : '#64748b', fontWeight: 600, flexShrink: 0 }}>
              {copied ? 'Copied' : 'Copy'}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <Flex direction="row" gap="size-100" marginTop="size-100">
        <Button
          variant={isSaved ? 'cta' : 'secondary'}
          onPress={() => onSelect(model)}
          width="100%"
          UNSAFE_style={{ fontSize: '0.8rem' }}
        >
          {isSaved ? 'Saved' : 'Select Model'}
        </Button>
        <ActionButton onPress={() => onViewDetails(model)} UNSAFE_style={{ fontSize: '0.8rem' }}>
          Specs
        </ActionButton>
      </Flex>
    </motion.div>
  );
};
