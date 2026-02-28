import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { getSavedPropertyIds, unsaveProperty } from '@/lib/saved';

// ---- Saved Card ----
const SavedCard = ({ item, onUnsave, onPress }: {
  item: any;
  onUnsave: () => void;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={{ uri: item.image }} style={styles.cardImage} />

    <View style={[
      styles.listingBadge,
      { backgroundColor: item.listingType === 'rent' ? '#0d2b1f' : '#e67e22' }
    ]}>
      <Text style={styles.listingBadgeText}>
        {item.listingType === 'rent' ? 'For Rent' : 'For Sale'}
      </Text>
    </View>

    <TouchableOpacity style={styles.unsaveButton} onPress={onUnsave}>
      <Ionicons name="bookmark" size={18} color="#0d2b1f" />
    </TouchableOpacity>

    <View style={styles.cardInfo}>
      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
      <View style={styles.row}>
        <Ionicons name="location-outline" size={12} color="#888" />
        <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.priceText}>{item.price}</Text>
        {item.listingType === 'rent' && <Text style={styles.perMonth}>/month</Text>}
        {item.rating > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color="#0d2b1f" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export default function SavedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ---- Fetch saved properties ----
  const loadSaved = async () => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const savedIds = await getSavedPropertyIds(user.uid);
      if (savedIds.length === 0) {
        setSavedProperties([]);
        setIsLoading(false);
        return;
      }

      // Fetch properties in batches of 10 (Firestore limit)
      const batches = [];
      for (let i = 0; i < savedIds.length; i += 10) {
        const batch = savedIds.slice(i, i + 10);
        const q = query(
          collection(db, 'properties'),
          where(documentId(), 'in', batch)
        );
        batches.push(getDocs(q));
      }

      const snapshots = await Promise.all(batches);
      const properties: any[] = [];
      snapshots.forEach((snapshot) => {
        snapshot.docs.forEach((doc) => {
          properties.push({ id: doc.id, ...doc.data() });
        });
      });

      setSavedProperties(properties);
    } catch (error) {
      console.error('Error loading saved properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSaved();
    }, [user])
  );

  // ---- Unsave a property ----
  const handleUnsave = async (propertyId: string) => {
    if (!user) return;
    await unsaveProperty(user.uid, propertyId);
    setSavedProperties((prev) => prev.filter((p) => p.id !== propertyId));
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bookmark-outline" size={40} color="#0d2b1f" />
          </View>
          <Text style={styles.emptyTitle}>Sign in to save properties</Text>
          <Text style={styles.emptySubtitle}>Create an account to bookmark your favourite listings</Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/login' as any)}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved</Text>
        {savedProperties.length > 0 && (
          <Text style={styles.headerCount}>{savedProperties.length} saved</Text>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d2b1f" />
          <Text style={styles.loadingText}>Loading saved properties...</Text>
        </View>
      ) : savedProperties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bookmark-outline" size={40} color="#0d2b1f" />
          </View>
          <Text style={styles.emptyTitle}>No saved properties</Text>
          <Text style={styles.emptySubtitle}>Tap the bookmark icon on any property to save it here</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/search' as any)}
          >
            <Ionicons name="search-outline" size={18} color="#fff" />
            <Text style={styles.browseButtonText}>Browse Properties</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedProperties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SavedCard
              item={item}
              onPress={() => router.push(`/property/${item.id}` as any)}
              onUnsave={() => handleUnsave(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0d2b1f' },
  headerCount: { fontSize: 14, color: '#888', fontWeight: '500' },
  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingText: { fontSize: 14, color: '#888' },
  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingHorizontal: 40,
  },
  emptyIcon: {
    backgroundColor: '#e8f0ec', padding: 20,
    borderRadius: 50, marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', lineHeight: 20 },
  signInButton: {
    backgroundColor: '#0d2b1f', paddingHorizontal: 32,
    paddingVertical: 12, borderRadius: 14, marginTop: 8,
  },
  signInButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  browseButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0d2b1f', paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: 14, marginTop: 8,
  },
  browseButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  columnWrapper: { gap: 12, marginBottom: 12 },
  card: {
    flex: 1, backgroundColor: '#fff',
    borderRadius: 14, overflow: 'hidden',
    elevation: 3, shadowColor: '#000',
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  cardImage: { width: '100%', height: 120 },
  listingBadge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  listingBadgeText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  unsaveButton: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#fff', borderRadius: 20, padding: 5,
    elevation: 2,
  },
  cardInfo: { padding: 10, gap: 4 },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#0d2b1f' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { fontSize: 11, color: '#888', flex: 1 },
  priceText: { fontSize: 13, fontWeight: 'bold', color: '#0d2b1f' },
  perMonth: { fontSize: 10, color: '#888', flex: 1 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e8f0ec',
    paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: 8, gap: 2,
  },
  ratingText: { fontSize: 10, fontWeight: '600', color: '#0d2b1f' },
});