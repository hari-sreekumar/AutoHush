import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { DayPicker } from '../components/DayPicker';
import { LocationPicker } from '../components/LocationPicker';
import { ModeSelector } from '../components/ModeSelector';
import { TimeStepper } from '../components/TimeStepper';
import { colors } from '../theme';
import type { Rule } from '../types';

interface Props {
  initial?: Rule;
  onSave: (rule: Rule) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
}

const newRule = (): Rule => ({
  id: String(Date.now()),
  name: '',
  enabled: true,
  mode: 'silent',
  days: [1, 2, 3, 4, 5],
  startMin: 9 * 60,
  endMin: 17 * 60,
});

export function RuleEditorScreen({ initial, onSave, onDelete, onCancel }: Props) {
  const [rule, setRule] = useState<Rule>(initial ?? newRule());
  const patch = (p: Partial<Rule>) => setRule(r => ({ ...r, ...p }));

  const save = () => {
    if (rule.days.length === 0) {
      Alert.alert('Pick at least one day');
      return;
    }
    onSave({ ...rule, name: rule.name.trim() || 'Untitled rule' });
  };

  const confirmDelete = () =>
    Alert.alert('Delete rule?', rule.name, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(rule.id) },
    ]);

  const overnight = rule.endMin < rule.startMin;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{initial ? 'Edit rule' : 'New rule'}</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={rule.name}
          onChangeText={name => patch({ name })}
          placeholder="e.g. Office hours"
          placeholderTextColor={colors.muted}
        />

        <Text style={styles.label}>Switch phone to</Text>
        <ModeSelector value={rule.mode} onChange={mode => patch({ mode })} />

        <Text style={styles.label}>Days</Text>
        <DayPicker value={rule.days} onChange={days => patch({ days })} />

        <Text style={styles.label}>Time</Text>
        <View style={styles.times}>
          <TimeStepper label="From" value={rule.startMin} onChange={startMin => patch({ startMin })} />
          <TimeStepper label="Until" value={rule.endMin} onChange={endMin => patch({ endMin })} />
        </View>
        <Text style={styles.hint}>
          {rule.startMin === rule.endMin
            ? 'Same start and end time means all day.'
            : overnight
            ? 'Ends the next morning.'
            : ' '}
        </Text>

        <LocationPicker value={rule.place} onChange={place => patch({ place })} />
        <Text style={styles.hint}>
          When the rule ends, your previous ringer mode is restored.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.btn, styles.secondary]} onPress={onCancel}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>
        {initial && onDelete && (
          <Pressable style={[styles.btn, styles.secondary]} onPress={confirmDelete}>
            <Text style={[styles.secondaryText, { color: colors.danger }]}>Delete</Text>
          </Pressable>
        )}
        <Pressable style={[styles.btn, styles.primary]} onPress={save}>
          <Text style={styles.primaryText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 8 },
  heading: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8 },
  label: { fontWeight: '700', color: colors.text, marginTop: 12, marginBottom: 4 },
  input: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 16,
  },
  times: { flexDirection: 'row', gap: 12 },
  hint: { color: colors.muted, fontSize: 12, marginVertical: 4 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  primary: { backgroundColor: colors.primary },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondary: { backgroundColor: colors.bg },
  secondaryText: { color: colors.text, fontWeight: '700' },
});
