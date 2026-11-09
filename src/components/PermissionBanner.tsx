import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

interface Props {
  message: string;
  action: string;
  onPress: () => void;
}

export function PermissionBanner({ message, action, onPress }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
      <Pressable onPress={onPress} style={styles.btn}>
        <Text style={styles.btnText}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 12, borderRadius: 12, backgroundColor: colors.warnBg, gap: 8 },
  text: { color: colors.warnText },
  btn: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.warnText },
  btnText: { color: '#fff', fontWeight: '600' },
});
