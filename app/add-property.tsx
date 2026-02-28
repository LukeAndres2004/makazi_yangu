import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Image, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRef } from 'react';

// ---- Step Indicator ----
const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <View style={styles.stepIndicator}>
    {[1, 2, 3].map((step) => (
      <View key={step} style={styles.stepRow}>
        <View style={[styles.stepCircle, currentStep >= step && styles.stepCircleActive]}>
          {currentStep > step ? (
            <Ionicons name="checkmark" size={14} color="#fff" />
          ) : (
            <Text style={[styles.stepNumber, currentStep >= step && styles.stepNumberActive]}>{step}</Text>
          )}
        </View>
        {step < 3 && (
          <View style={[styles.stepLine, currentStep > step && styles.stepLineActive]} />
        )}
      </View>
    ))}
  </View>
);

// ---- Camera Modal ----
const CameraModal = ({
  visible, onClose, onCapture,
}: {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        onCapture(photo.uri);
        onClose();
      }
    }
  };

  if (!permission?.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={styles.cameraContainer}>
          <Text style={styles.cameraPermText}>Camera permission required</Text>
          <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
            <Text style={styles.permButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: '#fff' }}>Cancel</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} flash={flash}>
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraTopControls}>
              <TouchableOpacity style={styles.cameraControlButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.cameraTitleText}>Take Photo</Text>
              <TouchableOpacity
                style={styles.cameraControlButton}
                onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
              >
                <Ionicons
                  name={flash === 'on' ? 'flash' : 'flash-off'}
                  size={24}
                  color={flash === 'on' ? '#f1c40f' : '#fff'}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.cameraBottomControls}>
              <View style={{ width: 50 }} />
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              <View style={{ width: 50 }} />
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
};

// ---- Property Types ----
const propertyTypes = ['Apartment', 'House', 'Villa', 'Studio', 'Condo', 'Townhouse'];
const listingTypes = ['Rent', 'Sale'];

