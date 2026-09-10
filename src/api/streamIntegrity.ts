/**
 * DataIntegrityStreamer & BackgroundDataFetcher
 *
 * Implements solutions to Assessment Section 9:
 * 1. Background fetch without async/await (Promise chaining & XHR pipelines)
 * 2. Large JSON integrity verification, chunked streaming, and SHA-256 validation
 */

export interface DownloadProgress {
  loadedBytes: number;
  totalBytes: number;
  percent: number;
  status: 'idle' | 'downloading' | 'verifying' | 'completed' | 'error';
  sha256Hash?: string;
  errorMessage?: string;
}

export class BackgroundDataFetcher {
  /**
   * Solution 9.1: Fetch in background WITHOUT using async/await.
   * Uses ES6 Promise chaining (.then / .catch) and event-driven pipelines.
   */
  public static fetchWithoutAsync<T>(
    url: string,
    onSuccess: (data: T) => void,
    onError: (error: Error) => void,
    onProgress?: (loaded: number, total: number) => void
  ): void {
    // 1. Using XMLHttpRequest with progress events for zero async/await
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'text';

    xhr.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded, event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const parsed = JSON.parse(xhr.responseText) as T;
          onSuccess(parsed);
        } catch (err) {
          onError(new Error(`JSON Parse Corruption Error: ${(err as Error).message}`));
        }
      } else {
        onError(new Error(`HTTP Request Failed with Status: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      onError(new Error('Network connection failure during background fetch.'));
    };

    xhr.send();
  }

  /**
   * Solution 9.1 (Alternative): Promise Chaining without async-await.
   */
  public static fetchPromiseChained<T>(
    url: string,
    onSuccess: (data: T) => void,
    onError: (error: Error) => void
  ): void {
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data: T) => {
        onSuccess(data);
      })
      .catch((err: Error) => {
        onError(err);
      });
  }

  /**
   * Solution 9.2: Large File Safety & Corruption Prevention.
   * - Chunked stream reader
   * - Content-Length boundary check
   * - SHA-256 cryptographic checksum calculation
   */
  public static fetchWithIntegrityVerification<T>(
    url: string,
    onProgressUpdate: (progress: DownloadProgress) => void,
    onComplete: (data: T, calculatedSha256: string) => void,
    onFailure: (err: Error) => void
  ): void {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to reach endpoint`);
        }

        const contentLengthHeader = response.headers.get('content-length');
        const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

        if (!response.body) {
          throw new Error('ReadableStream body not supported by response');
        }

        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let loadedBytes = 0;

        function readChunk(): void {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                // All chunks received; verify total size
                if (totalBytes > 0 && loadedBytes !== totalBytes) {
                  throw new Error(
                    `Size mismatch: expected ${totalBytes} bytes but received ${loadedBytes} bytes.`
                  );
                }

                onProgressUpdate({
                  loadedBytes,
                  totalBytes,
                  percent: 100,
                  status: 'verifying',
                });

                // Concatenate chunks for SHA-256 hashing and JSON parsing
                const fullBuffer = new Uint8Array(loadedBytes);
                let offset = 0;
                for (const chunk of chunks) {
                  fullBuffer.set(chunk, offset);
                  offset += chunk.length;
                }

                // Compute SHA-256 hash using Web Crypto API
                crypto.subtle
                  .digest('SHA-256', fullBuffer)
                  .then((hashBuffer) => {
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray
                      .map((b) => b.toString(16).padStart(2, '0'))
                      .join('');

                    // Parse JSON
                    const textDecoder = new TextDecoder('utf-8');
                    const jsonString = textDecoder.decode(fullBuffer);
                    const parsedData = JSON.parse(jsonString) as T;

                    onProgressUpdate({
                      loadedBytes,
                      totalBytes,
                      percent: 100,
                      status: 'completed',
                      sha256Hash: hashHex,
                    });

                    onComplete(parsedData, hashHex);
                  })
                  .catch((hashErr) => {
                    throw new Error(`Hash calculation error: ${(hashErr as Error).message}`);
                  });

                return;
              }

              if (value) {
                chunks.push(value);
                loadedBytes += value.length;

                const percent = totalBytes > 0 ? Math.round((loadedBytes / totalBytes) * 100) : 0;
                onProgressUpdate({
                  loadedBytes,
                  totalBytes,
                  percent,
                  status: 'downloading',
                });
              }

              // Read next chunk
              readChunk();
            })
            .catch((err) => {
              onProgressUpdate({
                loadedBytes,
                totalBytes,
                percent: 0,
                status: 'error',
                errorMessage: (err as Error).message,
              });
              onFailure(err as Error);
            });
        }

        readChunk();
      })
      .catch((netErr) => {
        onProgressUpdate({
          loadedBytes: 0,
          totalBytes: 0,
          percent: 0,
          status: 'error',
          errorMessage: (netErr as Error).message,
        });
        onFailure(netErr as Error);
      });
  }
}
