import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert, Linking, Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { saveProperty, unsaveProperty, isPropertySaved } from '@/lib/saved';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const docRef = doc(db, 'properties', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProperty({ id: docSnap.id, ...docSnap.data() });
        } else {
          Alert.alert('Error', 'Property not found');
          router.back();
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load property');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (user && property) {
      isPropertySaved(user.uid, property.id).then(setSaved);
    }
  }, [user, property]);

  const handleSave = async () => {
    if (!user) { router.push('/(auth)/login' as any); return; }
    if (saved) {
      await unsaveProperty(user.uid, property.id);
    } else {
      await saveProperty(user.uid, property.id);
    }
    setSaved(!saved);
  };

  const handleCall = () => {
    if (!property?.agentPhone) {
      Alert.alert('No phone number', 'Agent has not provided a phone number');
      return;
    }
    Linking.openURL(`tel:${property.agentPhone}`);
  };

  const handleWhatsApp = () => {
    if (!property?.agentPhone) {
      Alert.alert('No phone number', 'Agent has not provided a phone number');
      return;
    }
    const message = `Hi, I'm interested in your property: ${property.title} listed on Makazi Yangu.`;
    Linking.openURL(`https://wa.me/${property.agentPhone}?text=${encodeURIComponent(message)}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this property on Makazi Yangu!\n\n${property.title}\n📍 ${property.location}\n💰 ${property.price}\n\nDownload Makazi Yangu to see more!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d2b1f" />
        <Text style={styles.loadingText}>Loading property...</Text>
      </SafeAreaView>
    );
  }

  if (!property) return null;

  const photos = property.photos?.length > 0 ? property.photos : [property.image];
  const amenities = property.amenities || [];

  return (
    <SafeAreaView style={styles.container}>

      {/* ---- FLOATING HEADER ---- */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0d2b1f" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color="#0d2b1f" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={saved ? '#0d2b1f' : '#0d2b1f'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ---- PHOTO GALLERY ---- */}
        <View style={styles.photoContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActivePhoto(index);
            }}
          >
            {photos.map((uri: string, index: number) => (
              <Image
                key={index}
                source={{ uri }}
                style={styles.photo}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Photo Dots */}
          {photos.length > 1 && (
            <View style={styles.photoDots}>
              {photos.map((_: any, index: number) => (
                <View
                  key={index}
                  style={[styles.dot, activePhoto === index && styles.activeDot]}
                />
              ))}
            </View>
          )}

          {/* Photo Count */}
          <View style={styles.photoCount}>
            <Ionicons name="images-outline" size={14} color="#fff" />
            <Text style={styles.photoCountText}>{activePhoto + 1}/{photos.length}</Text>
          </View>

          {/* Listing Type Badge */}
          <View style={[
            styles.listingBadge,
            { backgroundColor: property.listingType === 'rent' ? '#0d2b1f' : '#e67e22' }
          ]}>
            <Text style={styles.listingBadgeText}>
              {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
            </Text>
          </View>
        </View>

        {/* ---- CONTENT ---- */}
        <View style={styles.content}>

          {/* Title + Price */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{property.title}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{property.price}</Text>
              {property.listingType === 'rent' && (
                <Text style={styles.perMonth}>/month</Text>
              )}
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#0d2b1f" />
            <Text style={styles.location}>{property.location}</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {property.bedrooms && (
              <View style={styles.statItem}>
                <Ionicons name="bed-outline" size={20} color="#0d2b1f" />
                <Text style={styles.statValue}>{property.bedrooms}</Text>
                <Text style={styles.statLabel}>Beds</Text>
              </View>
            )}
            {property.bathrooms && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="water-outline" size={20} color="#0d2b1f" />
                  <Text style={styles.statValue}>{property.bathrooms}</Text>
                  <Text style={styles.statLabel}>Baths</Text>
                </View>
              </>
            )}
            {property.propertyType && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="business-outline" size={20} color="#0d2b1f" />
                  <Text style={styles.statValue}>{property.propertyType}</Text>
                  <Text style={styles.statLabel}>Type</Text>
                </View>
              </>
            )}
            {property.rating > 0 && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="star" size={20} color="#f1c40f" />
                  <Text style={styles.statValue}>{property.rating}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              </>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          {/* Amenities */}
          {amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {amenities.map((amenity: string) => (
                  <View key={amenity} style={styles.amenityItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#0d2b1f" />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Agent Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listed By</Text>
            <View style={styles.agentCard}>
              <Image
                source={{
                  uri: property.agentAvatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(property.agentName || 'Agent')}&background=0d2b1f&color=fff`
                }}
                style={styles.agentAvatar}
              />
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{property.agentName || 'Agent'}</Text>
                <View style={styles.agentBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#0d2b1f" />
                  <Text style={styles.agentBadgeText}>Verified Landlord</Text>
                </View>
                {property.agentPhone && (
                  <Text style={styles.agentPhone}>{property.agentPhone}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ---- BOTTOM ACTION BUTTONS ---- */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
          <Ionicons name="logo-whatsapp" size={22} color="#fff" />
          <Text style={styles.whatsappButtonText}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.callButton} onPress={handleCall}>
          <Ionicons name="call" size={22} color="#fff" />
          <Text style={styles.callButtonText}>Call Agent</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingText: { fontSize: 14, color: '#888' },
  floatingHeader: {
    position: 'absolute', top: 50, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16,
    zIndex: 100,
  },
  headerButton: {
    backgroundColor: '#fff',
    padding: 8, borderRadius: 20,
    elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6,
  },
  headerRight: { flexDirection: 'row', gap: 8 },
  photoContainer: { position: 'relative' },
  photo: { width, height: 300 },
  photoDots: {
    position: 'absolute', bottom: 16,
    left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: { backgroundColor: '#fff', width: 18 },
  photoCount: {
    position: 'absolute', bottom: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  photoCountText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  listingBadge: {
    position: 'absolute', top: 16, left: 16,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  listingBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    marginTop: -20, padding: 24,
  },
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 8, gap: 12,
  },
  title: {
    flex: 1, fontSize: 20, fontWeight: 'bold',
    color: '#0d2b1f', lineHeight: 28,
  },
  priceContainer: { alignItems: 'flex-end' },
  price: { fontSize: 20, fontWeight: 'bold', color: '#0d2b1f' },
  perMonth: { fontSize: 12, color: '#888' },
  locationRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 4, marginBottom: 20,
  },
  location: { fontSize: 14, color: '#666' },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#f5f9f6',
    borderRadius: 16, padding: 16, marginBottom: 20,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 15, fontWeight: 'bold', color: '#0d2b1f' },
  statLabel: { fontSize: 11, color: '#888' },
  statDivider: { width: 1, backgroundColor: '#e0e0e0' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 17, fontWeight: 'bold',
    color: '#0d2b1f', marginBottom: 12,
  },
  description: { fontSize: 14, color: '#555', lineHeight: 22 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f5f9f6', paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  amenityText: { fontSize: 13, color: '#333', fontWeight: '500' },
  agentCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#f5f9f6', borderRadius: 16, padding: 16,
  },
  agentAvatar: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 2, borderColor: '#0d2b1f',
  },
  agentInfo: { flex: 1, gap: 4 },
  agentName: { fontSize: 16, fontWeight: 'bold', color: '#0d2b1f' },
  agentBadge: {
    flexDirection: 'row', alignItems: 'center',
    gap: 4, alignSelf: 'flex-start',
  },
  agentBadgeText: { fontSize: 12, color: '#0d2b1f', fontWeight: '500' },
  agentPhone: { fontSize: 13, color: '#888' },
  bottomActions: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 24, paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  whatsappButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    backgroundColor: '#25D366', paddingVertical: 14, borderRadius: 14,
  },
  whatsappButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  callButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    backgroundColor: '#0d2b1f', paddingVertical: 14, borderRadius: 14,
  },
  callButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});