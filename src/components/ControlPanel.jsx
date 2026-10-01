import { StyleSheet, Text, View } from 'react-native';
import TransactionHistory from './TransactionHistory';

export default function ControlPanel({ messages, income, savings, budget }) {
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
    backgroundColor: '#FFFFFF',
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
  subtitle: {
    color: '#1C1C1E',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
  },
  listWrap: { flex: 1, marginTop: 4 },
});