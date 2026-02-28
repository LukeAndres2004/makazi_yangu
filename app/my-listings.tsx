import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { fetchMyProperties, deleteProperty, Property } from '@/lib/properties';

// ---- Listing Card ----
const ListingCard = ({ item, onEdit, onDelete }: {
  item: Property;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <View style={styles.card}>
    <Image source={{ uri: item.image }} style={styles.cardImage} />

    <View style={[
      styles.listingBadge,
      { backgroundColor: item.listingType === 'rent' ? '#0d2b1f' : '#e67e22' }
    ]}>
      <Text style={styles.listingBadgeText}>
        {item.listingType === 'rent' ? 'For Rent' : 'For Sale'}
      </Text>
    </View>

    <View style={styles.cardBody}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={12} color="#888" />
          <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.priceText}>{item.price}</Text>
          {item.listingType === 'rent' && <Text style={styles.perMonth}>/month</Text>}
        </View>
        <View style={styles.statsRow}>
          {item.bedrooms > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="bed-outline" size={13} color="#888" />
              <Text style={styles.statText}>{item.bedrooms} beds</Text>
            </View>
          )}
          {item.bathrooms > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="water-outline" size={13} color="#888" />
              <Text style={styles.statText}>{item.bathrooms} baths</Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Ionicons name="pencil-outline" size={16} color="#0d2b1f" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={16} color="#e74c3c" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ---- My Listings Screen ----
export default function MyListingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [listings, setListings] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reload on focus
  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [user])
  );

  const loadListings = async () => {
    if (!user) return;
    setIsLoading(true);
    const data = await fetchMyProperties(user.uid);
    setListings(data);
    setIsLoading(false);
  };

  const handleDelete = (item: Property) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${item.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteProperty(item.id);
            if (success) {
              setListings((prev) => prev.filter((p) => p.id !== item.id));
              Alert.alert('Deleted', 'Your listing has been removed.');
            } else {
              Alert.alert('Error', 'Failed to delete listing. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0d2b1f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-property' as any)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d2b1f" />
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="home-outline" size={40} color="#0d2b1f" />
          </View>
          <Text style={styles.emptyTitle}>No listings yet</Text>
          <Text style={styles.emptySubtitle}>Tap the + button to post your first property</Text>
          <TouchableOpacity
            style={styles.postButton}
            onPress={() => router.push('/add-property' as any)}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.postButtonText}>Post a Property</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListingCard
              item={item}
              onEdit={() => router.push(`/edit-property/${item.id}` as any)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0d2b1f' },
  addButton: {
    backgroundColor: '#0d2b1f', padding: 8,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingText: { fontSize: 14, color: '#888' },
  emptyContainer: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', gap: 8, paddingHorizontal: 40,
  },
  emptyIcon: {
    backgroundColor: '#e8f0ec', padding: 20,
    borderRadius: 50, marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  emptySubtitle: { fontSize: 14, color: '#aaa', textAlign: 'center' },
  postButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0d2b1f', paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: 14, marginTop: 8,
  },
  postButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  listContent: { padding: 20, gap: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    overflow: 'hidden', elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
  },
  cardImage: { width: '100%', height: 160 },
  listingBadge: {
    position: 'absolute', top: 12, left: 12,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  listingBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardBody: { padding: 14 },
  cardInfo: { marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0d2b1f', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  locationText: { fontSize: 12, color: '#888', flex: 1 },
  priceText: { fontSize: 15, fontWeight: 'bold', color: '#0d2b1f' },
  perMonth: { fontSize: 11, color: '#888' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: '#888' },
  actionButtons: { flexDirection: 'row', gap: 10 },
  editButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    backgroundColor: '#e8f0ec', paddingVertical: 10,
    borderRadius: 12, borderWidth: 1, borderColor: '#d0e8d8',
  },
  editButtonText: { fontSize: 14, fontWeight: '600', color: '#0d2b1f' },
  deleteButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    backgroundColor: '#fef0f0', paddingVertical: 10,
    borderRadius: 12, borderWidth: 1, borderColor: '#fad0d0',
  },
  deleteButtonText: { fontSize: 14, fontWeight: '600', color: '#e74c3c' },
});