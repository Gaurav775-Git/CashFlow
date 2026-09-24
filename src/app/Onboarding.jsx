import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthCard from '../components/AuthCard';

function FloatingSticker({ source, style, delay = 0 }) {
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(offset, {
          toValue: -10,
          duration: 1800,
          delay,
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
  }, [offset, delay]);

  return (
    <Animated.Image
      source={source}
      style={[styles.sticker, style, { transform: [{ translateY: offset }] }]}
    />
  );
}

export default function Onboarding() {
  return (
    <SafeAreaView style={styles.screen}>
      {/* Background logo */}
      <Image
        source={require('../assets/logo.png')}
        style={styles.backgroundLogo}
        resizeMode="contain"
      />

      <View style={styles.content}>
        <FloatingSticker
          source={require('../assets/money.png')}
          style={styles.sticker1}
          delay={0}
        />
        <FloatingSticker
          source={require('../assets/dollor.png')}
          style={styles.sticker2}
          delay={200}
        />
        <FloatingSticker
          source={require('../assets/lock.png')}
          style={styles.sticker3}
          delay={400}
        />
        <FloatingSticker
          source={require('../assets/locker.png')}
          style={styles.sticker4}
          delay={600}
        />
        {/* <FloatingSticker
          source={require('../assets/moneyBag.png')}
          style={styles.sticker5}
          delay={800}
        /> */}
      </View>

      <AuthCard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  backgroundLogo: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    width: 300,
    height: 300,
    opacity: 0.2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sticker: {
    position: 'absolute',
    resizeMode: 'contain',
  },
  sticker1: {
    width: 130,
    height: 130,
    top: '10%',
    left: '8%',
  },
  sticker2: {
    width: 110,
    height: 110,
    top: '18%',
    right: '10%',
  },
  sticker3: {
    width: 120,
    height: 120,
    bottom: '22%',
    left: '6%',
  },
  sticker4: {
    width: 110,
    height: 110,
    bottom: '20%',
    right: '8%',
  },
  sticker5: {
    width: 80,
    height: 80,
    top: '44%',
    right: '38%',
  },
});