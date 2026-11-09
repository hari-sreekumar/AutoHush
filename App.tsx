import { useState } from 'react';
import { Alert, BackHandler, StatusBar } from 'react-native';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRules } from './src/hooks/useRules';
import { HomeScreen } from './src/screens/HomeScreen';
import { RuleEditorScreen } from './src/screens/RuleEditorScreen';
import { colors } from './src/theme';
import type { Rule } from './src/types';

type Route = { name: 'home' } | { name: 'editor'; rule?: Rule };

function App() {
  const { rules, upsert, remove, toggle } = useRules();
  const [route, setRoute] = useState<Route>({ name: 'home' });

  // Android back button returns from the editor instead of closing the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.name === 'editor') {
        setRoute({ name: 'home' });
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [route]);

  const run = (p: Promise<void>) =>
    p.catch(e => Alert.alert('Could not save', String(e?.message ?? e)));

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        {route.name === 'home' ? (
          <HomeScreen
            rules={rules}
            onAdd={() => setRoute({ name: 'editor' })}
            onEdit={rule => setRoute({ name: 'editor', rule })}
            onToggle={(id, enabled) => run(toggle(id, enabled))}
          />
        ) : (
          <RuleEditorScreen
            initial={route.rule}
            onCancel={() => setRoute({ name: 'home' })}
            onSave={rule => {
              run(upsert(rule));
              setRoute({ name: 'home' });
            }}
            onDelete={id => {
              run(remove(id));
              setRoute({ name: 'home' });
            }}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;
