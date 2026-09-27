import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TransactionHistory({ messages }) {
  if (!messages || messages.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No payment messages found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
      {messages.map((msg, index) => (
        <View
          key={msg.id || index}
          style={[styles.row, index === messages.length - 1 && styles.lastRow]}
        >
          <Text style={styles.sender}>{msg.sender}</Text>
          <Text style={styles.body} numberOfLines={2}>
            {msg.body}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  sender: {
    color: '#1C1C1E',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  body: {
    color: '#8E8E93',
    fontSize: 13,
    lineHeight: 18,
  },
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
  },
});