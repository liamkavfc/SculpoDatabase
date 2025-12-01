declare class AuthService {
    private apiUrl;
    constructor();
    login(email: string, password: string): Promise<any>;
    register(email: string, password: string, firstName: string, lastName: string, phoneNumber: string, referralCode?: string): Promise<RegisterResponseDto>;
    logout(): Promise<boolean>;
    getToken(): Promise<string | null>;
    isLoggedIn(): Promise<boolean>;
    storeToken(token: string): Promise<void>;
    storeAuthData(token: string, userId: string, refreshToken?: string): Promise<void>;
    getUserId(): Promise<string | null>;
    storeUserProfile(profileData: any): Promise<void>;
    getCachedUserProfile(): Promise<any | null>;
    getRefreshToken(): Promise<string | null>;
    refreshToken(): Promise<RefreshTokenResponseDto>;
    verifyToken(token: string): Promise<boolean>;
    ensureValidToken(): Promise<string | null>;
}
declare const _default: AuthService;
export default _default;
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
