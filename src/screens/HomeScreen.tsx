import { useCallback, useEffect, useState } from 'react';
import { AppState, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { PermissionBanner } from '../components/PermissionBanner';
import { RuleCard } from '../components/RuleCard';
import {
  getActiveNames,
  hasLocationPermission,
  hasPolicyAccess,
  isSupported,
  openPolicySettings,
  requestPermissions,
} from '../native/Hush';
import { colors } from '../theme';
import type { Rule } from '../types';

interface Props {
  rules: Rule[];
  onAdd: () => void;
  onEdit: (rule: Rule) => void;
  onToggle: (id: string, enabled: boolean) => void;
}

const Separator = () => <View style={styles.separator} />;

export function HomeScreen({ rules, onAdd, onEdit, onToggle }: Props) {
  const [policyOk, setPolicyOk] = useState(true);
  const [locationOk, setLocationOk] = useState(true);
  const [active, setActive] = useState('');

  const refresh = useCallback(async () => {
    if (!isSupported) return;
    setPolicyOk(await hasPolicyAccess());
    setLocationOk(await hasLocationPermission());
    setActive(await getActiveNames());
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 15000);
    // Re-check when returning from the system settings screen.
    const sub = AppState.addEventListener('change', s => s === 'active' && refresh());
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [refresh]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AutoHush</Text>
      <Text style={styles.subtitle}>
        {active ? `Active now: ${active}` : 'No rule is active right now'}
      </Text>

      <View style={styles.banners}>
        {!isSupported && (
          <PermissionBanner
            message="Changing the ringer automatically is only possible on Android."
            action="OK"
            onPress={() => {}}
          />
        )}
        {isSupported && !policyOk && (
          <PermissionBanner
            message="Allow Do Not Disturb access so AutoHush can change your ringer mode."
            action="Grant access"
            onPress={openPolicySettings}
          />
        )}
        {isSupported && !locationOk && (
          <PermissionBanner
            message="Location permission is needed for the background service to run."
            action="Allow location"
            onPress={() => requestPermissions().then(refresh)}
          />
        )}
      </View>

      <FlatList
        data={rules}
        keyExtractor={r => r.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <Text style={styles.empty}>No rules yet. Tap + to create your first schedule.</Text>
        }
        renderItem={({ item }) => (
          <RuleCard rule={item} onPress={() => onEdit(item)} onToggle={v => onToggle(item.id, v)} />
        )}
      />

      <Pressable style={styles.fab} onPress={onAdd} accessibilityLabel="Add rule">
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, paddingHorizontal: 20, paddingTop: 16 },
  subtitle: { color: colors.muted, paddingHorizontal: 20, marginTop: 2, marginBottom: 12 },
  banners: { paddingHorizontal: 20, gap: 8 },
  list: { padding: 20, paddingBottom: 100 },
  separator: { height: 12 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 32, marginTop: -2 },
});
