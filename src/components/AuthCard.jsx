import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function AuthCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Login / Sign Up</Text>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2A2A2E',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#A78BFA',
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1C1C1E',
    fontSize: 15,
    fontWeight: '600',
  },
});