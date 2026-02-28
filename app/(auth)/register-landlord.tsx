import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Image, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { doc, updateDoc ,setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

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
  visible, onClose, onCapture, title, allowFront,
}: {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
  title: string;
  allowFront?: boolean;
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>(allowFront ? 'front' : 'back');
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
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          flash={flash}
        >
          <View style={styles.cameraOverlay}>

            {/* Top Controls */}
            <View style={styles.cameraTopControls}>
              <TouchableOpacity style={styles.cameraControlButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.cameraTitleText}>{title}</Text>
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

            {/* Frame */}
            <View style={styles.cameraFrame} />

            {/* Bottom Controls */}
            <View style={styles.cameraBottomControls}>
              {allowFront ? (
                <TouchableOpacity
                  style={styles.cameraControlButton}
                  onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                >
                  <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
                </TouchableOpacity>
              ) : (
                <View style={{ width: 50 }} />
              )}
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

// ---- Upload Box ----
const UploadBox = ({
  label, image, onPress, optional,
}: {
  label: string; image?: string; onPress: () => void; optional?: boolean;
}) => (
  <TouchableOpacity style={styles.uploadBox} onPress={onPress}>
    {image ? (
      <>
        <Image source={{ uri: image }} style={styles.uploadedImage} />
        <View style={styles.uploadedOverlay}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.uploadedText}>Tap to retake</Text>
        </View>
      </>
    ) : (
      <>
        <Ionicons name="camera-outline" size={32} color="#0d2b1f" />
        <Text style={styles.uploadLabel}>{label}</Text>
        {optional && <Text style={styles.optionalText}>Optional</Text>}
      </>
    )}
  </TouchableOpacity>
);

