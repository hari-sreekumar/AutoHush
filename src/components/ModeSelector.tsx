import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, modeMeta } from '../theme';
import type { RingerMode } from '../types';

interface Props {
  value: RingerMode;
  onChange: (m: RingerMode) => void;
}

export function ModeSelector({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {(Object.keys(modeMeta) as RingerMode[]).map(m => {
        const selected = m === value;
        return (
          <Pressable
            key={m}
            onPress={() => onChange(m)}
            style={[styles.option, selected && { borderColor: modeMeta[m].color, backgroundColor: modeMeta[m].color + '1A' }]}>
            <Text style={styles.icon}>{modeMeta[m].icon}</Text>
            <Text style={[styles.label, selected && { color: modeMeta[m].color }]}>{modeMeta[m].label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  icon: { fontSize: 24 },
  label: { marginTop: 4, fontWeight: '600', color: colors.muted },
});
