import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  Auth,
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
import { router } from 'expo-router';

interface FirebaseAuthContextType {
  user: User | null;
  userId: string | null;
  isAdmin: boolean;
  profileId: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: 'Admin' | 'Client' | 'Trainer') => Promise<void>;
  signOut: () => Promise<void>;
}

interface FirebaseAuthProviderProps {
  children: ReactNode;
  auth: Auth;
  db: Firestore;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children, auth, db }: FirebaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure Firebase is initialized before setting up auth listener
    if (!auth) {
      console.error('FirebaseAuth - Auth not initialized');
      setIsLoading(false);
      return;
    }

    let isFirstAuthCheck = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('FirebaseAuth - Auth state changed:', user ? `User logged in: ${user.uid}` : 'User logged out');
      
      if (user) {
        setUser(user);
        await checkAdminStatus(user.uid);
      } else {
        setUser(null);
        setIsAdmin(false);
        setProfileId(null);
      }
      
      // Set loading to false after the first auth state check completes
      // This ensures we wait for Firebase to restore the session
      if (isFirstAuthCheck) {
        isFirstAuthCheck = false;
        console.log('FirebaseAuth - First auth check complete, setting loading to false');
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [auth]);

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('FirebaseAuth - Checking admin status for userId:', userId);
      
      // Ensure Firebase is initialized and user is authenticated
      if (!auth.currentUser) {
        console.log('FirebaseAuth - No authenticated user, skipping admin check');
        setIsAdmin(false);
        setProfileId(userId);
        return;
      }
      
      // Check if user profile exists in Firestore
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        console.log('FirebaseAuth - Profile found:', profileData);
        console.log('FirebaseAuth - userType:', profileData.userType);
        
        // Check if user is Admin (handle both string and numeric userType)
        // UserType enum: 0=Admin, 1=Trainer, 2=Client, 3=ExternalClient
        // Also allow Trainers (userType 1) to access admin panel
        const userType = profileData.userType;
        const isUserAdmin = userType === 'Admin' || userType === 0 || userType === 1 || userType === 'Trainer';
        console.log('FirebaseAuth - userType:', userType, 'isUserAdmin:', isUserAdmin);
        
        setIsAdmin(isUserAdmin);
        setProfileId(profileData.id || userId);
      } else {
        console.log('FirebaseAuth - No profile found, creating admin profile for test user');
        
        // Get the current user to get their email
        const currentUser = auth.currentUser;
        
        // For now, create an admin profile for the test user
        const defaultProfile = {
          id: userId,
          userType: 'Admin', // Set to Admin for testing
          email: currentUser?.email || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await setDoc(profileRef, defaultProfile);
        console.log('FirebaseAuth - Created admin profile');
        setIsAdmin(true);
        setProfileId(userId);
      }
    } catch (error) {
      console.error('FirebaseAuth - Error checking admin status:', error);
      setIsAdmin(false);
      setProfileId(userId);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('FirebaseAuth - Signing in with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('FirebaseAuth - Sign in successful:', userCredential.user.uid);
    } catch (error: any) {
      console.error('FirebaseAuth - Sign in error:', error);
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string, userType: 'Admin' | 'Client' | 'Trainer') => {
    try {
      console.log('FirebaseAuth - Signing up with email:', email, 'userType:', userType);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const profileRef = doc(db, 'profiles', userCredential.user.uid);
      const profileData = {
        id: userCredential.user.uid,
        userType: userType,
        email: email,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(profileRef, profileData);
      console.log('FirebaseAuth - Sign up successful:', userCredential.user.uid);
    } catch (error: any) {
      console.error('FirebaseAuth - Sign up error:', error);
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    try {
      console.log('FirebaseAuth - Signing out');
      await firebaseSignOut(auth);
      router.replace('/login');
    } catch (error: any) {
      console.error('FirebaseAuth - Sign out error:', error);
      throw new Error(error.message);
    }
  };

  const value: FirebaseAuthContextType = {
    user,
    userId: user?.uid || null,
    isAdmin,
    profileId,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  // Debug logging
  console.log('FirebaseAuthContext - Current state:', {
    user: user?.uid || 'null',
    userId: user?.uid || null,
    isAdmin,
    profileId,
    isLoading
  });

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}
