import { Pressable, StyleSheet, Text, View } from 'react-native';
import TransactionHistory from './TransactionHistory';

export default function ControlPanel({
  permissionGranted,
  lastScan,
  count,
  onRescan,
  onClear,
  messages,
  income,
  savings,
  budget,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={styles.statValue}>
            ₹{Number(income || 0).toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Budget</Text>
          <Text style={styles.statValue}>
            {budget > 0
              ? `₹${Number(budget).toLocaleString('en-IN')}`
              : '—'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Savings</Text>
          <Text style={styles.statValue}>
            ₹{Number(savings || 0).toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#ffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 1,
  },
  stat: { alignItems: 'center', flex: 1 },
  statLabel: {
    color: '#1C1C1E',
    fontSize: 11,
    letterSpacing: 1,
    opacity: 0.65,
    marginBottom: 4,
  },
  statValue: {
    color: '#1C1C1E',
    fontSize: 15,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E0E0E4',
  },
  title: {
    color: '#1C1C1E',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
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
  rowLabel: { color: '#1C1C1E', fontSize: 14 },
  rowValue: { color: '#8E8E93', fontSize: 14, fontWeight: '500' },
  actions: { gap: 4 },
  button: {
    backgroundColor: '#7C5CFF',
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  dangerText: {
    color: '#FF3B30',
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  listWrap: { flex: 1, marginTop: 4 },
});