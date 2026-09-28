import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function TransactionHistory({ messages }) {
  if (!messages || messages.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No payment messages found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={messages}
      keyExtractor={(item, i) => item.id || String(i)}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => {
        const isDebit = item.type === 'debit';
        return (
          <View style={[styles.row, index === messages.length - 1 && styles.lastRow]}>
            <View style={styles.top}>
              <Text style={styles.sender} numberOfLines={1}>
                {item.merchant || item.sender}
              </Text>
              <Text style={[styles.amount, { color: isDebit ? '#FF3B30' : '#34C759' }]}>
                {isDebit ? '-' : '+'}₹{item.amount.toLocaleString('en-IN')}
              </Text>
            </View>
            <Text style={styles.body} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={styles.date}>
              {new Date(item.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  lastRow: { borderBottomWidth: 0 },
  top: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sender: { color: '#1C1C1E', fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  amount: { fontSize: 14, fontWeight: '700' },
  body: { color: '#8E8E93', fontSize: 13, lineHeight: 18 },
  date: { color: '#C7C7CC', fontSize: 11, marginTop: 4 },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: '#8E8E93', fontSize: 14 },
});