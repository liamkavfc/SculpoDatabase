declare class ProfileService {
    private apiUrl;
    constructor();
    create(profile: ProfileFullViewModel): Promise<string>;
    createClientProfile(clientData: CreateClientProfileDto): Promise<string>;
    update(id: string, profile: ProfileFullViewModel): Promise<void>;
    updateExtendedInfo(userId: string, extendedInfo: ExtendedProfileInfo): Promise<void>;
    getAll(): Promise<ProfileListViewModel[]>;
    getById(id: string): Promise<ProfileFullViewModel | null>;
    getByUserId(id: string): Promise<ProfileFullViewModel | null>;
    getExternalClients(): Promise<ProfileListViewModel[]>;
}
declare const _default: ProfileService;
export default _default;
export interface ProfileListViewModel {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: UserType;
}
export interface ProfileFullViewModel {
    id: string;
    image: string | null;
    name: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    location: string | null;
    email: string | null;
    phoneNumber: string | null;
    userType: UserType;
    about: string | null;
    qualifications: string | null;
    specialisms: string | null;
    gyms: string | null;
    newPassword: string | null;
    userId: string;
    height: number | null;
    weight: number | null;
    bmi: number | null;
}
export interface CreateClientProfileDto {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    tel: string;
}
export interface ExtendedProfileInfo {
    height: number | null;
    weight: number | null;
    gender: string | null;
}
export declare enum UserType {
    Admin = 0,
    Trainer = 1,
    Client = 2,
    ExternalClient = 3
}
