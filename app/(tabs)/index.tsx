import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { fetchProperties, fetchFeaturedProperties, Property } from '@/lib/properties';
import { saveProperty, unsaveProperty, isPropertySaved } from '@/lib/saved';

// ---- Greeting ----
const getGreeting = (name?: string) => {
  const hour = new Date().getHours();
  const firstName = name?.split(' ')[0] || '';
  let greeting = '';
  let emoji = '';
  if (hour >= 5 && hour < 12) { greeting = 'Good morning'; emoji = '☀️'; }
  else if (hour >= 12 && hour < 17) { greeting = 'Good afternoon'; emoji = '🌤️'; }
  else if (hour >= 17 && hour < 21) { greeting = 'Good evening'; emoji = '🌙'; }
  else { greeting = 'Good night'; emoji = '🌑'; }
  return firstName ? `${greeting}, ${firstName}! ${emoji}` : `${greeting}! ${emoji}`;
};

const categories = ['All', 'Apartment', 'House', 'Villa', 'Studio', 'Condo'];

// ---- Featured Card ----
/*
const FeaturedCard = ({ item }: { item: any }) => {
  const [saved, setSaved] = useState(false);
  const router =useRouter();
  return (
    <TouchableOpacity style={styles.featuredCard} onPress={() => router.push(`/property/${item.id}` as any)}>
      <Image source={{ uri: item.image }} style={styles.featuredImage} />
      <TouchableOpacity style={styles.saveButton} onPress={() => setSaved(!saved)}>
        <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? '#fff' : '#fff'} />
      </TouchableOpacity>
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={12} color="#aaa" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.priceText}>{item.price}</Text>
          <Text style={styles.perNight}>/night</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color="#f1c40f" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
*/
const FeaturedCard = ({ item }: { item: any }) => {
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      isPropertySaved(user.uid, item.id).then(setSaved);
    }
  }, [user, item.id]);

  const handleSave = async () => {
    if (!user) { router.push('/(auth)/login' as any); return; }
    if (saved) {
      await unsaveProperty(user.uid, item.id);
    } else {
      await saveProperty(user.uid, item.id);
    }
    setSaved(!saved);
  };

  return (
    <TouchableOpacity style={styles.featuredCard} onPress={() => router.push(`/property/${item.id}` as any)}>
      <Image source={{ uri: item.image }} style={styles.featuredImage} />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color="#fff" />
      </TouchableOpacity>
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={12} color="#aaa" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.priceText}>{item.price}</Text>
          <Text style={styles.perNight}>/night</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color="#f1c40f" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
//recent card
const RecentCard = ({ item }: { item: any }) => {
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      isPropertySaved(user.uid, item.id).then(setSaved);
    }
  }, [user, item.id]);

  const handleSave = async () => {
    if (!user) { router.push('/(auth)/login' as any); return; }
    if (saved) {
      await unsaveProperty(user.uid, item.id);
    } else {
      await saveProperty(user.uid, item.id);
    }
    setSaved(!saved);
  };

  return (
    <TouchableOpacity style={styles.recentCard} onPress={() => router.push(`/property/${item.id}` as any)}>
      <Image source={{ uri: item.image }} style={styles.recentImage} />
      <TouchableOpacity style={styles.saveButtonRecent} onPress={handleSave}>
        <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={16} color="#fff" />
      </TouchableOpacity>
      <View style={styles.recentInfo}>
        <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={11} color="#888" />
          <Text style={styles.locationTextDark}>{item.location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.priceTextDark}>{item.price}</Text>
          <Text style={styles.perNightDark}>/night</Text>
          <View style={styles.ratingBadgeDark}>
            <Ionicons name="star" size={11} color="#f1c40f" />
            <Text style={styles.ratingTextDark}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ---- Recent Card ----
/*
const RecentCard = ({ item }: { item: any }) => {
  const [saved, setSaved] = useState(false);
  const router =useRouter();
  return (
    <TouchableOpacity style={styles.recentCard} onPress={() => router.push(`/property/${item.id}` as any)}>
      <Image source={{ uri: item.image }} style={styles.recentImage} />
      <TouchableOpacity style={styles.saveButtonRecent} onPress={() => setSaved(!saved)}>
        <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={16} color="#fff" />
      </TouchableOpacity>
      <View style={styles.recentInfo}>
        <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={11} color="#aaa" />
          <Text style={styles.locationTextDark}>{item.location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.priceTextDark}>{item.price}</Text>
          <Text style={styles.perNightDark}>/night</Text>
          <View style={styles.ratingBadgeDark}>
            <Ionicons name="star" size={11} color="#f1c40f" />
            <Text style={styles.ratingTextDark}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
*/

// ---- Home Screen ----
export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showLandlordModal, setShowLandlordModal] = useState(false);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [recentListings, setRecentListings] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      const [featured, recent] = await Promise.all([
        fetchFeaturedProperties(),
        fetchProperties(),
      ]);
      setFeaturedProperties(featured);
      setRecentListings(recent);
      setIsLoading(false);
    };
    loadProperties();
  }, []);

  const handlePlusPress = () => {
    if (!user) { router.push('/(auth)/login'); return; }
    if (!userData?.isVerified) { setShowLandlordModal(true); return; }
    router.push('/add-property');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ---- STICKY HEADER ---- */}
<View style={styles.stickyHeader}>
  <View style={styles.logoRow}>
    <Image
      source={require('../../assets/images/makazi_yangu_green.jpeg')}
      style={styles.logo}
      resizeMode="contain"
    />
    <Text style={styles.logoText}>Makazi Yangu</Text>
  </View>
  <TouchableOpacity style={styles.notifButton}>
    <Ionicons name="notifications-outline" size={22} color="#fff" />
  </TouchableOpacity>
