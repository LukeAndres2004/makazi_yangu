import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// ---- REGISTER ----
export const register = async (
  email: string,
  password: string,
  name: string,
) => {
  try {
    console.log("creating account")
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("account created")

    // Update display name
    await updateProfile(user, { displayName: name });
    console.log("profile updated")
    

    // ✅ Add this line right here
    await sendEmailVerification(user);
    console.log("verification email sent")


    // Save user to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email,
      isVerified: false,
      isLandlord: false,
      createdAt: new Date().toISOString(),
      avatar: `https://ui-avatars.com/api/?name=${name}&background=0d2b1f&color=fff`,
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// ---- LOGIN ----
export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if email is verified
    if (!user.emailVerified) {
      await signOut(auth);
      throw new Error('Please verify your email before signing in. Check your inbox!');
    }

    return user;
  } catch (error) {
    throw error;
  }
};
// ---- LOGOUT ----
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// ---- GET USER FROM FIRESTORE ----
export const getUserData = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) return userDoc.data();
    return null;
  } catch (error) {
    return null;
  }
};