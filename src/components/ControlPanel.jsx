import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ControlPanel() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Control Panel</Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>SMS Permission</Text>
        <Text style={styles.rowValue}>Granted</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Last Scan</Text>
        <Text style={styles.rowValue}>2 min ago</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Transactions Found</Text>
        <Text style={styles.rowValue}>47</Text>
      </View>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Rescan Messages</Text>
      </Pressable>

      <Pressable>
        <Text style={styles.dangerText}>Clear All Data</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    height:'78%',
    gap: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  title: {
    color: '#1C1C1E',
    fontSize: 16,
    fontWeight: '600',
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
});