// ---- Main Screen ----
export default function AddPropertyScreen() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);

  // Step 1 — Basic Info
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [listingType, setListingType] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');

  // Step 2 — Description
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);

  // Step 3 — Photos
  const [photos, setPhotos] = useState<string[]>([]);

  const amenityOptions = [
    'WiFi', 'Parking', 'Security', 'Water',
    'Generator', 'Swimming Pool', 'Gym', 'CCTV',
    'Garden', 'Balcony', 'Furnished', 'Air Conditioning',
  ];

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // ---- Pick from gallery ----
  const pickFromGallery = async () => {
    if (photos.length >= 5) {
      Alert.alert('Limit reached', 'You can only add up to 5 photos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - photos.length,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris].slice(0, 5));
    }
  };

  // ---- Take photo ----
  const handleCameraCapture = (uri: string) => {
    if (photos.length >= 5) {
      Alert.alert('Limit reached', 'You can only add up to 5 photos');
      return;
    }
    setPhotos((prev) => [...prev, uri]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how to add a photo',
      [
        { text: 'Take Photo', onPress: () => setCameraVisible(true) },
        { text: 'Pick from Gallery', onPress: pickFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // ---- Counter ----
  const Counter = ({ value, onChange, min = 1, max = 20 }: {
    value: string; onChange: (v: string) => void; min?: number; max?: number;
  }) => (
    <View style={styles.counter}>
      <TouchableOpacity
        style={styles.counterButton}
        onPress={() => onChange(String(Math.max(min, parseInt(value) - 1)))}
      >
        <Ionicons name="remove" size={18} color="#0d2b1f" />
      </TouchableOpacity>
      <Text style={styles.counterValue}>{value}</Text>
      <TouchableOpacity
        style={styles.counterButton}
        onPress={() => onChange(String(Math.min(max, parseInt(value) + 1)))}
      >
        <Ionicons name="add" size={18} color="#0d2b1f" />
      </TouchableOpacity>
    </View>
  );

  // ---- Validations ----
  const validateStep1 = () => {
    if (!title || !propertyType || !listingType || !price || !location) {
      Alert.alert('Missing Info', 'Please fill in all required fields');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!description) {
      Alert.alert('Missing Description', 'Please add a description for your property');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (photos.length === 0) {
      Alert.alert('No Photos', 'Please add at least one photo of your property');
      return false;
    }
    return true;
  };

  // ---- Submit ----
  const handleSubmit = async () => {
    if (!validateStep3()) return;
    if (!user) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'properties'), {
        title,
        propertyType,
        listingType: listingType.toLowerCase(),
        price: `KSh ${price}`,
        location,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        description,
        amenities,
        image: photos[0],
        photos,
        rating: 0,
        agentId: user.uid,
        agentName: userData?.name || user.displayName || 'Unknown',
        agentPhone: userData?.phone || '',
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        '🎉 Property Listed!',
        'Your property has been successfully listed on Makazi Yangu.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );

    } catch (error: any) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = ['Basic Information', 'Property Details', 'Photos'];
  const stepSubtitles = ['Tell us about your property', 'Describe your property', 'Show off your property'];

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0d2b1f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Property</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Step Title */}
      <View style={styles.stepTitleContainer}>
        <Text style={styles.stepTitle}>{stepTitles[currentStep - 1]}</Text>
        <Text style={styles.stepSubtitle}>{stepSubtitles[currentStep - 1]}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>

        {/* ---- STEP 1 — Basic Info ---- */}
        {currentStep === 1 && (
          <View style={styles.form}>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Property Title <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Ionicons name="home-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Modern 2BR Apartment in Westlands"
                  placeholderTextColor="#aaa"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* Property Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Property Type <Text style={styles.required}>*</Text></Text>
              <View style={styles.chipsWrap}>
                {propertyTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, propertyType === type && styles.activeChip]}
                    onPress={() => setPropertyType(type)}
                  >
                    <Text style={[styles.chipText, propertyType === type && styles.activeChipText]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Listing Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Listing Type <Text style={styles.required}>*</Text></Text>
              <View style={styles.row}>
                {listingTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.listingTypeButton, listingType === type && styles.activeListingType]}
                    onPress={() => setListingType(type)}
                  >
                    <Ionicons
                      name={type === 'Rent' ? 'key-outline' : 'pricetag-outline'}
                      size={20}
                      color={listingType === type ? '#fff' : '#0d2b1f'}
                    />
                    <Text style={[styles.listingTypeText, listingType === type && styles.activeListingTypeText]}>
                      For {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Price (KSh) <Text style={styles.required}>*</Text>
                <Text style={styles.labelHint}> {listingType === 'Rent' ? '— per month' : '— total price'}</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencyLabel}>KSh</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 35000"
                  placeholderTextColor="#aaa"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Westlands, Nairobi"
                  placeholderTextColor="#aaa"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

            {/* Bedrooms & Bathrooms */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Bedrooms</Text>
                <Counter value={bedrooms} onChange={setBedrooms} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Bathrooms</Text>
                <Counter value={bathrooms} onChange={setBathrooms} />
              </View>
            </View>

          </View>
        )}

        {/* ---- STEP 2 — Description + Amenities ---- */}
        {currentStep === 2 && (
          <View style={styles.form}>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputContainer, { alignItems: 'flex-start', paddingTop: 12 }]}>
                <TextInput
                  style={[styles.input, { height: 150, textAlignVertical: 'top' }]}
                  placeholder="Describe your property — location highlights, nearby amenities, special features..."
                  placeholderTextColor="#aaa"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  maxLength={500}
                />
              </View>
              <Text style={styles.charCount}>{description.length}/500</Text>
            </View>

            {/* Amenities */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amenities</Text>
              <Text style={styles.labelSubtext}>Select all that apply</Text>
              <View style={styles.chipsWrap}>
                {amenityOptions.map((amenity) => (
                  <TouchableOpacity
                    key={amenity}
                    style={[styles.chip, amenities.includes(amenity) && styles.activeChip]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <Text style={[styles.chipText, amenities.includes(amenity) && styles.activeChipText]}>
                      {amenity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </View>
        )}

        {/* ---- STEP 3 — Photos ---- */}
        {currentStep === 3 && (
          <View style={styles.form}>

            <Text style={styles.documentNote}>
              📸 Add up to 5 photos of your property. First photo will be the cover image.
            </Text>

            {/* Photo Grid */}
            <View style={styles.photoGrid}>
              {photos.map((uri, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri }} style={styles.photoImage} />
                  {index === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverBadgeText}>Cover</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close-circle" size={22} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add Photo Button */}
              {photos.length < 5 && (
                <TouchableOpacity style={styles.addPhotoButton} onPress={showPhotoOptions}>
                  <Ionicons name="add" size={32} color="#0d2b1f" />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                  <Text style={styles.addPhotoCount}>{photos.length}/5</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Summary */}
            {photos.length > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Listing Summary</Text>
                {[
                  { icon: 'home-outline', text: title },
                  { icon: 'business-outline', text: `${propertyType} — For ${listingType}` },
                  { icon: 'location-outline', text: location },
                  { icon: 'cash-outline', text: `KSh ${price}${listingType === 'Rent' ? '/month' : ''}` },
                  { icon: 'bed-outline', text: `${bedrooms} Bedrooms, ${bathrooms} Bathrooms` },
                  { icon: 'images-outline', text: `${photos.length} photo${photos.length > 1 ? 's' : ''} added` },
                ].map((item, i) => (
                  <View key={i} style={styles.summaryRow}>
                    <Ionicons name={item.icon as any} size={16} color="#888" />
                    <Text style={styles.summaryText}>{item.text}</Text>
                  </View>
                ))}
              </View>
            )}

          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomButton}>
        {currentStep < 3 ? (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => {
              if (currentStep === 1 && validateStep1()) setCurrentStep(2);
              if (currentStep === 2 && validateStep2()) setCurrentStep(3);
            }}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="#fff" />
                <Text style={styles.submitButtonText}>Posting...</Text>
              </>
            ) : (
              <>
                <Text style={styles.submitButtonText}>Post Property</Text>
                <Ionicons name="checkmark" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Camera Modal */}
      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={handleCameraCapture}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0d2b1f' },
  stepIndicator: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 40, marginBottom: 8,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#e0e0e0',
  },
  stepCircleActive: { backgroundColor: '#0d2b1f', borderColor: '#0d2b1f' },
  stepNumber: { fontSize: 13, fontWeight: 'bold', color: '#aaa' },
  stepNumberActive: { color: '#fff' },
  stepLine: { width: 60, height: 2, backgroundColor: '#e0e0e0', marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#0d2b1f' },
  stepTitleContainer: { paddingHorizontal: 24, paddingVertical: 12 },
  stepTitle: { fontSize: 22, fontWeight: 'bold', color: '#0d2b1f' },
  stepSubtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  scrollView: { flex: 1 },
  form: { paddingHorizontal: 24, gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#0d2b1f' },
  labelHint: { fontSize: 12, color: '#888', fontWeight: '400' },
  labelSubtext: { fontSize: 12, color: '#888', marginTop: -4 },
  required: { color: '#e74c3c' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f9f6', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  currencyLabel: {
    fontSize: 15, fontWeight: 'bold', color: '#0d2b1f', marginRight: 8,
  },
  charCount: { fontSize: 12, color: '#aaa', textAlign: 'right' },
  row: { flexDirection: 'row', gap: 12 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#f5f9f6',
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  activeChip: { backgroundColor: '#0d2b1f', borderColor: '#0d2b1f' },
  chipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  activeChipText: { color: '#fff', fontWeight: '600' },
  listingTypeButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#f5f9f6', borderWidth: 1, borderColor: '#e0e0e0',
  },
  activeListingType: { backgroundColor: '#0d2b1f', borderColor: '#0d2b1f' },
  listingTypeText: { fontSize: 14, fontWeight: '600', color: '#0d2b1f' },
  activeListingTypeText: { color: '#fff' },
  counter: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f9f6', borderRadius: 14,
    borderWidth: 1, borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  counterButton: {
    padding: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#e8f0ec',
  },
  counterValue: {
    flex: 1, textAlign: 'center',
    fontSize: 16, fontWeight: 'bold', color: '#0d2b1f',
  },
  documentNote: {
    fontSize: 13, color: '#888',
    backgroundColor: '#f5f9f6',
    padding: 12, borderRadius: 10, lineHeight: 20,
  },
  photoGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  photoItem: {
    width: '47%', aspectRatio: 1,
    borderRadius: 12, overflow: 'hidden',
    position: 'relative',
  },
  photoImage: { width: '100%', height: '100%' },
  coverBadge: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: '#0d2b1f',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  coverBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  removePhotoButton: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: '#fff', borderRadius: 12,
  },
  addPhotoButton: {
    width: '47%', aspectRatio: 1,
    borderRadius: 12, borderWidth: 2,
    borderColor: '#e0e0e0', borderStyle: 'dashed',
    backgroundColor: '#f5f9f6',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addPhotoText: { fontSize: 13, color: '#0d2b1f', fontWeight: '500' },
  addPhotoCount: { fontSize: 11, color: '#aaa' },
  summaryCard: {
    backgroundColor: '#f5f9f6', borderRadius: 14, padding: 16, gap: 10,
  },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#0d2b1f', marginBottom: 4 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryText: { fontSize: 14, color: '#555', flex: 1 },
  bottomButton: {
    paddingHorizontal: 24, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  nextButton: {
    backgroundColor: '#0d2b1f', paddingVertical: 16,
    borderRadius: 14, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  submitButton: {
    backgroundColor: '#0d2b1f', paddingVertical: 16,
    borderRadius: 14, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: {
    flex: 1, backgroundColor: 'transparent',
    justifyContent: 'space-between', padding: 20,
  },
  cameraTopControls: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 10,
  },
  cameraTitleText: {
    color: '#fff', fontSize: 16, fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  cameraControlButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
  },
  cameraBottomControls: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 30,
  },
  captureButton: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  captureButtonInner: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff',
  },
  cameraPermText: {
    color: '#fff', fontSize: 16, textAlign: 'center',
    marginBottom: 20, marginTop: 100,
  },
  permButton: {
    backgroundColor: '#0d2b1f',
    paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: 14, alignSelf: 'center',
  },
  permButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});