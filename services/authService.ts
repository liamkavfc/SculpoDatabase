import { environment } from '../environment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosConfig';

// AUTH SERVICE
class AuthService {
    // PROPERTIES
    private apiUrl: string;

    // CONSTRUCTOR
    constructor() {
        const baseUrl = environment.apiUrl;
            
        this.apiUrl = `${baseUrl}/api/auth`;
    }

    // LOGIN
    async login(email: string, password: string) {
        const response = await axiosInstance.post(`${this.apiUrl}/login`, {
            email,
            password
        });
        
        return response.data;
    }

    // REGISTER
    async register(email: string, password: string, firstName: string, lastName: string, phoneNumber: string, referralCode?: string): Promise<RegisterResponseDto> {
        const response = await axiosInstance.post(`${this.apiUrl}/register`, {
            email,
            password,
            firstName,
            lastName,
            phoneNumber,
            referralCode
        });
        
        return response.data;
    }

    // LOGOUT
    async logout() {
        try {
            const refreshToken = await this.getRefreshToken();
            
            // Try to call server logout endpoint if we have a refresh token
            if (refreshToken) {
                try {
                    const response = await axiosInstance.post(`${this.apiUrl}/logout`, {
                        refreshToken: refreshToken
                    });
                    console.log('Server logout successful');
                } catch (serverError) {
                    console.warn('Server logout failed, continuing with local logout:', serverError);
                    // Continue with local logout even if server call fails
                }
            } else {
                console.log('No refresh token found, performing local logout only');
            }

            // Always clear local storage regardless of server response
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('refreshToken');
            await AsyncStorage.removeItem('userProfile');
            
            console.log('Local logout completed');
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            
            // Even if there's an error, try to clear local storage
            try {
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userId');
                await AsyncStorage.removeItem('refreshToken');
                await AsyncStorage.removeItem('userProfile');
                console.log('Fallback local logout completed');
            } catch (fallbackError) {
                console.error('Even fallback logout failed:', fallbackError);
            }
            
            // Always return true for logout - we don't want logout to "fail"
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

    // REFRESH TOKEN
    async refreshToken(): Promise<RefreshTokenResponseDto> {
        const refreshToken = await this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await axiosInstance.post(`${this.apiUrl}/refresh`, {
            refreshToken: refreshToken
        });

        const data = response.data;

        // Store the new tokens
        await this.storeAuthData(data.idToken, data.userId, data.refreshToken);

        return data;
    }

    // VERIFY TOKEN
    async verifyToken(token: string): Promise<boolean> {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/verify-token`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.status === 200;
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