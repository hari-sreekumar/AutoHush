import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { getCurrentLocation } from '../native/Hush';
import { colors } from '../theme';
import type { Place } from '../types';

interface Props {
  value?: Place;
  onChange: (p?: Place) => void;
}

const RADII = [50, 100, 200, 500, 1000];

export function LocationPicker({ value, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const capture = async (radius = value?.radius ?? 100) => {
    setBusy(true);
    setError(undefined);
    try {
      const { lat, lng } = await getCurrentLocation();
      onChange({ lat, lng, radius });
    } catch (e: any) {
      setError(e?.message ?? 'Could not get location');
      if (!value) onChange(undefined);
    } finally {
      setBusy(false);
    }
  };

  const enabled = !!value || busy;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Only at a place</Text>
          <Text style={styles.sub}>Apply this rule only when I'm near a spot</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={on => (on ? capture() : onChange(undefined))}
        />
      </View>

      {busy && <ActivityIndicator style={{ marginTop: 12 }} />}
      {!!error && <Text style={styles.error}>{error}</Text>}

      {value && (
        <View style={{ marginTop: 12, gap: 12 }}>
          <Text style={styles.coords}>
            📍 {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </Text>
          <Pressable onPress={() => capture()} style={styles.btn}>
            <Text style={styles.btnText}>Use my current location</Text>
          </Pressable>
          <Text style={styles.sub}>Radius</Text>
          <View style={styles.radii}>
            {RADII.map(r => (
              <Pressable
                key={r}
                onPress={() => onChange({ ...value, radius: r })}
                style={[styles.chip, value.radius === r && styles.chipOn]}>
                <Text style={[styles.chipText, value.radius === r && { color: '#fff' }]}>
                  {r >= 1000 ? `${r / 1000} km` : `${r} m`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  sub: { color: colors.muted, fontSize: 13 },
  coords: { color: colors.text, fontWeight: '600' },
  error: { color: colors.danger, marginTop: 8 },
  btn: { padding: 10, borderRadius: 8, backgroundColor: colors.bg, alignItems: 'center' },
  btnText: { color: colors.primary, fontWeight: '600' },
  radii: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600' },
});