</View>

<ScrollView showsVerticalScrollIndicator={false}>

  {/* ---- GREETING CARD ---- */}
  <View style={styles.greetingCard}>
    <Text style={styles.greeting}>
      {getGreeting(user?.displayName || userData?.name)}
    </Text>
    <Text style={styles.subtitle}>Find your perfect home in Kenya</Text>
  </View>

  {/* ---- GREEN HERO SECTION ---- */}
  <View style={styles.heroSection}>
      
      

          <Text style={styles.greeting}>
            {getGreeting(user?.displayName || userData?.name)}
          </Text>
          <Text style={styles.subtitle}>Find your perfect home in Kenya</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#888" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location, property..."
              placeholderTextColor="#aaa"
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1.2K+</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>800+</Text>
              <Text style={styles.statLabel}>Landlords</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Areas</Text>
            </View>
          </View>
        </View>

        {/* ---- CATEGORIES ---- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, activeCategory === cat && styles.activeCategoryChip]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.activeCategoryText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0d2b1f" />
            <Text style={styles.loadingText}>Loading properties...</Text>
          </View>
        ) : (
          <>
            {/* ---- FEATURED ---- */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Featured</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {featuredProperties.length === 0 ? (
              <View style={styles.emptySection}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="home-outline" size={36} color="#0d2b1f" />
                </View>
                <Text style={styles.emptyTitle}>No featured properties yet</Text>
                <Text style={styles.emptyText}>Check back soon!</Text>
              </View>
            ) : (
              <FlatList
                data={featuredProperties}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <FeaturedCard item={item} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
                scrollEnabled
                nestedScrollEnabled
              />
            )}

            {/* ---- RECENT LISTINGS ---- */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Recent Listings</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {recentListings.length === 0 ? (
              <View style={styles.emptySection}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="home-outline" size={36} color="#0d2b1f" />
                </View>
                <Text style={styles.emptyTitle}>No listings yet</Text>
                <Text style={styles.emptyText}>Be the first to post a property!</Text>
                <TouchableOpacity
                  style={styles.postButton}
                  onPress={handlePlusPress}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={styles.postButtonText}>Post a Property</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.recentGrid}>
                {recentListings.map((item) => (
                  <RecentCard key={item.id} item={item} />
                ))}
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ---- FAB ---- */}
      <TouchableOpacity style={styles.fab} onPress={handlePlusPress}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* ---- LANDLORD MODAL ---- */}
      <Modal
        visible={showLandlordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLandlordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="home" size={36} color="#0d2b1f" />
            </View>
            <Text style={styles.modalTitle}>Become a Landlord</Text>
            <Text style={styles.modalSubtitle}>
              To list properties on Makazi Yangu, you need to register as a verified landlord or agent.
            </Text>
            <View style={styles.requirementsList}>
              {['National ID or Passport', 'Agent license (if applicable)', 'Valid phone number'].map((req) => (
                <View key={req} style={styles.requirementItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#0d2b1f" />
                  <Text style={styles.requirementText}>{req}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => { setShowLandlordModal(false); router.push('/(auth)/register-landlord'); }}
            >
              <Text style={styles.registerButtonText}>Register as Landlord</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowLandlordModal(false)}>
              <Text style={styles.cancelButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f5f2',
  },
  // Greeting Card (separate from hero)
  greetingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#0d2b1f',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d2b1f',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
  },

  // Hero Section (search + stats only now)
  heroSection: {
    backgroundColor: '#0d2b1f',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    marginTop: 16,
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 4,
  },

  // Sticky Header
  stickyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0d2b1f',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  notifButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 12,
  },


  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#0d2b1f',
    padding: 8,
    borderRadius: 10,
    marginLeft: 8,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // Categories
  categoriesContainer: {
    marginTop: 16,
    marginBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#d0e8d8',
    elevation: 1,
  },
  activeCategoryChip: {
    backgroundColor: '#0d2b1f',
    borderColor: '#0d2b1f',
  },
  categoryText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    backgroundColor: '#0d2b1f',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d2b1f',
  },
  seeAll: {
    fontSize: 13,
    color: '#0d2b1f',
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
  },

  // Empty State
  emptySection: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    backgroundColor: '#e8f0ec',
    padding: 20,
    borderRadius: 50,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d2b1f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 8,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Featured Card
  featuredCard: {
    width: 220,
    backgroundColor: '#1a3d2b',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  featuredImage: {
    width: '100%',
    height: 140,
  },
  saveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(13,43,31,0.7)',
    borderRadius: 20,
    padding: 6,
  },
  featuredInfo: {
    padding: 12,
    gap: 4,
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4caf7d',
  },
  perNight: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },

  // Recent Card
  recentGrid: {
    paddingHorizontal: 20,
    gap: 14,
    paddingBottom: 20,
  },
  recentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#0d2b1f',
  },
  recentImage: {
    width: 110,
    height: 100,
  },
  saveButtonRecent: {
    position: 'absolute',
    top: 8,
    left: 78,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    padding: 5,
  },
  recentInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d2b1f',
  },
  locationTextDark: {
    fontSize: 11,
    color: '#888',
  },
  priceTextDark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d2b1f',
  },
  perNightDark: {
    fontSize: 11,
    color: '#888',
    flex: 1,
  },
  ratingBadgeDark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f0ec',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  ratingTextDark: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0d2b1f',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    backgroundColor: '#0d2b1f',
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  modalIcon: {
    backgroundColor: '#e8f0ec',
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0d2b1f',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  requirementsList: {
    width: '100%',
    backgroundColor: '#f5f9f6',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 20,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirementText: {
    fontSize: 14,
    color: '#333',
  },
  registerButton: {
    backgroundColor: '#0d2b1f',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 14,
  },
});