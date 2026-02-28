import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function TestScreen() {
  const [status, setStatus] = useState('Testing connection...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocs(collection(db, 'test'));
        setStatus('✅ Firebase connected successfully!');
      } catch (error) {
        setStatus('❌ Connection failed: ' + error);
      }
    };
    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#0d2b1f',
    fontWeight: '600',
  },
});
