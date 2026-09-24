import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function AuthCard() {
  const [agreed, setAgreed] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Login / Sign Up</Text>

      <Pressable style={styles.checkRow} onPress={() => setAgreed(!agreed)}>
        <View style={[styles.circle, agreed && styles.circleChecked]}>
          {agreed && <View style={styles.dot} />}
        </View>
        <Text style={styles.checkText}>
          I agree to the <Text style={styles.link}>Terms of Service</Text>
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, !agreed && styles.buttonDisabled]}
        disabled={!agreed}
      >
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2A2A2E',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#6B6B72',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleChecked: {
    borderColor: '#A78BFA',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#A78BFA',
  },
  checkText: {
    color: '#B0B0B8',
    fontSize: 14,
  },
  link: {
    color: '#A78BFA',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#A78BFA',
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#1C1C1E',
    fontSize: 15,
    fontWeight: '600',
  },
});