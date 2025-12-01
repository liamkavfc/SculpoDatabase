/**
 * DashboardService - Handles dashboard metrics and analytics
 * Uses direct Firestore queries for better performance
 */
import { Firestore, collection, query, where, getDocs, doc, getDoc, orderBy, limit, Timestamp } from 'firebase/firestore';
import { BookingViewModel } from './models/bookingModels';
import { DashboardMetricsResponse } from './models/dashboardModels';
import { parseFirestoreDate } from './utils/firestoreUtils';

class DashboardService {
    private db: Firestore | null = null;

    /**
     * Initialize the service with a Firestore instance
     * @param db - Firestore database instance
     */
    initialize(db: Firestore) {
        this.db = db;
    }

    /**
     * Fetch dashboard metrics for a user
     * Returns upcoming bookings and booking count for the last 30 days
     * @param userId - User ID to get metrics for
     * @returns Dashboard metrics response
     */
    async fetchDashboardMetrics(userId: string): Promise<DashboardMetricsResponse> {
        if (!this.db) {
            throw new Error('DashboardService not initialized. Call initialize(db) first.');
        }

        if (!userId) {
            throw new Error('userId is required');
        }

        try {
            // Get upcoming bookings (today or future)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcomingBookingsQuery = query(
                collection(this.db, 'bookings'),
                where('trainerId', '==', userId),
                where('bookingDate', '>=', today),
                orderBy('bookingDate', 'asc'),
                limit(10)
            );

            const upcomingBookingsSnapshot = await getDocs(upcomingBookingsQuery);

            // Process and enrich bookings
            const upcomingBookings: BookingViewModel[] = await Promise.all(
                upcomingBookingsSnapshot.docs.map(async (docSnapshot) => {
                    const data = docSnapshot.data();

                    // Get service details
                    let serviceTitle = 'Unknown Service';
                    if (data.serviceId) {
                        try {
                            const serviceRef = doc(this.db!, 'services', data.serviceId);
                            const serviceSnapshot = await getDoc(serviceRef);
                            if (serviceSnapshot.exists()) {
                                serviceTitle = serviceSnapshot.data().title || 'Unknown Service';
                            }
                        } catch (error) {
                            console.warn(`Error fetching service for booking ${docSnapshot.id}:`, error);
                        }
                    }

                    // Get client details
                    let clientName = 'Unknown Client';
                    if (data.clientId) {
                        try {
                            const clientRef = doc(this.db!, 'profiles', data.clientId);
                            const clientSnapshot = await getDoc(clientRef);
                            if (clientSnapshot.exists()) {
                                const clientData = clientSnapshot.data();
                                clientName = `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() 
                                    || clientData.name 
                                    || 'Unknown Client';
                            }
                        } catch (error) {
                            console.warn(`Error fetching client for booking ${docSnapshot.id}:`, error);
                        }
                    }

                    // Get trainer details
                    let trainerName = 'Unknown Trainer';
                    if (data.trainerId) {
                        try {
                            const trainerRef = doc(this.db!, 'profiles', data.trainerId);
                            const trainerSnapshot = await getDoc(trainerRef);
                            if (trainerSnapshot.exists()) {
                                const trainerData = trainerSnapshot.data();
                                trainerName = `${trainerData.firstName || ''} ${trainerData.lastName || ''}`.trim() 
                                    || trainerData.name 
                                    || 'Unknown Trainer';
                            }
                        } catch (error) {
                            console.warn(`Error fetching trainer for booking ${docSnapshot.id}:`, error);
                        }
                    }

                    const bookingDate = parseFirestoreDate(data.bookingDate);
                    const startTime = parseFirestoreDate(data.startTime);
                    const endTime = parseFirestoreDate(data.endTime);
                    const createdAt = parseFirestoreDate(data.createdAt);
                    const updatedAt = parseFirestoreDate(data.updatedAt);

                    return {
                        id: docSnapshot.id,
                        bookingDate: bookingDate || new Date(),
                        startTime: startTime || new Date(),
                        endTime: endTime || new Date(),
                        status: data.status || 0,
                        price: data.price || 0,
                        notes: data.notes || '',
                        createdAt: createdAt || new Date(),
                        updatedAt: updatedAt || new Date(),
                        serviceId: data.serviceId || '',
                        serviceTitle,
                        clientId: data.clientId || '',
                        clientName,
                        trainerId: data.trainerId || '',
                        trainerName,
                    } as BookingViewModel;
                })
            );

            // Sort by date
            upcomingBookings.sort((a, b) => 
                new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()
            );

            // Get last 30 days bookings count
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const lastThirtyDaysQuery = query(
                collection(this.db, 'bookings'),
                where('trainerId', '==', userId),
                where('createdAt', '>=', thirtyDaysAgo)
            );

            const lastThirtyDaysSnapshot = await getDocs(lastThirtyDaysQuery);
            const lastThirtyDaysBookings = lastThirtyDaysSnapshot.size;

            return {
                upcomingBookings,
                lastThirtyDaysBookings,
            };
        } catch (error) {
            console.error('Error fetching dashboard metrics:', error);
            throw new Error(`Failed to fetch dashboard metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export default new DashboardService();
