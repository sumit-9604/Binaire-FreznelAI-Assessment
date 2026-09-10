import React, { useState, useEffect, useMemo } from 'react';
import { Flex, SearchField, Picker, Item, Text } from '@adobe/react-spectrum';
import { SearchEngine } from '../../search/SearchEngine';

interface SearchControlsProps {
  onSearchChange: (query: string, field: 'all' | 'name' | 'family') => void;
  activeQuery: string;
  activeField: 'all' | 'name' | 'family';
}

export const SearchControls: React.FC<SearchControlsProps> = ({
  onSearchChange,
  activeQuery,
  activeField,
}) => {
  const [internalQuery, setInternalQuery] = useState(activeQuery);
  const [field, setField] = useState<'all' | 'name' | 'family'>(activeField);
  const [isTyping, setIsTyping] = useState(false);

  // Debounced emitter
  const debouncedEmitter = useMemo(
    () =>
      SearchEngine.debounce((q: string, f: 'all' | 'name' | 'family') => {
        onSearchChange(q, f);
        setIsTyping(false);
      }, 250),
    [onSearchChange]
  );

  const handleQueryChange = (val: string) => {
    setInternalQuery(val);
    setIsTyping(true);
    debouncedEmitter(val, field);
  };

  const handleFieldChange = (key: React.Key | null) => {
    if (!key) return;
    const newField = key as 'all' | 'name' | 'family';
    setField(newField);
    onSearchChange(internalQuery, newField);
  };

  useEffect(() => {
    setInternalQuery(activeQuery);
  }, [activeQuery]);

  return (
    <div style={{ marginBottom: '16px' }}>
      <Flex direction="column" gap="size-100">
        <Flex direction="row" gap="size-100" alignItems="end">
          <div style={{ flex: 1 }}>
            <SearchField
              label="Search Models"
              placeholder="Search by name, author, or family..."
              value={internalQuery}
              onChange={handleQueryChange}
              onClear={() => handleQueryChange('')}
              width="100%"
            />
          </div>
          <Picker
            label="Search In"
            selectedKey={field}
            onSelectionChange={handleFieldChange}
            width="size-1600"
          >
            <Item key="all">All Fields</Item>
            <Item key="name">Model Name</Item>
            <Item key="family">Model Family</Item>
          </Picker>
        </Flex>

        {/* Throttling & Match Details feedback */}
        <Flex direction="row" justifyContent="space-between" alignItems="center">
          <Text UNSAFE_style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Matches substring from start or middle of words
          </Text>
          {isTyping ? (
            <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>Debouncing query...</span>
          ) : internalQuery ? (
            <span style={{ fontSize: '0.75rem', color: '#059669' }}>Filter active</span>
          ) : null}
        </Flex>
      </Flex>
    </div>
  );
};
