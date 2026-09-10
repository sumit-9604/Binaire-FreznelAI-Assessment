import React, { useState, useEffect, useCallback } from 'react';
import { Flex, ProgressCircle } from '@adobe/react-spectrum';
import { Model } from '../models/Model';
import { ModelService } from '../api/modelsApi';
import { FilterCriteria, SortOption, UserSavedSelection } from '../types/model';
import { AvailableFilterOptions } from '../filters/FilterManager';
import { NetworkStatusManager } from '../offline/networkStatus';
import { AuthService, AuthUserProfile } from '../auth/authService';

import { Navbar } from '../components/Layout/Navbar';
import { OfflineBanner } from '../components/Layout/OfflineBanner';
import { SearchControls } from '../components/Search/SearchControls';
import { FilterPanel } from '../components/Filters/FilterPanel';
import { SortControls } from '../components/Sorting/SortControls';
import { ModelGrid } from '../components/Models/ModelGrid';
import { ModelDetailModal } from '../components/Models/ModelDetailModal';
import { AuthModal } from '../components/Auth/AuthModal';
import { SavedSelectionsDrawer } from '../components/Models/SavedSelectionsDrawer';

interface ModelExplorerPageProps {
  onSignOut?: () => void;
}

export const ModelExplorerPage: React.FC<ModelExplorerPageProps> = ({ onSignOut }) => {
  const modelService = ModelService.getInstance();
  const networkManager = NetworkStatusManager.getInstance();
  const authService = AuthService.getInstance();

  const [loading, setLoading] = useState(true);
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [availableOptions, setAvailableOptions] = useState<AvailableFilterOptions>({
    pipelineTags: [],
    familyTags: [],
    architectureTags: [],
    weightTags: [],
    safetensorBoundMin: 0,
    safetensorBoundMax: 500,
  });

  const [criteria, setCriteria] = useState<FilterCriteria>({
    searchQuery: '',
    searchField: 'all',
    pipelineTags: [],
    familyTags: [],
    architectureTags: [],
    weightTags: [],
    safetensorMin: 0,
    safetensorMax: 500,
  });

  const [activeSort, setActiveSort] = useState<SortOption>('safetensor_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Network & Auth state
  const [isOnline, setIsOnline] = useState(networkManager.isOnline());
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(networkManager.isSimulationActive());
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(authService.getCurrentUser());

  // CRUD selections state
  const [savedSelections, setSavedSelections] = useState<UserSavedSelection[]>([]);

  // Modals state
  const [selectedDetailModel, setSelectedDetailModel] = useState<Model | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  // Subscribe to network & auth changes
  useEffect(() => {
    const unsubNet = networkManager.subscribe((status) => {
      setIsOnline(status);
      setIsSimulatedOffline(networkManager.isSimulationActive());
    });

    const unsubAuth = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubNet();
      unsubAuth();
    };
  }, []);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const loaded = await modelService.loadModels();
        setAllModels(loaded);
        const options = modelService.getAvailableFilterOptions();
        setAvailableOptions(options);

        // Set initial criteria bounds
        setCriteria((prev) => ({
          ...prev,
          safetensorMin: options.safetensorBoundMin,
          safetensorMax: options.safetensorBoundMax,
        }));

        // Load saved selections from CRUD store
        const selections = await modelService.getSavedSelections();
        setSavedSelections(selections);
      } catch (err) {
        console.error('Failed to load models:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Re-run search/filter/sort pipeline on state changes
  useEffect(() => {
    if (allModels.length > 0) {
      const results = modelService.queryModels(criteria, activeSort);
      setFilteredModels(results);
    }
  }, [allModels, criteria, activeSort]);

  const handleSearchChange = useCallback((query: string, field: 'all' | 'name' | 'family') => {
    setCriteria((prev) => ({
      ...prev,
      searchQuery: query,
      searchField: field,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setCriteria({
      searchQuery: '',
      searchField: 'all',
      pipelineTags: [],
      familyTags: [],
      architectureTags: [],
      weightTags: [],
      safetensorMin: availableOptions.safetensorBoundMin,
      safetensorMax: availableOptions.safetensorBoundMax,
    });
  }, [availableOptions]);

  // Selection CRUD
  const handleSelectModel = async (model: Model) => {
    // If already saved, remove it; otherwise add
    const existing = savedSelections.find((s) => s.modelId === model.id);
    if (existing) {
      await modelService.removeSelection(existing.id);
      setSavedSelections((prev) => prev.filter((s) => s.id !== existing.id));
    } else {
      const created = await modelService.saveSelection(model, 'Candidate for evaluation', 'Medium');
      setSavedSelections((prev) => [...prev, created]);
    }
  };

  const handleUpdateSelection = async (selection: UserSavedSelection) => {
    await modelService.updateSelection(selection);
    setSavedSelections((prev) =>
      prev.map((s) => (s.id === selection.id ? selection : s))
    );
  };

  const handleDeleteSelection = async (id: string) => {
    await modelService.removeSelection(id);
    setSavedSelections((prev) => prev.filter((s) => s.id !== id));
  };

  const savedModelIds = new Set(savedSelections.map((s) => s.modelId));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={() => networkManager.toggleSimulatedOffline()}
        savedCount={savedSelections.length}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={() => {
          authService.signOut();
          if (onSignOut) onSignOut();
        }}
      />

      {/* Offline Alert Banner */}
      <OfflineBanner
        isOnline={isOnline}
        isSimulated={isSimulatedOffline}
        onRestore={() => networkManager.toggleSimulatedOffline(false)}
      />

      {/* Main Layout Area */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {loading ? (
          <Flex direction="column" alignItems="center" justifyContent="center" height="50vh" gap="size-150">
            <ProgressCircle aria-label="Loading models..." isIndeterminate size="L" />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Loading model library from cache...
            </span>
          </Flex>
        ) : (
          <Flex direction="row" gap="size-300" alignItems="start">
            {/* Left Filter Sidebar */}
            <FilterPanel
              availableOptions={availableOptions}
              criteria={criteria}
              onCriteriaChange={setCriteria}
              onResetFilters={handleResetFilters}
            />

            {/* Right Main Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Search Field & Debounce Controls */}
              <SearchControls
                onSearchChange={handleSearchChange}
                activeQuery={criteria.searchQuery}
                activeField={criteria.searchField}
              />

              {/* Sorting & Results Count Bar */}
              <SortControls
                totalCount={allModels.length}
                filteredCount={filteredModels.length}
                activeSort={activeSort}
                onSortChange={setActiveSort}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />

              {/* Model Cards Grid / Table */}
              <ModelGrid
                models={filteredModels}
                viewMode={viewMode}
                onSelectModel={handleSelectModel}
                onViewModelDetails={setSelectedDetailModel}
                savedModelIds={savedModelIds}
                onResetFilters={handleResetFilters}
              />
            </div>
          </Flex>
        )}
      </main>

      {/* Modals & Drawers */}
      <ModelDetailModal
        model={selectedDetailModel}
        isOpen={!!selectedDetailModel}
        onClose={() => setSelectedDetailModel(null)}
        onSelect={handleSelectModel}
        isSaved={selectedDetailModel ? savedModelIds.has(selectedDetailModel.id) : false}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />

      <SavedSelectionsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        selections={savedSelections}
        onUpdateSelection={handleUpdateSelection}
        onDeleteSelection={handleDeleteSelection}
      />
    </div>
  );
};
