"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("../environment");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const axiosConfig_1 = __importDefault(require("./axiosConfig"));
// AUTH SERVICE
class AuthService {
    // CONSTRUCTOR
    constructor() {
        const baseUrl = environment_1.environment.apiUrl;
        this.apiUrl = `${baseUrl}/api/auth`;
    }
    // LOGIN
    async login(email, password) {
        const response = await axiosConfig_1.default.post(`${this.apiUrl}/login`, {
            email,
            password
        });
        return response.data;
    }
    // REGISTER
    async register(email, password, firstName, lastName, phoneNumber, referralCode) {
        const response = await axiosConfig_1.default.post(`${this.apiUrl}/register`, {
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
                    const response = await axiosConfig_1.default.post(`${this.apiUrl}/logout`, {
                        refreshToken: refreshToken
                    });
                    console.log('Server logout successful', response.data);
                }
                catch (serverError) {
                    console.warn('Server logout failed, continuing with local logout:', serverError);
                    // Continue with local logout even if server call fails
                }
            }
            else {
                console.log('No refresh token found, performing local logout only');
            }
            // Always clear local storage regardless of server response
            await async_storage_1.default.removeItem('userToken');
            await async_storage_1.default.removeItem('userId');
            await async_storage_1.default.removeItem('refreshToken');
            await async_storage_1.default.removeItem('userProfile');
            console.log('Local logout completed');
            return true;
        }
        catch (error) {
            console.error('Logout error:', error);
            // Even if there's an error, try to clear local storage
            try {
                await async_storage_1.default.removeItem('userToken');
                await async_storage_1.default.removeItem('userId');
                await async_storage_1.default.removeItem('refreshToken');
                await async_storage_1.default.removeItem('userProfile');
                console.log('Fallback local logout completed');
            }
            catch (fallbackError) {
                console.error('Even fallback logout failed:', fallbackError);
            }
            // Always return true for logout - we don't want logout to "fail"
            return true;
        }
    }
    // GET TOKEN
    getToken() {
        return async_storage_1.default.getItem('userToken');
    }
    // CHECK IF USER IS LOGGED IN
    async isLoggedIn() {
        try {
            const token = await async_storage_1.default.getItem('userToken');
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
            await async_storage_1.default.setItem('userToken', token);
        }
        catch (error) {
            console.error('Error storing token:', error);
            throw error;
        }
    }
    // STORE AUTH DATA (token, userId, and refresh token)
    async storeAuthData(token, userId, refreshToken) {
        try {
            await async_storage_1.default.setItem('userToken', token);
            await async_storage_1.default.setItem('userId', userId);
            if (refreshToken) {
                await async_storage_1.default.setItem('refreshToken', refreshToken);
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
            return await async_storage_1.default.getItem('userId');
        }
        catch (error) {
            console.error('Error getting userId:', error);
            return null;
        }
    }
    // STORE USER PROFILE DATA (for caching)
    async storeUserProfile(profileData) {
        try {
            await async_storage_1.default.setItem('userProfile', JSON.stringify(profileData));
        }
        catch (error) {
            console.error('Error storing user profile:', error);
        }
    }
    // GET CACHED USER PROFILE DATA
    async getCachedUserProfile() {
        try {
            const profileData = await async_storage_1.default.getItem('userProfile');
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
            return await async_storage_1.default.getItem('refreshToken');
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
        const response = await axiosConfig_1.default.post(`${this.apiUrl}/refresh`, {
            refreshToken: refreshToken
        });
        const data = response.data;
        // Store the new tokens
        await this.storeAuthData(data.idToken, data.userId, data.refreshToken);
        return data;
    }
    // VERIFY TOKEN
    async verifyToken(token) {
        try {
            const response = await axiosConfig_1.default.get(`${this.apiUrl}/verify-token`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.status === 200;
        }
        catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
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
exports.default = new AuthService();
//# sourceMappingURL=authService.js.map