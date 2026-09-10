# Binaire – Freznel AI Model Selection Utility

A minimal, high-performance desktop model selection utility built with **React 18**, **TypeScript**, **Adobe React Spectrum**, **Framer Motion**, **Firebase Authentication**, and **IndexedDB**.

---

## 🌟 Key Features

1. **Search Query Parameters**:
   - Filter by **Model Name** or **Model Family** or search across both fields simultaneously.
   - Substring matching that detects matches from the **start** or **middle** of any word.
   - Built-in generic **Debouncing** (`250ms`) and **Throttling** (`200ms`) without external dependencies.

2. **Multi-Criteria Tag Filtering**:
   - **Pipeline Tags**: `text-generation`, `vision-language`, `coding`, `reasoning`, `math`, `sentence-similarity`, `text-classification`, `medical`, `translation`.
   - **Family Tags**: `Llama (Meta)`, `Qwen (Alibaba)`, `Gemma (Google)`, `DeepSeek`, `Mistral (Mistral AI)`.
   - **Architecture Tags**: `Dense`, `MoE`, `Dense + Vision`, `llama`, `qwen`, `mixtral`.
   - **Weight Tags**: `BF16`, `FP16`, `bf16-gated`.
   - **Safetensor Min-to-Max Range Slider**: Powered by Adobe Spectrum `RangeSlider` with dynamic min/max bounds.

3. **Sorting Capabilities**:
   - **Safetensor File Count**: High to Low & Low to High.
   - **Model Name Alphabetical**: A to Z & Z to A.

4. **Authentication (Firebase)**:
   - Dedicated Sign-Up & Sign-In screen with Firebase Authentication.
   - Seamless offline session fallback so the app works reliably in offline mode.
   - "Explore as Guest Evaluator" option for quick review.

5. **Screen Transitions & Micro-Animations**:
   - Framer Motion page transitions between Sign-Up and the Dashboard.
   - Animated model cards (`AnimatePresence`, layout transitions, and subtle hover effects).

6. **Offline Capability & Random Offline Testing**:
   - Full offline functionality powered by **IndexedDB (`idb`)**.
   - Real-time network status indicator in the navigation bar.
   - **"Simulate Offline"** switch to test the random online/offline switching requirement.

7. **User Selection / Bookmarks CRUD**:
   - **Create**: Bookmark any model with one click.
   - **Read**: View all saved models in the dedicated drawer.
   - **Update**: Edit deployment notes and assign priorities (`High`, `Medium`, `Low`).
   - **Delete**: Remove models from the saved selection.

---

## 💡 Solutions to Section 9 (Technical Questions)

### Question 9.1: How will you solve background fetch without using `async/await`?
Implemented in `src/api/streamIntegrity.ts` using two non-blocking paradigms:
1. **Event-Driven `XMLHttpRequest` (XHR)**:
   ```typescript
   const xhr = new XMLHttpRequest();
   xhr.open('GET', url, true);
   xhr.onprogress = (event) => onProgress(event.loaded, event.total);
   xhr.onload = () => onSuccess(JSON.parse(xhr.responseText));
   xhr.onerror = () => onError(new Error('Network error'));
   xhr.send();
   ```
   Operates entirely on asynchronous browser event listeners without using `async` or `await`.
2. **ES6 Promise Pipelines**:
   ```typescript
   fetch(url)
     .then((res) => res.json())
     .then((data) => onSuccess(data))
     .catch((err) => onError(err));
   ```

### Question 9.2: If the JSON file is large, how will you assure its safety and prevent corruption during download?
Implemented in `src/api/streamIntegrity.ts` & `src/offline/offlineStorage.ts`:
1. **Chunked Streaming (`ReadableStream`)**:
   Reads binary chunks (`Uint8Array`) using `response.body.getReader()`, preventing memory spikes.
2. **Length & Boundary Validation**:
   Tracks accumulated chunk sizes and verifies against the `Content-Length` header to detect dropped connections or incomplete streams.
3. **Cryptographic SHA-256 Verification**:
   Computes the SHA-256 hash using the Web Crypto API (`crypto.subtle.digest('SHA-256', buffer)`) to verify data integrity before JSON parsing.
4. **Two-Phase Atomic Staging Commit (IndexedDB)**:
   Writes downloaded data to a temporary staging store (`models_staging`). Only after schema and integrity verification succeeds is it committed to the live store (`models_cache`).

---

## 🏛️ OOP Architecture

The functional logic strictly adheres to Object-Oriented Programming (OOP) principles:

- **`Model`** (`src/models/Model.ts`): Domain entity encapsulating attributes and domain evaluation logic (`matchesSearch`, `matchesPipelineTag`, `matchesSafetensorRange`).
- **`SearchEngine`** (`src/search/SearchEngine.ts`): Implements substring matching, debounce, and throttle utilities.
- **`FilterManager`** (`src/filters/FilterManager.ts`): Manages multi-tag filters and extracts dynamic dataset bounds.
- **`SortManager`** (`src/sorting/SortManager.ts`): Strategy pattern sorter for safetensor counts and alphabetical orders.
- **`NetworkStatusManager`** (`src/offline/networkStatus.ts`): Observer pattern watching connectivity state with manual simulation support.
- **`OfflineStorageManager`** (`src/offline/offlineStorage.ts`): IndexedDB persistence manager handling caching and user selections CRUD.
- **`ModelService`** (`src/api/modelsApi.ts`): Facade pattern orchestrating data retrieval, offline fallback, and search/filter/sort pipelines.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>= 18.0.0`
- npm `>= 9.0.0`

### Installation
```bash
npm install
```

### Run Locally (Development)
```bash
npm start
# or
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Automated End-to-End Tests
```bash
npm test
```
Executes the full 36-assertion automated test suite covering all OOP classes, search, filter, sort, offline, integrity, and CRUD logic.

### Build for Production
```bash
npm run build
```
Generates an optimized production bundle in `dist/`.
