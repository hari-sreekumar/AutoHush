import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { formatMinutes } from '../utils/time';

interface Props {
  label: string;
  /** minutes since midnight */
  value: number;
  onChange: (min: number) => void;
}

const DAY = 24 * 60;
const wrap = (m: number) => ((m % DAY) + DAY) % DAY;

/** Dependency-free time input: hour and 5-minute steppers. */
export function TimeStepper({ label, value, onChange }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Step text="−" onPress={() => onChange(wrap(value - 60))} hint="Hour" />
        <Step text="+" onPress={() => onChange(wrap(value + 60))} hint="Hour" />
      </View>
      <Text style={styles.time}>{formatMinutes(value)}</Text>
      <View style={styles.row}>
        <Step text="−" onPress={() => onChange(wrap(value - 5))} hint="Min" />
        <Step text="+" onPress={() => onChange(wrap(value + 5))} hint="Min" />
      </View>
    </View>
  );
}

function Step({ text, onPress, hint }: { text: string; onPress: () => void; hint: string }) {
  return (
    <Pressable onPress={onPress} style={styles.step} accessibilityLabel={`${text} ${hint}`}>
      <Text style={styles.stepText}>{text}</Text>
      <Text style={styles.hint}>{hint}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.muted, fontWeight: '600' },
  time: { fontSize: 22, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', gap: 8 },
  step: {
    minWidth: 56,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.bg,
  },
  stepText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  hint: { fontSize: 10, color: colors.muted },
});
