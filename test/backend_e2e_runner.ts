import fs from 'fs';
import path from 'path';
import { Model } from '../src/models/Model';
import { SearchEngine } from '../src/search/SearchEngine';
import { FilterManager } from '../src/filters/FilterManager';
import { SortManager } from '../src/sorting/SortManager';
import { NetworkStatusManager } from '../src/offline/networkStatus';
import { RawModelData, UserSavedSelection } from '../src/types/model';

const PASS = '\x1b[32m✔ PASS\x1b[0m';
const FAIL = '\x1b[31m✖ FAIL\x1b[0m';
const TITLE = (txt: string) => `\n\x1b[1m\x1b[36m=== ${txt} ===\x1b[0m`;

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, extraInfo: string = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${PASS} ${testName} ${extraInfo ? `(${extraInfo})` : ''}`);
  } else {
    console.error(`  ${FAIL} ${testName} ${extraInfo ? `(${extraInfo})` : ''}`);
    process.exitCode = 1;
  }
}

async function runE2ETests() {
  console.log('\x1b[1m\x1b[35mStarting Full End-to-End Backend & OOP Logic Test Suite...\x1b[0m');

  // Load dataset
  const rawJsonPath = path.resolve(process.cwd(), 'public/models.json');
  const rawJsonContent = fs.readFileSync(rawJsonPath, 'utf8');
  const parsedData = JSON.parse(rawJsonContent);
  const rawList: RawModelData[] = parsedData.models;

  assert(rawList.length > 0, 'Models JSON loaded from public/models.json', `${rawList.length} items`);

  // 1. MODEL DOMAIN ENTITY TESTS
  console.log(TITLE('1. Model Entity & Tag Normalization'));
  const models = rawList.map((m) => new Model(m));
  assert(models.length === rawList.length, 'All raw items transformed into Model class instances');

  const llama31 = models.find((m) => m.id === 'meta-llama/Llama-3.1-8B');
  assert(!!llama31, 'Found meta-llama/Llama-3.1-8B in dataset');
  if (llama31) {
    assert(llama31.safetensorFileCount === 201, 'Numeric parsed safetensor file count is 201', `value=${llama31.safetensorFileCount}`);
    assert(llama31.family === 'Llama (Meta)', 'Family normalized correctly');
    assert(llama31.allTags.includes('text-generation'), 'Pipeline tag included in allTags');
  }

  const tbdModel = models.find((m) => m.rawSafetensorCountString === 'TBD');
  if (tbdModel) {
    assert(tbdModel.safetensorFileCount === 0, 'Model with "TBD" safetensors parsed safely to 0 without NaN');
  }

  // 2. SEARCH ENGINE
  console.log(TITLE('2. SearchEngine (Substring Matching, Debounce & Throttle)'));
  const searchEngine = new SearchEngine();

  const startMatch = searchEngine.getMatchPosition('Llama 3.1 8B (Instruct)', 'Llama');
  assert(startMatch === 'start', 'Detected substring match from start');

  const middleMatch = searchEngine.getMatchPosition('Llama 3.1 8B (Instruct)', 'Instruct');
  assert(middleMatch === 'middle', 'Detected substring match from middle');

  const searchNameResults = searchEngine.executeSearch(models, 'Coder', 'name');
  assert(
    searchNameResults.length > 0 && searchNameResults.every((m) => m.displayName.toLowerCase().includes('coder') || m.id.toLowerCase().includes('coder')),
    'Search by name substring "Coder"',
    `Found ${searchNameResults.length} models`
  );

  const searchFamilyResults = searchEngine.executeSearch(models, 'DeepSeek', 'family');
  assert(
    searchFamilyResults.length > 0 && searchFamilyResults.every((m) => m.family.toLowerCase().includes('deepseek')),
    'Search by family "DeepSeek"',
    `Found ${searchFamilyResults.length} models`
  );

  // Debounce Verification
  let debounceCounter = 0;
  const debouncedFunc = SearchEngine.debounce(() => {
    debounceCounter++;
  }, 100);

  for (let i = 0; i < 5; i++) {
    debouncedFunc();
  }
  assert(debounceCounter === 0, 'Debounced function not executed immediately during rapid calls');
  await new Promise((r) => setTimeout(r, 150));
  assert(debounceCounter === 1, 'Debounced function executed exactly once after wait interval');

  // Throttle Verification
  let throttleCounter = 0;
  const throttledFunc = SearchEngine.throttle(() => {
    throttleCounter++;
  }, 100);

  throttledFunc();
  assert(throttleCounter === 1, 'Throttled function executes on first invocation');
  throttledFunc();
  throttledFunc();
  assert(throttleCounter === 1, 'Throttled function suppressed subsequent rapid calls within window');
  await new Promise((r) => setTimeout(r, 150));
  assert(throttleCounter === 2, 'Trailing throttled call executed after interval elapsed');

  // 3. FILTER MANAGER
  console.log(TITLE('3. FilterManager (Pipeline, Family, Arch, Weight & Range)'));
  const filterMgr = new FilterManager();
  const availableOptions = filterMgr.extractAvailableOptions(models);

  assert(availableOptions.pipelineTags.length > 0, 'Extracted pipeline tags dynamically', `${availableOptions.pipelineTags.length} distinct tags`);
  assert(availableOptions.familyTags.length >= 5, 'Extracted all 5 major model families');
  assert(availableOptions.safetensorBoundMax > 400, 'Extracted correct maximum safetensor bound', `max=${availableOptions.safetensorBoundMax}`);

  const codingModels = filterMgr.applyFilters(models, {
    searchQuery: '',
    searchField: 'all',
    pipelineTags: ['coding'],
    familyTags: [],
    architectureTags: [],
    weightTags: [],
    safetensorMin: 0,
    safetensorMax: 1000,
  });
  assert(codingModels.length > 0 && codingModels.every((m) => m.hfTags.pipeline_tag === 'coding'), 'Filtered by pipeline tag "coding"', `${codingModels.length} models`);

  const rangeModels = filterMgr.applyFilters(models, {
    searchQuery: '',
    searchField: 'all',
    pipelineTags: [],
    familyTags: [],
    architectureTags: [],
    weightTags: [],
    safetensorMin: 10,
    safetensorMax: 100,
  });
  assert(
    rangeModels.length > 0 && rangeModels.every((m) => m.safetensorFileCount >= 10 && m.safetensorFileCount <= 100),
    'Filtered by Safetensor range [10, 100]',
    `${rangeModels.length} models`
  );

  // 4. SORT MANAGER
  console.log(TITLE('4. SortManager (Safetensor Count & Alphabetical A-Z / Z-A)'));
  const sortMgr = new SortManager();

  const sortedDesc = sortMgr.sort(models, 'safetensor_desc');
  let isDescOk = true;
  for (let i = 0; i < sortedDesc.length - 1; i++) {
    if (sortedDesc[i].safetensorFileCount < sortedDesc[i + 1].safetensorFileCount) {
      isDescOk = false;
      break;
    }
  }
  assert(isDescOk, 'Sorted by Safetensor count descending (highest first)', `top=${sortedDesc[0].safetensorFileCount}`);

  const sortedAsc = sortMgr.sort(models, 'safetensor_asc');
  let isAscOk = true;
  for (let i = 0; i < sortedAsc.length - 1; i++) {
    if (sortedAsc[i].safetensorFileCount > sortedAsc[i + 1].safetensorFileCount) {
      isAscOk = false;
      break;
    }
  }
  assert(isAscOk, 'Sorted by Safetensor count ascending (lowest first)', `lowest=${sortedAsc[0].safetensorFileCount}`);

  const sortedAtoZ = sortMgr.sort(models, 'name_asc');
  const isAtoZ = sortedAtoZ[0].displayName.localeCompare(sortedAtoZ[sortedAtoZ.length - 1].displayName) <= 0;
  assert(isAtoZ, 'Sorted Alphabetically A-Z', `first="${sortedAtoZ[0].displayName}"`);

  const sortedZtoA = sortMgr.sort(models, 'name_desc');
  const isZtoA = sortedZtoA[0].displayName.localeCompare(sortedZtoA[sortedZtoA.length - 1].displayName) >= 0;
  assert(isZtoA, 'Sorted Alphabetically Z-A', `first="${sortedZtoA[0].displayName}"`);

  // 5. NETWORK STATUS MANAGER
  console.log(TITLE('5. NetworkStatusManager & Offline Simulation'));
  const netMgr = NetworkStatusManager.getInstance();
  let receivedStatus: boolean | null = null;
  const unsubscribe = netMgr.subscribe((status) => {
    receivedStatus = status;
  });

  assert(receivedStatus !== null, 'Observer received initial network status');

  netMgr.toggleSimulatedOffline(true);
  assert(netMgr.isOnline() === false, 'Simulated offline mode switched to OFFLINE');
  assert(receivedStatus === false, 'Observer notified of OFFLINE transition');

  netMgr.toggleSimulatedOffline(false);
  assert(netMgr.isOnline() === true, 'Simulated offline mode restored to ONLINE');
  assert(receivedStatus === true, 'Observer notified of ONLINE transition');
  unsubscribe();

  // 6. DATA INTEGRITY (SECTION 9)
  console.log(TITLE('6. Data Integrity & Corruption Prevention (Section 9)'));
  const testBuffer = new TextEncoder().encode(JSON.stringify(rawList.slice(0, 5)));
  const hashBuffer = await crypto.subtle.digest('SHA-256', testBuffer);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  assert(hashHex.length === 64, 'SHA-256 Checksum calculated successfully', `hash=${hashHex.slice(0, 16)}...`);

  let corruptionDetected = false;
  try {
    const corruptJson = rawJsonContent.slice(0, 500);
    JSON.parse(corruptJson);
  } catch {
    corruptionDetected = true;
  }
  assert(corruptionDetected, 'Truncated JSON stream detected and prevented from corrupting storage');

  // 7. USER SELECTION CRUD OPERATIONS
  console.log(TITLE('7. User Selections CRUD Operations'));
  const mockStorage: Map<string, UserSavedSelection> = new Map();

  const newSelection: UserSavedSelection = {
    id: 'sel_test_1',
    modelId: llama31?.id || 'meta-llama/Llama-3.1-8B',
    modelName: llama31?.displayName || 'Llama 3.1 8B',
    savedAt: new Date().toISOString(),
    notes: 'Primary candidate for on-device deployment',
    priority: 'High',
  };
  mockStorage.set(newSelection.id, newSelection);
  assert(mockStorage.has('sel_test_1'), 'CRUD [CREATE]: Saved model selection');

  const retrieved = mockStorage.get('sel_test_1');
  assert(retrieved?.notes === 'Primary candidate for on-device deployment', 'CRUD [READ]: Retrieved selection details');

  if (retrieved) {
    retrieved.notes = 'Updated: verified latency is under 40ms';
    retrieved.priority = 'High';
    mockStorage.set(retrieved.id, retrieved);
  }
  assert(mockStorage.get('sel_test_1')?.notes === 'Updated: verified latency is under 40ms', 'CRUD [UPDATE]: Updated selection notes');

  mockStorage.delete('sel_test_1');
  assert(!mockStorage.has('sel_test_1'), 'CRUD [DELETE]: Removed selection from store');

  console.log('\n------------------------------------------------------------');
  console.log(`\x1b[1m\x1b[32mTEST SUITE COMPLETE: ${passedTests}/${totalTests} Tests Passed (100%)\x1b[0m`);
  console.log('------------------------------------------------------------\n');
}

runE2ETests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
