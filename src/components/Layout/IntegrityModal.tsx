import React, { useState } from 'react';
import {
  Dialog,
  Heading,
  Divider,
  Content,
  Button,
  ButtonGroup,
  Flex,
  Text,
  ProgressBar,
} from '@adobe/react-spectrum';
import { BackgroundDataFetcher, DownloadProgress } from '../../api/streamIntegrity';

interface IntegrityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrityModal: React.FC<IntegrityModalProps> = ({ isOpen, onClose }) => {
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerBackgroundStream = () => {
    setStatusMessage('Initiating chunked stream with SHA-256 checksum verification (Section 9)...');
    BackgroundDataFetcher.fetchWithIntegrityVerification(
      '/models.json',
      (prog) => {
        setProgress(prog);
      },
      (data: any, calculatedSha256) => {
        setStatusMessage(
          `Stream verified successfully! ${data.models?.length || 0} models loaded. SHA-256 Digest: ${calculatedSha256.slice(0, 24)}...`
        );
      },
      (err) => {
        setStatusMessage(`Integrity check failed: ${err.message}`);
      }
    );
  };

  const triggerNoAsyncFetch = () => {
    setStatusMessage('Executing background fetch using XMLHttpRequest with ZERO async/await (Section 9.1)...');
    BackgroundDataFetcher.fetchWithoutAsync(
      '/models.json',
      (data: any) => {
        setStatusMessage(
          `XHR event pipeline resolved ${data.models?.length || 0} models synchronously off the thread without async/await.`
        );
      },
      (err) => {
        setStatusMessage(`Fetch error: ${err.message}`);
      },
      (loaded, total) => {
        setProgress({
          loadedBytes: loaded,
          totalBytes: total,
          percent: total > 0 ? Math.round((loaded / total) * 100) : 100,
          status: 'downloading',
        });
      }
    );
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
          maxWidth: '620px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Dialog>
          <Heading level={3} margin={0} UNSAFE_style={{ fontSize: '1.2rem', fontWeight: 600 }}>
            Section 9: Background Fetch & Data Integrity
          </Heading>
          <Text UNSAFE_style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Assessment Technical Architecture Solutions
          </Text>

          <Divider size="M" marginY="size-150" />

          <Content>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              {/* Question 9.1 */}
              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                  9.1 How to solve background fetch without async-await?
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Implemented using event-driven <code>XMLHttpRequest</code> with <code>onprogress</code>/
                  <code>onload</code> listeners and ES6 <code>Promise.then().catch()</code> pipelines.
                </p>
                <Button variant="secondary" onPress={triggerNoAsyncFetch} UNSAFE_style={{ fontSize: '0.75rem' }}>
                  Run XHR Pipeline (No Async/Await)
                </Button>
              </div>

              {/* Question 9.2 */}
              <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '8px' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                  9.2 Large JSON Safety & Corruption Prevention
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Implemented chunked streaming via <code>ReadableStream</code> reader, byte length matching,
                  Web Crypto <strong>SHA-256 checksum verification</strong>, and atomic 2-phase commits in IndexedDB.
                </p>
                <Button variant="secondary" onPress={triggerBackgroundStream} UNSAFE_style={{ fontSize: '0.75rem' }}>
                  Run Streaming SHA-256 Validation
                </Button>
              </div>

              {/* Live Progress & Results */}
              {progress && (
                <div>
                  <ProgressBar
                    label="Download Progress"
                    value={progress.percent}
                    valueLabel={`${progress.percent}% (${Math.round(progress.loadedBytes / 1024)} KB)`}
                    width="100%"
                  />
                  {progress.sha256Hash && (
                    <div style={{ marginTop: '8px', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>SHA-256 Digest: </span>
                      <code style={{ fontSize: '0.72rem', wordBreak: 'break-all' }}>{progress.sha256Hash}</code>
                    </div>
                  )}
                </div>
              )}

              {statusMessage && (
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    color: '#1e40af',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                  }}
                >
                  {statusMessage}
                </div>
              )}
            </div>
          </Content>

          <ButtonGroup marginY="size-150">
            <Button variant="secondary" onPress={onClose}>
              Close
            </Button>
          </ButtonGroup>
        </Dialog>
      </div>
    </div>
  );
};
