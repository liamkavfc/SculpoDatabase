/**
 * AvailabilityService - Handles trainer availability and blocked time slots
 * Uses direct Firestore queries for better performance
 */
import { Firestore, collection, query, where, getDocs, doc, setDoc, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { parseFirestoreDate } from './utils/firestoreUtils';

interface WeeklyAvailability {
    id: string;
    trainerId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    updatedAt: Date | null;
}

interface BlockedTime {
    id: string;
    trainerId: string;
    date: Date;
    startTime: string;
    endTime: string;
    reason: string;
    createdAt: Date | null;
    isActive: boolean;
}

interface TrainerAvailabilityResponse {
    weeklyAvailability: WeeklyAvailability[];
    blockedTimes: BlockedTime[];
}

class AvailabilityService {
    private db: Firestore | null = null;

    /**
     * Initialize the service with a Firestore instance
     * @param db - Firestore database instance
     */
    initialize(db: Firestore) {
        this.db = db;
    }

    /**
     * Set trainer weekly availability for a specific day
     * @param trainerId - Trainer's user ID
     * @param dayOfWeek - Day of week (0 = Sunday, 1 = Monday, etc.)
     * @param startTime - Start time (HH:MM format)
     * @param endTime - End time (HH:MM format)
     * @param isAvailable - Whether the trainer is available on this day
     */
    async setTrainerAvailability(
        trainerId: string,
        dayOfWeek: number,
        startTime: string,
        endTime: string,
        isAvailable: boolean
    ): Promise<{ success: boolean; message: string }> {
        if (!this.db) {
            throw new Error('AvailabilityService not initialized. Call initialize(db) first.');
        }

        if (!trainerId || dayOfWeek < 0 || dayOfWeek > 6) {
            throw new Error('Invalid trainerId or dayOfWeek');
        }

        try {
            // Use composite key for unique weekly availability records
            const availabilityId = `${trainerId}_${dayOfWeek}`;
            const availabilityRef = doc(this.db, 'trainerAvailability', availabilityId);

            const availabilityData = {
                trainerId,
                dayOfWeek,
                startTime,
                endTime,
                isAvailable,
                updatedAt: serverTimestamp(),
            };

            await setDoc(availabilityRef, availabilityData, { merge: true });

            return { success: true, message: 'Availability updated successfully' };
        } catch (error) {
            console.error('Error setting trainer availability:', error);
            throw new Error('Failed to set trainer availability');
        }
    }

    /**
     * Block a specific time slot for a trainer
     * @param trainerId - Trainer's user ID
     * @param date - Date to block (ISO date string)
     * @param startTime - Start time (HH:MM format)
     * @param endTime - End time (HH:MM format)
     * @param reason - Optional reason for blocking
     * @returns Blocked time record ID
     */
    async blockTimeSlot(
        trainerId: string,
        date: string,
        startTime: string,
        endTime: string,
        reason?: string
    ): Promise<{ success: boolean; message: string; id: string }> {
        if (!this.db) {
            throw new Error('AvailabilityService not initialized. Call initialize(db) first.');
        }

        if (!trainerId || !date || !startTime || !endTime) {
            throw new Error('Missing required fields: trainerId, date, startTime, endTime');
        }

        try {
            const blockedTimeData = {
                trainerId,
                date: new Date(date),
                startTime,
                endTime,
                reason: reason || 'Blocked by trainer',
                createdAt: serverTimestamp(),
                isActive: true,
            };

            const docRef = await addDoc(collection(this.db, 'blockedTimes'), blockedTimeData);

            return {
                success: true,
                message: 'Time slot blocked successfully',
                id: docRef.id,
            };
        } catch (error) {
            console.error('Error blocking time slot:', error);
            throw new Error('Failed to block time slot');
        }
    }

    /**
     * Get trainer availability (weekly schedule and blocked times)
     * @param trainerId - Trainer's user ID
     * @returns Trainer availability data
     */
    async getTrainerAvailability(trainerId: string): Promise<TrainerAvailabilityResponse> {
        if (!this.db) {
            throw new Error('AvailabilityService not initialized. Call initialize(db) first.');
        }

        if (!trainerId) {
            throw new Error('trainerId is required');
        }

        try {
            // Get weekly availability
            const availabilityQuery = query(
                collection(this.db, 'trainerAvailability'),
                where('trainerId', '==', trainerId)
            );
            const availabilitySnapshot = await getDocs(availabilityQuery);

            const weeklyAvailability: WeeklyAvailability[] = availabilitySnapshot.docs.map((docSnapshot) => {
                const data = docSnapshot.data();
                const updatedAt = parseFirestoreDate(data.updatedAt);

                return {
                    id: docSnapshot.id,
                    trainerId: data.trainerId || '',
                    dayOfWeek: data.dayOfWeek ?? 0,
                    startTime: data.startTime || '',
                    endTime: data.endTime || '',
                    isAvailable: data.isAvailable !== false,
                    updatedAt,
                };
            });

            // Get blocked times (active only)
            const blockedTimesQuery = query(
                collection(this.db, 'blockedTimes'),
                where('trainerId', '==', trainerId),
                where('isActive', '==', true),
                orderBy('date', 'asc')
            );
            const blockedTimesSnapshot = await getDocs(blockedTimesQuery);

            const blockedTimes: BlockedTime[] = blockedTimesSnapshot.docs.map((docSnapshot) => {
                const data = docSnapshot.data();
                const date = parseFirestoreDate(data.date);
                const createdAt = parseFirestoreDate(data.createdAt);

                return {
                    id: docSnapshot.id,
                    trainerId: data.trainerId || '',
                    date: date || new Date(),
                    startTime: data.startTime || '',
                    endTime: data.endTime || '',
                    reason: data.reason || 'Blocked by trainer',
                    createdAt,
                    isActive: data.isActive !== false,
                };
            });

            return {
                weeklyAvailability,
                blockedTimes,
            };
        } catch (error) {
            console.error('Error getting trainer availability:', error);
            throw new Error('Failed to get trainer availability');
        }
    }

    /**
     * Get next available time slots for a trainer
     * This is a simplified version - for complex slot calculation, consider using the API
     * @param trainerId - Trainer's user ID
     * @param count - Number of slots to return (default: 3)
     * @param serviceId - Optional service ID for service-specific availability
     * @returns Array of available slot information
     */
    async getNextAvailableSlots(
        trainerId: string,
        count: number = 3,
        serviceId?: string
    ): Promise<any[]> {
        if (!this.db) {
            throw new Error('AvailabilityService not initialized. Call initialize(db) first.');
        }

        if (!trainerId) {
            throw new Error('trainerId is required');
        }

        try {
            // Get trainer availability
            const availability = await this.getTrainerAvailability(trainerId);

            // Get upcoming bookings to find gaps
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcomingBookingsQuery = query(
                collection(this.db, 'bookings'),
                where('trainerId', '==', trainerId),
                where('bookingDate', '>=', today),
                orderBy('bookingDate', 'asc'),
                limit(50) // Get enough to find gaps
            );

            const bookingsSnapshot = await getDocs(upcomingBookingsQuery);
            const bookings = bookingsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Simple implementation: return next available slots based on weekly availability
            // This is a basic version - for full implementation, calculate based on:
            // - Weekly availability schedule
            // - Blocked times
            // - Existing bookings
            // - Service duration if serviceId provided

            const slots: any[] = [];
            const maxSearchDays = 30;
            let searchDate = new Date(today);
            searchDate.setDate(searchDate.getDate() + 1); // Start from tomorrow

            for (let day = 0; day < maxSearchDays && slots.length < count; day++) {
                const dayOfWeek = searchDate.getDay();
                const dayAvailability = availability.weeklyAvailability.find(
                    (avail) => avail.dayOfWeek === dayOfWeek && avail.isAvailable
                );

                if (dayAvailability) {
                    // Check if this day has blocked times
                    const dayBlockedTimes = availability.blockedTimes.filter((blocked) => {
                        const blockedDate = blocked.date instanceof Date 
                            ? blocked.date 
                            : new Date(blocked.date);
                        return blockedDate.toDateString() === searchDate.toDateString();
                    });

                    // Check if this day has bookings
                    const dayBookings = bookings.filter((booking: any) => {
                        const bookingDate = parseFirestoreDate(booking.bookingDate);
                        return bookingDate?.toDateString() === searchDate.toDateString();
                    });

                    // If no conflicts, add a slot
                    if (dayBlockedTimes.length === 0 && dayBookings.length === 0) {
                        slots.push({
                            date: searchDate.toISOString(),
                            startTime: dayAvailability.startTime,
                            endTime: dayAvailability.endTime,
                            formattedDate: searchDate.toLocaleDateString('en-GB', { 
                                day: 'numeric', 
                                month: 'short' 
                            }),
                            formattedTime: dayAvailability.startTime,
                        });
                    }
                }

                searchDate.setDate(searchDate.getDate() + 1);
            }

            return slots.slice(0, count);
        } catch (error) {
            console.error('Error getting next available slots:', error);
            return [];
        }
    }
}

export default new AvailabilityService();
