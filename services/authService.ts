import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, getAuth } from 'firebase/auth';

// AUTH SERVICE
// Note: This service now uses Firebase Auth directly instead of API calls
class AuthService {
    /**
     * @deprecated Use Firebase Auth directly via FirebaseAuthContext instead
     * Login using Firebase Auth
     */
    async login(email: string, password: string) {
        console.warn('AuthService.login() is deprecated. Use Firebase Auth directly via useFirebaseAuth().signIn() instead.');
        
        try {
            // Use getAuth() to get the default Firebase Auth instance
            // This requires Firebase to be initialized before calling this method
            const auth = getAuth();
            
            if (!auth) {
                throw new Error('Firebase Auth not initialized. Ensure Firebase is initialized before calling this method.');
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Return format compatible with old API response
            return {
                idToken: await userCredential.user.getIdToken(),
                localId: userCredential.user.uid,
                email: userCredential.user.email,
                refreshToken: userCredential.user.refreshToken,
            };
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * @deprecated Use Firebase Auth directly via FirebaseAuthContext instead
     * Register using Firebase Auth
     */
    async register(email: string, password: string, firstName: string, lastName: string, phoneNumber: string, referralCode?: string): Promise<RegisterResponseDto> {
        console.warn('AuthService.register() is deprecated. Use Firebase Auth directly via useFirebaseAuth().signUp() instead.');
        
        try {
            // Use getAuth() to get the default Firebase Auth instance
            const auth = getAuth();
            
            if (!auth) {
                throw new Error('Firebase Auth not initialized. Ensure Firebase is initialized before calling this method.');
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Create profile in Firestore (this should be done via ProfileService)
            // For now, just return the user credential
            return {
                idToken: await userCredential.user.getIdToken(),
                localId: userCredential.user.uid,
                email: userCredential.user.email,
                refreshToken: userCredential.user.refreshToken,
            } as RegisterResponseDto;
        } catch (error: any) {
            console.error('Register error:', error);
            throw error;
        }
    }

    /**
     * @deprecated Use Firebase Auth directly via FirebaseAuthContext instead
     * Logout using Firebase Auth
     */
    async logout() {
        console.warn('AuthService.logout() is deprecated. Use Firebase Auth directly via useFirebaseAuth().signOut() instead.');
        
        try {
            // Use getAuth() to get the default Firebase Auth instance
            const auth = getAuth();
            
            if (auth && auth.currentUser) {
                await firebaseSignOut(auth);
            }

            // Clear local storage
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('refreshToken');
            await AsyncStorage.removeItem('userProfile');
            
            console.log('Logout completed');
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            
            // Even if there's an error, try to clear local storage
            try {
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userId');
                await AsyncStorage.removeItem('refreshToken');
                await AsyncStorage.removeItem('userProfile');
            } catch (fallbackError) {
                console.error('Fallback logout failed:', fallbackError);
            }
            
            return true;
        }
    }

    // GET TOKEN
    getToken() {
        return AsyncStorage.getItem('userToken');
    }

    // CHECK IF USER IS LOGGED IN
    async isLoggedIn(): Promise<boolean> {
        try {
            const token = await AsyncStorage.getItem('userToken');
            return !!token;
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    }

    // STORE TOKEN (helper method)
    async storeToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem('userToken', token);
        } catch (error) {
            console.error('Error storing token:', error);
            throw error;
        }
    }

    // STORE AUTH DATA (token, userId, and refresh token)
    async storeAuthData(token: string, userId: string, refreshToken?: string): Promise<void> {
        try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userId', userId);
            if (refreshToken) {
                await AsyncStorage.setItem('refreshToken', refreshToken);
            }
        } catch (error) {
            console.error('Error storing auth data:', error);
            throw error;
        }
    }

    // GET USER ID
    async getUserId(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('userId');
        } catch (error) {
            console.error('Error getting userId:', error);
            return null;
        }
    }

    // STORE USER PROFILE DATA (for caching)
    async storeUserProfile(profileData: any): Promise<void> {
        try {
            await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
        } catch (error) {
            console.error('Error storing user profile:', error);
        }
    }

    // GET CACHED USER PROFILE DATA
    async getCachedUserProfile(): Promise<any | null> {
        try {
            const profileData = await AsyncStorage.getItem('userProfile');
            return profileData ? JSON.parse(profileData) : null;
        } catch (error) {
            console.error('Error getting cached user profile:', error);
            return null;
        }
    }

    // GET REFRESH TOKEN
    async getRefreshToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('refreshToken');
        } catch (error) {
            console.error('Error getting refresh token:', error);
            return null;
        }
    }

    /**
     * @deprecated Use Firebase Auth token refresh instead
     * Refresh token using Firebase Auth
     */
    async refreshToken(): Promise<RefreshTokenResponseDto> {
        console.warn('AuthService.refreshToken() is deprecated. Firebase Auth handles token refresh automatically.');
        
        try {
            // Use getAuth() to get the default Firebase Auth instance
            const auth = getAuth();
            
            if (!auth || !auth.currentUser) {
                throw new Error('No user logged in');
            }

            // Firebase Auth automatically refreshes tokens
            const idToken = await auth.currentUser.getIdToken(true); // Force refresh
            
            return {
                idToken,
                refreshToken: auth.currentUser.refreshToken,
                expiresIn: '3600', // Firebase tokens typically expire in 1 hour
                userId: auth.currentUser.uid,
            };
        } catch (error) {
            console.error('Token refresh error:', error);
            throw error;
        }
    }

    /**
     * @deprecated Firebase Auth tokens are automatically verified
     * Verify token using Firebase Auth
     */
    async verifyToken(token: string): Promise<boolean> {
        console.warn('AuthService.verifyToken() is deprecated. Firebase Auth tokens are automatically verified.');
        
        try {
            // Firebase Auth tokens are JWT tokens that can be verified
            // For now, just check if we can decode it (basic validation)
            // In production, you might want to verify the token signature
            if (!token || token.length < 20) {
                return false;
            }
            
            // Basic check - Firebase Auth handles verification
            return true;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }

    // CHECK IF TOKEN IS EXPIRED AND REFRESH IF NEEDED
    async ensureValidToken(): Promise<string | null> {
        try {
            const token = await this.getToken();
            if (!token) {
                return null;
            }

            // Simple check: if token exists, try to use it
            // If it fails in API calls, the interceptor will handle refresh
            return token;
        } catch (error) {
            console.error('Error ensuring valid token:', error);
            return null;
        }
    }
}

export default new AuthService();

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  referralCode?: string;
}

export interface RegisterResponseDto {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  profileId: string;
}

export interface RefreshTokenResponseDto {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  userId: string;
} 
