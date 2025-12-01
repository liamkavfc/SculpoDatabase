/**
 * Service initialization utility
 * Initializes all services that require Firestore or other dependencies
 */
import { Firestore } from 'firebase/firestore';
import QuestionnaireService from './questionnaireService';
import ProfileService from './profileService';
import BookingService from './bookingService';
import AvailabilityService from './availabilityService';
import ServicesService from './servicesService';
import DashboardService from './dashboardService';
import ClientService from './clientService';

/**
 * Initialize all services with required dependencies
 * @param db - Firestore database instance
 */
export const initializeServices = (db: Firestore) => {
    // Initialize services that require Firestore
    QuestionnaireService.initialize(db);
    ProfileService.initialize(db);
    BookingService.initialize(db);
    AvailabilityService.initialize(db);
    ServicesService.initialize(db);
    DashboardService.initialize(db);
    ClientService.initialize(db);
};
