import React, { useState } from 'react';
import {
  Flex,
  Heading,
  Divider,
  Button,
  ActionButton,
  TextField,
  Picker,
  Item,
  Text,
} from '@adobe/react-spectrum';
import { UserSavedSelection } from '../../types/model';

interface SavedSelectionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selections: UserSavedSelection[];
  onUpdateSelection: (selection: UserSavedSelection) => void;
  onDeleteSelection: (id: string) => void;
}

export const SavedSelectionsDrawer: React.FC<SavedSelectionsDrawerProps> = ({
  isOpen,
  onClose,
  selections,
  onUpdateSelection,
  onDeleteSelection,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editPriority, setEditPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  if (!isOpen) return null;

  const startEdit = (item: UserSavedSelection) => {
    setEditingId(item.id);
    setEditNotes(item.notes || '');
    setEditPriority(item.priority || 'Medium');
  };

  const saveEdit = (item: UserSavedSelection) => {
    onUpdateSelection({
      ...item,
      notes: editNotes,
      priority: editPriority,
    });
    setEditingId(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '420px',
          maxWidth: '100%',
          height: '100%',
          background: '#ffffff',
          boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.08)',
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Flex direction="row" justifyContent="space-between" alignItems="center">
          <div>
            <Heading level={3} margin={0} UNSAFE_style={{ fontSize: '1.15rem', fontWeight: 600 }}>
              Saved Models
            </Heading>
            <Text UNSAFE_style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              CRUD Selections Store ({selections.length} items)
            </Text>
          </div>
          <ActionButton isQuiet onPress={onClose}>
            Close
          </ActionButton>
        </Flex>

        <Divider size="M" marginY="size-150" />

        {selections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Text>No models selected yet.</Text>
            <Text UNSAFE_style={{ fontSize: '0.8rem', display: 'block', marginTop: '6px' }}>
              Click "Select Model" on any model card to bookmark and customize it.
            </Text>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {selections.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '14px',
                    background: 'var(--bg-subtle)',
                  }}
                >
                  <Flex direction="row" justifyContent="space-between" alignItems="start">
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.modelName}
                      </h4>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {item.modelId}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background:
                          item.priority === 'High'
                            ? '#fee2e2'
                            : item.priority === 'Low'
                            ? '#f1f5f9'
                            : '#fef3c7',
                        color:
                          item.priority === 'High'
                            ? '#991b1b'
                            : item.priority === 'Low'
                            ? '#475569'
                            : '#92400e',
                      }}
                    >
                      {item.priority || 'Medium'}
                    </span>
                  </Flex>

                  {isEditing ? (
                    <div style={{ marginTop: '10px' }}>
                      <TextField
                        label="Deployment Notes"
                        value={editNotes}
                        onChange={setEditNotes}
                        width="100%"
                        marginBottom="size-100"
                      />
                      <Picker
                        label="Priority"
                        selectedKey={editPriority}
                        onSelectionChange={(key) => setEditPriority(key as 'High' | 'Medium' | 'Low')}
                        width="100%"
                        marginBottom="size-100"
                      >
                        <Item key="High">High</Item>
                        <Item key="Medium">Medium</Item>
                        <Item key="Low">Low</Item>
                      </Picker>
                      <Flex direction="row" gap="size-100" justifyContent="end">
                        <ActionButton onPress={() => setEditingId(null)}>Cancel</ActionButton>
                        <Button variant="cta" onPress={() => saveEdit(item)}>
                          Save Notes
                        </Button>
                      </Flex>
                    </div>
                  ) : (
                    <>
                      {item.notes && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                          "{item.notes}"
                        </p>
                      )}
                      <Flex direction="row" justifyContent="space-between" alignItems="center" marginTop="size-100">
                        <Text UNSAFE_style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          Saved {new Date(item.savedAt).toLocaleDateString()}
                        </Text>
                        <Flex direction="row" gap="size-50">
                          <ActionButton isQuiet onPress={() => startEdit(item)} UNSAFE_style={{ fontSize: '0.75rem' }}>
                            Edit Notes
                          </ActionButton>
                          <ActionButton
                            isQuiet
                            onPress={() => onDeleteSelection(item.id)}
                            UNSAFE_style={{ fontSize: '0.75rem', color: '#dc2626' }}
                          >
                            Remove
                          </ActionButton>
                        </Flex>
                      </Flex>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
