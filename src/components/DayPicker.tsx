import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { DAY_LABELS } from '../utils/time';

interface Props {
  value: number[];
  onChange: (days: number[]) => void;
}

export function DayPicker({ value, onChange }: Props) {
  const toggle = (d: number) =>
    onChange(value.includes(d) ? value.filter(x => x !== d) : [...value, d].sort());

  return (
    <View style={styles.row}>
      {DAY_LABELS.map((label, d) => {
        const on = value.includes(d);
        return (
          <Pressable key={d} onPress={() => toggle(d)} style={[styles.day, on && styles.dayOn]}>
            <Text style={[styles.text, on && styles.textOn]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  day: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  dayOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontWeight: '600', color: colors.muted },
  textOn: { color: '#fff' },
});
