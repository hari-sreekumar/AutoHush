import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, modeMeta } from '../theme';
import type { Rule } from '../types';
import { formatDays, formatWindow } from '../utils/time';

interface Props {
  rule: Rule;
  onPress: () => void;
  onToggle: (enabled: boolean) => void;
}

export function RuleCard({ rule, onPress, onToggle }: Props) {
  const meta = modeMeta[rule.mode];
  return (
    <Pressable onPress={onPress} style={[styles.card, !rule.enabled && { opacity: 0.55 }]}>
      <View style={[styles.badge, { backgroundColor: meta.color + '22' }]}>
        <Text style={styles.icon}>{meta.icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{rule.name || 'Untitled rule'}</Text>
        <Text style={styles.line}>
          {meta.label} · {formatWindow(rule.startMin, rule.endMin)}
        </Text>
        <Text style={styles.line}>{formatDays(rule.days)}</Text>
        {rule.place && (
          <Text style={styles.line}>
            📍 within {rule.place.radius >= 1000 ? `${rule.place.radius / 1000} km` : `${rule.place.radius} m`}
          </Text>
        )}
      </View>
      <Switch value={rule.enabled} onValueChange={onToggle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22 },
  body: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  line: { color: colors.muted, fontSize: 13 },
});
