import { collection, getDocs, query, orderBy, limit, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  type: string;
  propertyType: string;
  listingType: string;
  rating: number;
  image: string;
  photos: string[];
  description: string;
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  agentId: string;
  agentName: string;
  agentPhone: string;
  createdAt: string;
}

// Fetch all properties
export const fetchProperties = async (): Promise<Property[]> => {
  try {
    const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Property[];
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
};

// Fetch featured properties
export const fetchFeaturedProperties = async (): Promise<Property[]> => {
  try {
    const q = query(collection(db, 'properties'), orderBy('rating', 'desc'), limit(5));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Property[];
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return [];
  }
};

// Fetch user's own properties
export const fetchMyProperties = async (userId: string): Promise<Property[]> => {
  try {
    const q = query(
      collection(db, 'properties'),
      where('agentId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Property[];
  } catch (error) {
    console.error('Error fetching my properties:', error);
    return [];
  }
};

// Delete a property
export const deleteProperty = async (propertyId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'properties', propertyId));
    return true;
  } catch (error) {
    console.error('Error deleting property:', error);
    return false;
  }
};

// Update a property
export const updateProperty = async (propertyId: string, data: Partial<Property>): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'properties', propertyId), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating property:', error);
    return false;
  }
};