import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ControlPanel from '../components/ControlPanel';

export default function Dashboard() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.text}>Hello User</Text>
      </View>
      <ControlPanel />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});