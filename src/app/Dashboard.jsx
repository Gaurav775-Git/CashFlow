import { useSmsListener } from 'expo-sms-listener';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ControlPanel from '../components/ControlPanel';
import { fetchInboxMessages, parseTransaction } from '../service/smsReader';

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [lastScan, setLastScan] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(true);

  const loadMessages = useCallback(async () => {
    const data = await fetchInboxMessages();
    setMessages(data);
    setLastScan(new Date());
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useSmsListener((msg) => {
    const tx = parseTransaction({
      _id: `${msg.originatingAddress}-${Date.now()}`,
      address: msg.originatingAddress,
      body: msg.body,
      date: Date.now(),
    });
    if (tx) setMessages((prev) => [tx, ...prev]);
  });

  const handleRescan = () => {
    loadMessages();
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Expense</Text>
      </View>

      <View style={styles.panelWrap}>
        <ControlPanel
          permissionGranted={permissionGranted}
          lastScan={lastScan}
          count={messages.length}
          onRescan={handleRescan}
          onClear={handleClear}
          messages={messages}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingBottom: 20,
  },
  headerText: {
    color: '#1C1C1E',
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 0.3,
    paddingBottom: 60
  },
  panelWrap: {
    flex: 1,
    paddingHorizontal: 10,
  },
});