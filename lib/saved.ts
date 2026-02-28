import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Save a property
export const saveProperty = async (userId: string, propertyId: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      savedProperties: arrayUnion(propertyId),
    });
    return true;
  } catch (error) {
    console.error('Error saving property:', error);
    return false;
  }
};

// Unsave a property
export const unsaveProperty = async (userId: string, propertyId: string) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      savedProperties: arrayRemove(propertyId),
    });
    return true;
  } catch (error) {
    console.error('Error unsaving property:', error);
    return false;
  }
};

// Get saved property IDs
export const getSavedPropertyIds = async (userId: string): Promise<string[]> => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data().savedProperties || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting saved properties:', error);
    return [];
  }
};

// Check if a property is saved
export const isPropertySaved = async (userId: string, propertyId: string): Promise<boolean> => {
  const savedIds = await getSavedPropertyIds(userId);
  return savedIds.includes(propertyId);
};