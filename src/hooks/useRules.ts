import { useCallback, useEffect, useState } from 'react';
import { loadRules, saveRules } from '../native/Hush';
import type { Rule } from '../types';

export function useRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadRules()
      .then(setRules)
      .catch(() => setRules([]))
      .finally(() => setLoaded(true));
  }, []);

  const persist = useCallback(async (next: Rule[]) => {
    setRules(next);
    await saveRules(next);
  }, []);

  const upsert = useCallback(
    (rule: Rule) => {
      const exists = rules.some(r => r.id === rule.id);
      return persist(exists ? rules.map(r => (r.id === rule.id ? rule : r)) : [...rules, rule]);
    },
    [rules, persist],
  );

  const remove = useCallback((id: string) => persist(rules.filter(r => r.id !== id)), [rules, persist]);

  const toggle = useCallback(
    (id: string, enabled: boolean) => persist(rules.map(r => (r.id === id ? { ...r, enabled } : r))),
    [rules, persist],
  );

  return { rules, loaded, upsert, remove, toggle };
}
