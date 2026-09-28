import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestReadSms } from '../service/smsReader';

export default function Permission() {
  const router = useRouter();
  const [status, setStatus] = useState('idle'); // idle | loading | denied | error
  const offset = useRef(new Animated.Value(0)).current;

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
    if (status === 'loading') return;

    if (Platform.OS !== 'android') {
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      // 1. Permission to read existing inbox messages
      const canRead = await requestReadSms();
      if (!canRead) {
        setStatus('denied');
        return;
      }

      // 2. Live listener for new SMS (loaded lazily so a missing native
      //    module can't crash this screen)
      try {
        const sms = require('expo-sms-listener');
        const { granted } = await sms.requestSmsPermissionAsync();
        if (granted) await sms.startSmsListenerServiceAsync();
      } catch (e) {
        console.warn('SMS listener unavailable:', e);
      }

      router.replace('/Dashboard');
    } catch (e) {
      console.warn('Permission error:', e);
      setStatus('error');
    }
  };

  const handleNotNow = () => {
    router.replace('/Dashboard');
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
        {status === 'error' && (
          <Text style={styles.error}>
            Something went wrong. SMS access works on Android only.
          </Text>
        )}
      </View>

      <View style={styles.bottom}>
        <Pressable
          style={[styles.button, status === 'loading' && { opacity: 0.7 }]}
          onPress={handleGrant}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Grant permission</Text>
          )}
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