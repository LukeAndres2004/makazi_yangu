import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/lib/auth';

// ---- Menu Item Component ----
const MenuItem = ({
  icon, label, onPress, danger
}: {
  icon: string, label: string, onPress: () => void, danger?: boolean
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <Ionicons name={icon as any} size={20} color={danger ? '#e74c3c' : '#0d2b1f'} />
    </View>
    <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color="#ccc" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // ---- Not logged in ----
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notLoggedIn}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={48} color="#0d2b1f" />
          </View>
          <Text style={styles.notLoggedInTitle}>You're not logged in</Text>
          <Text style={styles.notLoggedInSubtitle}>
            Sign in to access your profile, saved properties and more
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Logged in ----
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <Image
            source={{ uri: userData?.avatar || `https://ui-avatars.com/api/?name=${user.displayName}&background=0d2b1f&color=fff` }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.displayName || 'User'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

            {/* Verified Badge */}
            {userData?.isLandlord ? (
              <View style={styles.landlordBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#0d2b1f" />
                <Text style={styles.landlordBadgeText}>
                  {userData?.isVerified ? 'Verified Landlord' : 'Landlord (Pending Verification)'}
                </Text>
              </View>
            ) : (
              <View style={styles.userBadge}>
                <Ionicons name="person" size={14} color="#888" />
                <Text style={styles.userBadgeText}>Regular User</Text>
              </View>
            )}
          </View>

          {/* Edit Button */}
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil-outline" size={18} color="#0d2b1f" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* Become a Landlord Banner */}
        {!userData?.isLandlord && (
          <TouchableOpacity
            style={styles.landlordBanner}
            onPress={() => router.push('/(auth)/register-landlord')}
          >
            <View style={styles.landlordBannerLeft}>
              <Ionicons name="home" size={24} color="#fff" />
              <View>
                <Text style={styles.landlordBannerTitle}>Become a Landlord</Text>
                <Text style={styles.landlordBannerSubtitle}>List your properties on Makazi Yangu</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>
          <MenuItem
            icon="person-outline"
            label="Edit Profile"
            onPress={() => {}}
          />
          <MenuItem
            icon="bookmark-outline"
            label="Saved Properties"
            onPress={() => router.push('/(tabs)/saved')}
          />
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            onPress={() => {}}
          />
        </View>
        <TouchableOpacity
  style={styles.myListingsButton}
  onPress={() => router.push('/my-listings' as any)}
>
  <Ionicons name="home-outline" size={20} color="#fff" />
  <Text style={styles.myListingsButtonText}>My Listings</Text>
  <Ionicons name="chevron-forward" size={20} color="#fff" />
</TouchableOpacity>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Support</Text>
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => {}}
          />
          <MenuItem
            icon="shield-outline"
            label="Privacy Policy"
            onPress={() => {}}
          />
          <MenuItem
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => {}}
          />
        </View>
        

        {/* Logout */}
        <View style={styles.menuSection}>
          {isLoading ? (
            <ActivityIndicator color="#e74c3c" />
          ) : (
            <MenuItem
              icon="log-out-outline"
              label="Logout"
              onPress={handleLogout}
              danger
            />
          )}
        </View>

        {/* Version */}
        <Text style={styles.version}>Makazi Yangu v1.0.0</Text>

      </ScrollView>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f0ec',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d2b1f',
  },
  userEmail: {
    fontSize: 13,
    color: '#888',
  },
  landlordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e8f0ec',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  landlordBadgeText: {
    fontSize: 11,
    color: '#0d2b1f',
    fontWeight: '600',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  userBadgeText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#f5f9f6',
    padding: 8,
    borderRadius: 10,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d2b1f',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
  },
  landlordBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0d2b1f',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  landlordBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  landlordBannerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  landlordBannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#aaa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 10,
  },
  menuIcon: {
    backgroundColor: '#f5f9f6',
    padding: 8,
    borderRadius: 10,
  },
  menuIconDanger: {
    backgroundColor: '#fdf0f0',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  menuLabelDanger: {
    color: '#e74c3c',
  },
  notLoggedIn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#e8f0ec',
    padding: 24,
    borderRadius: 50,
    marginBottom: 8,
  },
  notLoggedInTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0d2b1f',
    textAlign: 'center',
  },
  notLoggedInSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  signInButton: {
    backgroundColor: '#0d2b1f',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#f5f9f6',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0d2b1f',
  },
  registerButtonText: {
    color: '#0d2b1f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    color: '#ccc',
    fontSize: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  myListingsButton: {
  flexDirection: 'row', alignItems: 'center',
  backgroundColor: '#0d2b1f', marginHorizontal: 20,
  padding: 16, borderRadius: 14, gap: 10,
  marginTop: 16,
},
myListingsButtonText: {
  flex: 1, color: '#fff',
  fontSize: 16, fontWeight: '600',
},
});


