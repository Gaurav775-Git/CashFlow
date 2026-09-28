import { useSmsListener } from 'expo-sms-listener';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ControlPanel from '../components/ControlPanel';
import TransactionHistory from '../components/TransactionHistory';
import { fetchInboxMessages, parseTransaction } from '../service/smsReader';

export default function Dashboard() {
  const [messages, setMessages] = useState([]);

  const loadMessages = useCallback(async () => {
    const data = await fetchInboxMessages();
    setMessages(data);
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // New SMS arriving while the app is open
  useSmsListener((msg) => {
    const tx = parseTransaction({
      _id: `${msg.originatingAddress}-${Date.now()}`,
      address: msg.originatingAddress,
      body: msg.body,
      date: Date.now(),
    });
    if (tx) setMessages((prev) => [tx, ...prev]);
  });

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.text}>Payment Messages</Text>
        <TransactionHistory messages={messages} />
      </ScrollView>
      <ControlPanel />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F7' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  text: { color: '#1C1C1E', fontSize: 20, fontWeight: '700', marginBottom: 16 },
});