import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function AuthCard() {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();

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

      <Pressable onPress={() => router.replace('/Permission')}>
        <Text style={styles.skipbtn}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    gap: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  title: {
    color: '#1C1C1E',
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
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleChecked: {
    borderColor: '#7C5CFF',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C5CFF',
  },
  checkText: {
    color: '#3A3A3C',
    fontSize: 14,
  },
  link: {
    color: '#7C5CFF',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#7C5CFF',
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  skipbtn: {
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 14,
  },
});