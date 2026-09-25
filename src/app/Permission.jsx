import { useRouter } from 'expo-router';
import { requestSmsPermissionAsync, startSmsListenerServiceAsync, useSmsListener } from 'expo-sms-listener';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Permission() {
  const router = useRouter();
  const [status, setStatus] = useState('idle');
  const offset = useRef(new Animated.Value(0)).current;

  // Hook into the SMS stream
  useSmsListener((msg) => {
    console.log('Sender:', msg.originatingAddress);
    console.log('Body:', msg.body);
  });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(offset, {
          toValue: -12,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(offset, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [offset]);

  const handleGrant = async () => {
    const { granted } = await requestSmsPermissionAsync();
    if (granted) {
      await startSmsListenerServiceAsync();
      router.replace('/dashboard');
    } else {
      setStatus('denied');
    }
  };

  const handleNotNow = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Animated.Image
          source={require('../assets/sheild.png')}
          style={[styles.heroImage, { transform: [{ translateY: offset }] }]}
          resizeMode="contain"
        />

        <Text style={styles.title}>Read your messages</Text>
        <Text style={styles.body}>
          CashFlow reads your bank SMS to track spending automatically.
          Everything stays on your device. Nothing is uploaded.
        </Text>

        {status === 'denied' && (
          <Text style={styles.error}>
            Permission denied. Tap Grant to try again.
          </Text>
        )}
      </View>

      <View style={styles.bottom}>
        <Pressable style={styles.button} onPress={handleGrant}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </Pressable>
        <Pressable onPress={handleNotNow}>
          <Text style={styles.skipbtn}>Not now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F7' },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  heroImage: { width: 220, height: 220, marginBottom: 20 },
  title: { color: '#1C1C1E', fontSize: 26, fontWeight: '700', textAlign: 'center' },
  body: {
    color: '#3A3A3C',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  error: { color: '#FF3B30', fontSize: 13, textAlign: 'center', marginTop: 8 },
  bottom: { paddingHorizontal: 24, paddingBottom: 24, gap: 8 },
  button: {
    backgroundColor: '#7C5CFF',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  skipbtn: { color: '#8E8E93', textAlign: 'center', paddingVertical: 10, fontSize: 14 },
});