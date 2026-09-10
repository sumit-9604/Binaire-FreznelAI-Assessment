import React from 'react';
import {
  Flex,
  Heading,
  Divider,
  RangeSlider,
  CheckboxGroup,
  Checkbox,
  ActionButton,
  Text,
} from '@adobe/react-spectrum';
import { AvailableFilterOptions } from '../../filters/FilterManager';
import { FilterCriteria } from '../../types/model';

interface FilterPanelProps {
  availableOptions: AvailableFilterOptions;
  criteria: FilterCriteria;
  onCriteriaChange: (newCriteria: FilterCriteria) => void;
  onResetFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  availableOptions,
  criteria,
  onCriteriaChange,
  onResetFilters,
}) => {
  const handleRangeChange = (value: { start: number; end: number }) => {
    onCriteriaChange({
      ...criteria,
      safetensorMin: value.start,
      safetensorMax: value.end,
    });
  };

  const handlePipelineChange = (selected: string[]) => {
    onCriteriaChange({
      ...criteria,
      pipelineTags: selected,
    });
  };

  const handleFamilyChange = (selected: string[]) => {
    onCriteriaChange({
      ...criteria,
      familyTags: selected,
    });
  };

  const handleArchChange = (selected: string[]) => {
    onCriteriaChange({
      ...criteria,
      architectureTags: selected,
    });
  };

  const handleWeightChange = (selected: string[]) => {
    onCriteriaChange({
      ...criteria,
      weightTags: selected,
    });
  };

  const hasActiveFilters =
    criteria.pipelineTags.length > 0 ||
    criteria.familyTags.length > 0 ||
    criteria.architectureTags.length > 0 ||
    criteria.weightTags.length > 0 ||
    criteria.safetensorMin > availableOptions.safetensorBoundMin ||
    criteria.safetensorMax < availableOptions.safetensorBoundMax ||
    criteria.searchQuery.trim() !== '';

  return (
    <aside
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '18px',
        width: '300px',
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
      }}
    >
      <Flex direction="column" gap="size-200">
        {/* Header with Reset Action */}
        <Flex direction="row" justifyContent="space-between" alignItems="center">
          <Heading level={4} margin={0} UNSAFE_style={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Filters
          </Heading>
          {hasActiveFilters && (
            <ActionButton isQuiet onPress={onResetFilters} UNSAFE_style={{ fontSize: '0.75rem' }}>
              Reset All
            </ActionButton>
          )}
        </Flex>

        <Divider size="S" />

        {/* 1. Safetensor Range Slider (Min to Max) */}
        <div>
          <Text UNSAFE_style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
            Safetensor File Count ({criteria.safetensorMin} – {criteria.safetensorMax})
          </Text>
          <RangeSlider
            label="Range"
            showValueLabel={false}
            minValue={availableOptions.safetensorBoundMin}
            maxValue={availableOptions.safetensorBoundMax}
            value={{ start: criteria.safetensorMin, end: criteria.safetensorMax }}
            onChange={handleRangeChange}
            width="100%"
          />
        </div>

        <Divider size="S" />

        {/* 2. Family Tags */}
        <div>
          <CheckboxGroup
            label="Model Family"
            value={criteria.familyTags}
            onChange={handleFamilyChange}
          >
            {availableOptions.familyTags.map((family) => (
              <Checkbox key={family} value={family}>
                {family}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </div>

        <Divider size="S" />

        {/* 3. Pipeline Tags */}
        <div>
          <CheckboxGroup
            label="Pipeline Task"
            value={criteria.pipelineTags}
            onChange={handlePipelineChange}
          >
            {availableOptions.pipelineTags.map((tag) => (
              <Checkbox key={tag} value={tag}>
                {tag}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </div>

        <Divider size="S" />

        {/* 4. Architecture Tags */}
        <div>
          <CheckboxGroup
            label="Architecture"
            value={criteria.architectureTags}
            onChange={handleArchChange}
          >
            {availableOptions.architectureTags.slice(0, 8).map((arch) => (
              <Checkbox key={arch} value={arch}>
                {arch}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </div>

        <Divider size="S" />

        {/* 5. Weight Tags */}
        <div>
          <CheckboxGroup
            label="Weight Format"
            value={criteria.weightTags}
            onChange={handleWeightChange}
          >
            {availableOptions.weightTags.slice(0, 6).map((weight) => (
              <Checkbox key={weight} value={weight}>
                {weight}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </div>
      </Flex>
    </aside>
  );
};
