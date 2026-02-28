import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, FlatList, Image,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const categories = ['All', 'Apartment', 'House', 'Villa', 'Studio', 'Condo'];
const listingTypes = ['All', 'Rent', 'Sale'];

// ---- Property Card ----
const PropertyCard = ({ item, onPress }: { item: any, onPress: () => void }) => {
  const [saved, setSaved] = useState(false);

  return (
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

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => setSaved(!saved)}
      >
        <Ionicons
          name={saved ? 'bookmark' : 'bookmark-outline'}
          size={16}
          color={saved ? '#0d2b1f' : '#fff'}
        />
      </TouchableOpacity>

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={12} color="#888" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.priceText}>{item.price}</Text>
          <Text style={styles.perNight}>/month</Text>
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
};

// ---- Search Screen ----
export default function SearchScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeListingType, setActiveListingType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // ---- Fetch from Firebase ----
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAllProperties(data);
        setResults(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // ---- Filter Logic ----
  useEffect(() => {
    setIsSearching(true);
    const timeout = setTimeout(() => {
      let filtered = allProperties;

      if (search.trim()) {
        filtered = filtered.filter(
          (p) =>
            p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.location?.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (activeCategory !== 'All') {
        filtered = filtered.filter((p) => p.propertyType === activeCategory);
      }

      if (activeListingType !== 'All') {
        filtered = filtered.filter(
          (p) => p.listingType === activeListingType.toLowerCase()
        );
      }

      setResults(filtered);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, activeCategory, activeListingType, allProperties]);

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location, property..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color={showFilters ? '#fff' : '#0d2b1f'} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Property Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, activeCategory === cat && styles.activeChip]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.chipText, activeCategory === cat && styles.activeChipText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>Listing Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {listingTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, activeListingType === type && styles.activeChip]}
                onPress={() => setActiveListingType(type)}
              >
                <Text style={[styles.chipText, activeListingType === type && styles.activeChipText]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {isLoading ? 'Loading...' : `${results.length} ${results.length === 1 ? 'property' : 'properties'} found`}
        </Text>
        {(activeCategory !== 'All' || activeListingType !== 'All' || search) && (
          <TouchableOpacity onPress={() => {
            setSearch('');
            setActiveCategory('All');
            setActiveListingType('All');
          }}>
            <Text style={styles.clearFilters}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#0d2b1f" size="large" />
          <Text style={styles.loadingText}>Loading properties...</Text>
        </View>
      ) : isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#0d2b1f" size="small" />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="search-outline" size={40} color="#0d2b1f" />
          </View>
          <Text style={styles.emptyTitle}>No properties found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard
              item={item}
              onPress={() => router.push(`/property/${item.id}` as any)}
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
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d2b1f',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#e8f0ec',
    padding: 12,
    borderRadius: 14,
  },
  filterButtonActive: {
    backgroundColor: '#0d2b1f',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  chipsRow: {
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f9f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeChip: {
    backgroundColor: '#0d2b1f',
    borderColor: '#0d2b1f',
  },
  chipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  activeChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  clearFilters: {
    fontSize: 13,
    color: '#0d2b1f',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: {
    backgroundColor: '#e8f0ec',
    padding: 20,
    borderRadius: 50,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#aaa',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  listingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  listingBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  saveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 5,
  },
  cardInfo: {
    padding: 10,
    gap: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0d2b1f',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 11,
    color: '#888',
    flex: 1,
  },
  priceText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0d2b1f',
  },
  perNight: {
    fontSize: 10,
    color: '#888',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f0ec',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0d2b1f',
  },
});