// ---- Main Screen ----
export default function RegisterLandlordScreen() {
  const router = useRouter();
  const { user, userData, setUserData } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1
  const [fullName, setFullName] = useState(userData?.name || '');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');

  // Step 2
  const [idFront, setIdFront] = useState('');
  const [idBack, setIdBack] = useState('');
  const [license, setLicense] = useState('');

  // Step 3
  const [profilePhoto, setProfilePhoto] = useState('');

  // Camera
  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraTarget, setCameraTarget] = useState('');
  const [cameraTitle, setCameraTitle] = useState('');
  const [allowFront, setAllowFront] = useState(false);

  const openCamera = (target: string, title: string, front = false) => {
    setCameraTarget(target);
    setCameraTitle(title);
    setAllowFront(front);
    setCameraVisible(true);
  };

  const handleCapture = (uri: string) => {
    switch (cameraTarget) {
      case 'idFront': setIdFront(uri); break;
      case 'idBack': setIdBack(uri); break;
      case 'license': setLicense(uri); break;
      case 'profile': setProfilePhoto(uri); break;
    }
  };

  const validateStep1 = () => {
    if (!fullName || !phone || !idNumber || !address) {
      Alert.alert('Missing Info', 'Please fill in all required fields');
      return false;
    }
    if (phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!idFront || !idBack) {
      Alert.alert('Missing Documents', 'Please take photos of both sides of your ID');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!profilePhoto) {
      Alert.alert('Missing Photo', 'Please take a profile photo');
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
      await setDoc(doc(db, 'users', user.uid), {
        name: fullName,
        phone,
        idNumber,
        address,
        isLandlord: true,
        isVerified: false,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0d2b1f&color=fff`,
        updatedAt: new Date().toISOString(),
      },{merge:true});

      setUserData((prev: any) => ({
        ...prev,
        name: fullName,
        phone,
        isLandlord: true,
        isVerified: false,
      }));

      Alert.alert(
        '🎉 Application Submitted!',
        'Your landlord application has been submitted. We will review it and get back to you within 24-48 hours.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/profile') }]
      );

    } catch (error: any) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = ['Personal Information', 'Identity Documents', 'Profile Photo'];
  const stepSubtitles = ['Tell us about yourself', 'Upload your ID for verification', 'Add a photo to your profile'];

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0d2b1f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Landlord</Text>
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

        {/* ---- STEP 1 ---- */}
        {currentStep === 1 && (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#aaa"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+254 700 000 000"
                  placeholderTextColor="#aaa"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>National ID Number <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Ionicons name="card-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your ID number"
                  placeholderTextColor="#aaa"
                  value={idNumber}
                  onChangeText={setIdNumber}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Physical Address <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputContainer, { alignItems: 'flex-start', paddingTop: 12 }]}>
                <Ionicons name="location-outline" size={20} color="#888" style={[styles.inputIcon, { marginTop: 2 }]} />
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  placeholder="Enter your physical address"
                  placeholderTextColor="#aaa"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                />
              </View>
            </View>
          </View>
        )}

        {/* ---- STEP 2 ---- */}
        {currentStep === 2 && (
          <View style={styles.form}>
            <Text style={styles.documentNote}>
              📸 Please ensure photos are clear and all text is readable
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>National ID / Passport — Front <Text style={styles.required}>*</Text></Text>
              <UploadBox
                label="Take photo of front side"
                image={idFront}
                onPress={() => openCamera('idFront', 'ID Front Side')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>National ID / Passport — Back <Text style={styles.required}>*</Text></Text>
              <UploadBox
                label="Take photo of back side"
                image={idBack}
                onPress={() => openCamera('idBack', 'ID Back Side')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Agent License</Text>
              <UploadBox
                label="Take photo of agent license"
                image={license}
                onPress={() => openCamera('license', 'Agent License')}
                optional
              />
            </View>
          </View>
        )}

        {/* ---- STEP 3 ---- */}
        {currentStep === 3 && (
          <View style={styles.form}>
            <Text style={styles.documentNote}>
              🤳 This photo will be visible to potential tenants
            </Text>

            <View style={styles.profilePhotoContainer}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profilePhotoPreview} />
              ) : (
                <View style={styles.profilePhotoPlaceholder}>
                  <Ionicons name="person" size={60} color="#ccc" />
                </View>
              )}
              <TouchableOpacity
                style={styles.takePhotoButton}
                onPress={() => openCamera('profile', 'Take a Selfie', true)}
              >
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.takePhotoText}>{profilePhoto ? 'Retake Photo' : 'Take Selfie'}</Text>
              </TouchableOpacity>
            </View>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Application Summary</Text>
              {[
                { icon: 'person-outline', text: fullName },
                { icon: 'call-outline', text: phone },
                { icon: 'card-outline', text: `ID: ${idNumber}` },
                { icon: 'location-outline', text: address },
                { icon: 'document-outline', text: `ID Photos: ${idFront && idBack ? '✅ Uploaded' : '❌ Missing'}` },
                { icon: 'ribbon-outline', text: `Agent License: ${license ? '✅ Uploaded' : 'Not provided'}` },
              ].map((item, i) => (
                <View key={i} style={styles.summaryRow}>
                  <Ionicons name={item.icon as any} size={16} color="#888" />
                  <Text style={styles.summaryText}>{item.text}</Text>
                </View>
              ))}
            </View>
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
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </>
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Application</Text>
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
        onCapture={handleCapture}
        title={cameraTitle}
        allowFront={allowFront}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0d2b1f' },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginBottom: 8,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center', justifyContent: 'center',
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
  required: { color: '#e74c3c' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f9f6', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  documentNote: {
    fontSize: 13, color: '#888',
    backgroundColor: '#f5f9f6',
    padding: 12, borderRadius: 10, lineHeight: 20,
  },
  uploadBox: {
    height: 140, backgroundColor: '#f5f9f6',
    borderRadius: 14, borderWidth: 2,
    borderColor: '#e0e0e0', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, overflow: 'hidden',
  },
  uploadLabel: { fontSize: 14, color: '#0d2b1f', fontWeight: '500' },
  optionalText: { fontSize: 12, color: '#aaa' },
  uploadedImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadedOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(13,43,31,0.7)',
    padding: 8, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  uploadedText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  profilePhotoContainer: { alignItems: 'center', gap: 16, paddingVertical: 20 },
  profilePhotoPreview: {
    width: 150, height: 150, borderRadius: 75,
    borderWidth: 3, borderColor: '#0d2b1f',
  },
  profilePhotoPlaceholder: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: '#f5f9f6',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#e0e0e0', borderStyle: 'dashed',
  },
  takePhotoButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0d2b1f',
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 14, gap: 8,
  },
  takePhotoText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  summaryCard: {
    backgroundColor: '#f5f9f6', borderRadius: 14,
    padding: 16, gap: 10,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
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
  cameraFrame: {
    width: '85%', height: 200,
    borderWidth: 2, borderColor: '#fff',
    borderRadius: 12, alignSelf: 'center',
  },
  cameraBottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
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