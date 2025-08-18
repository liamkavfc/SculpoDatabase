import { environment } from '../environment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './axiosConfig';
// AUTH SERVICE
class AuthService {
    // CONSTRUCTOR
    constructor() {
        const baseUrl = environment.apiUrl;
        this.apiUrl = `${baseUrl}/api/auth`;
    }
    // LOGIN
    async login(email, password) {
        const response = await axiosInstance.post(`${this.apiUrl}/login`, {
            email,
            password
        });
        return response.data;
    }
    // REGISTER
    async register(email, password, firstName, lastName, phoneNumber, referralCode) {
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
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userId');
        await AsyncStorage.removeItem('refreshToken');
        // Clear any other stored user data
        await AsyncStorage.removeItem('userProfile'); // In case we cache profile data later
        // Note: Navigation should be handled by the consuming application
        return true;
    }
    // GET TOKEN
    getToken() {
        return AsyncStorage.getItem('userToken');
    }
    // CHECK IF USER IS LOGGED IN
    async isLoggedIn() {
        try {
            const token = await AsyncStorage.getItem('userToken');
            return !!token;
        }
        catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    }
    // STORE TOKEN (helper method)
    async storeToken(token) {
        try {
            await AsyncStorage.setItem('userToken', token);
        }
        catch (error) {
            console.error('Error storing token:', error);
            throw error;
        }
    }
    // STORE AUTH DATA (token, userId, and refresh token)
    async storeAuthData(token, userId, refreshToken) {
        try {
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userId', userId);
            if (refreshToken) {
                await AsyncStorage.setItem('refreshToken', refreshToken);
            }
        }
        catch (error) {
            console.error('Error storing auth data:', error);
            throw error;
        }
    }
    // GET USER ID
    async getUserId() {
        try {
            return await AsyncStorage.getItem('userId');
        }
        catch (error) {
            console.error('Error getting userId:', error);
            return null;
        }
    }
    // STORE USER PROFILE DATA (for caching)
    async storeUserProfile(profileData) {
        try {
            await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
        }
        catch (error) {
            console.error('Error storing user profile:', error);
        }
    }
    // GET CACHED USER PROFILE DATA
    async getCachedUserProfile() {
        try {
            const profileData = await AsyncStorage.getItem('userProfile');
            return profileData ? JSON.parse(profileData) : null;
        }
        catch (error) {
            console.error('Error getting cached user profile:', error);
            return null;
        }
    }
    // GET REFRESH TOKEN
    async getRefreshToken() {
        try {
            return await AsyncStorage.getItem('refreshToken');
        }
        catch (error) {
            console.error('Error getting refresh token:', error);
            return null;
        }
    }
    // REFRESH TOKEN
    async refreshToken() {
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
    // CHECK IF TOKEN IS EXPIRED AND REFRESH IF NEEDED
    async ensureValidToken() {
        try {
            const token = await this.getToken();
            if (!token) {
                return null;
            }
            // Simple check: if token exists, try to use it
            // If it fails in API calls, the interceptor will handle refresh
            return token;
        }
        catch (error) {
            console.error('Error ensuring valid token:', error);
            return null;
        }
    }
}
export default new AuthService();
