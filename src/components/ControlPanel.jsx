import { Pressable, StyleSheet, Text, View } from 'react-native';
import TransactionHistory from './TransactionHistory';

export default function ControlPanel({
  permissionGranted,
  lastScan,
  count,
  onRescan,
  onClear,
  messages,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Control Panel</Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>SMS Permission</Text>
        <Text style={styles.rowValue}>
          {permissionGranted ? 'Granted' : 'Not granted'}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Last Scan</Text>
        <Text style={styles.rowValue}>
          {lastScan ? lastScan.toLocaleTimeString() : '—'}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Transactions Found</Text>
        <Text style={styles.rowValue}>{count}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={onRescan}>
          <Text style={styles.buttonText}>Rescan Messages</Text>
        </Pressable>
        <Pressable onPress={onClear}>
          <Text style={styles.dangerText}>Clear All Data</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>Payment Messages</Text>
      <View style={styles.listWrap}>
        <TransactionHistory messages={messages} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  title: {
    color: '#1C1C1E',
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: '#1C1C1E',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    color: '#3A3A3C',
    fontSize: 14,
  },
  rowValue: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    gap: 4,
  },
  button: {
    backgroundColor: '#7C5CFF',
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  dangerText: {
    color: '#FF3B30',
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  listWrap: {
    flex: 1,
    marginTop: 4,
  },
});