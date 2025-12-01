// Export all services
export { default as AdminService } from './adminService';
export { default as AuthService } from './authService';
export { default as BookingService } from './bookingService';
export { default as ClientService } from './clientService';
export { default as ProfileService } from './profileService';
export { default as ServicesService } from './servicesService';
export { default as GoalsService } from './goalsService';
export { default as QuestionnaireService } from './questionnaireService';
export { default as AvailabilityService } from './availabilityService';
export { default as DashboardService } from './dashboardService';
export { default as axiosInstance } from './axiosConfig';

// Export service initialization utility
export { initializeServices } from './initializeServices';

// Export Firebase functions utility (deprecated - use direct Firestore queries instead)
export { callFunction, initializeFirebaseFunctions } from './firebaseFunctions';

// Export all models
export * from './models/bookingModels';
export * from './models/deliveryFormatModels';
export * from './models/servicesModels';
export * from './models/onboardingQuestionnaireModels';
export * from './models/goalsModels';
export * from './models/dashboardModels';

// Export questionnaire service types
export type { QuestionnaireAnswer } from './questionnaireService';

// Export interfaces from profileService
export type { 
    ProfileListViewModel, 
    ProfileFullViewModel,
    CreateClientProfileDto,
    ExtendedProfileInfo
} from './profileService';

// Export enum as value
export { UserType } from './profileService';

// Export interfaces from authService
export type { 
    LoginDto, 
    LoginResponseDto,
    RegisterDto,
    RegisterResponseDto
} from './authService'; 