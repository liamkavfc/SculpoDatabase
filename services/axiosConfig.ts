// DEPRECATED: This file is no longer used. All API calls have been migrated to Firebase.
// Keeping for reference but axios is not installed.
// import { environment } from '../environment';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// DEPRECATED: Axios instance creation removed - using Firebase directly
// const axiosInstance = axios.create({
//     baseURL: environment.apiUrl,
//     headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         'ngrok-skip-browser-warning': '6941',
//     }
// });

// Add request interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        // Don't add token for auth endpoints or OPTIONS requests
        if (config.url?.includes('/auth/login') || 
            config.url?.includes('/auth/register') || 
            config.url?.includes('/auth/refresh') || 
            config.method?.toLowerCase() === 'options') {
            console.log('Skipping token for auth endpoint or OPTIONS request');
            return config;
        }

        // Get token from AsyncStorage
        const token = await AsyncStorage.getItem('userToken');
        console.log('Making request to:', config.url);
        console.log('Request method:', config.method);
        console.log('Token present:', !!token);
        if (!token) {
            console.warn('No token found in AsyncStorage - request may fail authentication');
        }
        console.log('Request headers before token:', config.headers);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Added Authorization header');
        }
        
        console.log('Final request headers:', config.headers);
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        console.error('Response error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: originalRequest?.url
        });
        
        // If 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Don't try to refresh for auth endpoints
            if (originalRequest?.url?.includes('/auth/')) {
                console.log('Auth endpoint failed - not attempting refresh');
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('refreshToken');
                await AsyncStorage.removeItem('userId');
                return Promise.reject(error);
            }
            
            try {
                console.log('Attempting token refresh...');
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                
                // Call refresh endpoint
                const refreshResponse = await axios.post(`${environment.apiUrl}/api/auth/refresh`, {
                    refreshToken: refreshToken
                }, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });
                
                const newTokenData = refreshResponse.data;
                
                // Store new tokens
                await AsyncStorage.setItem('userToken', newTokenData.idToken);
                await AsyncStorage.setItem('refreshToken', newTokenData.refreshToken);
                await AsyncStorage.setItem('userId', newTokenData.userId);
                
                // Update the original request with new token
                originalRequest.headers.Authorization = `Bearer ${newTokenData.idToken}`;
                
                console.log('Token refreshed successfully, retrying original request');
                return axiosInstance(originalRequest);
                
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Clear all tokens and force re-login
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('refreshToken');
                await AsyncStorage.removeItem('userId');
                console.warn('Authentication failed. Please handle navigation to login in your app.');
                return Promise.reject(error);
            }
        }
        
        return Promise.reject(error);
    }
);

// DEPRECATED: Export removed - use Firebase directly
// export default axiosInstance;

// Temporary stub to prevent import errors (services using this should be migrated)
const axiosInstance = null as any;
export default axiosInstance; 