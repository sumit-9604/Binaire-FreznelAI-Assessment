import React from 'react';
import {
  Dialog,
  Heading,
  Divider,
  Content,
  ButtonGroup,
  Button,
  Flex,
  Text,
} from '@adobe/react-spectrum';
import { Model } from '../../models/Model';

interface ModelDetailModalProps {
  model: Model | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (model: Model) => void;
  isSaved: boolean;
}

export const ModelDetailModal: React.FC<ModelDetailModalProps> = ({
  model,
  isOpen,
  onClose,
  onSelect,
  isSaved,
}) => {
  if (!isOpen || !model) return null;

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
        zIndex: 100,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Dialog>
          <Heading level={3} margin={0} UNSAFE_style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {model.displayName}
          </Heading>
          <Text UNSAFE_style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            {model.id}
          </Text>

          <Divider size="M" marginY="size-150" />

          <Content>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
              {/* Core Information Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Family</span>
                  <strong>{model.family}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Pipeline Task</span>
                  <strong>{model.hfTags.pipeline_tag || 'general'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Safetensor Files</span>
                  <strong>{model.rawSafetensorCountString === 'TBD' ? 'TBD' : model.safetensorFileCount}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Architecture Category</span>
                  <strong>{model.architectureCategory}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>PyTorch Class</span>
                  <code style={{ fontSize: '0.75rem' }}>{model.pytorchArchitecture || 'N/A'}</code>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Weights & Quantization</span>
                  <strong>{model.weightFormat}</strong>
                </div>
              </div>

              {/* Supported Inference Engines */}
              {model.hfTags.inference_serving && model.hfTags.inference_serving.length > 0 && (
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '6px' }}>
                    Inference Serving Backends
                  </span>
                  <Flex direction="row" gap="size-100" wrap="wrap">
                    {model.hfTags.inference_serving.map((engine) => (
                      <span
                        key={engine}
                        style={{
                          background: '#f1f5f9',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                        }}
                      >
                        {engine}
                      </span>
                    ))}
                  </Flex>
                </div>
              )}

              {/* Download CLI Command */}
              {model.cliDownloadCommand && (
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>
                    CLI Download Command
                  </span>
                  <div
                    style={{
                      background: '#0f172a',
                      color: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      overflowX: 'auto',
                    }}
                  >
                    {model.cliDownloadCommand}
                  </div>
                </div>
              )}

              {/* HuggingFace Link */}
              {model.repoUrl && (
                <div>
                  <a
                    href={model.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#2563eb', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}
                  >
                    View on Hugging Face &rarr;
                  </a>
                </div>
              )}

              {/* All Tags */}
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginBottom: '6px' }}>
                  Tags & Attributes
                </span>
                <Flex direction="row" gap="size-50" wrap="wrap">
                  {model.allTags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </Flex>
              </div>
            </div>
          </Content>

          <ButtonGroup marginY="size-200">
            <Button variant="secondary" onPress={onClose}>
              Close
            </Button>
            <Button
              variant={isSaved ? 'cta' : 'primary'}
              onPress={() => {
                onSelect(model);
                onClose();
              }}
            >
              {isSaved ? 'Selected in Bookmarks' : 'Select This Model'}
            </Button>
          </ButtonGroup>
        </Dialog>
      </div>
    </div>
  );
};
