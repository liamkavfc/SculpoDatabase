import { 
    CreateBookingDto, 
    BookingViewModel, 
    UpdateBookingStatusDto,
    GetAvailabilityDto,
    TrainerAvailabilityViewModel,
    NextAvailableSlotsDto,
    NextAvailableSlotViewModel,
    SetTrainerAvailabilityDto,
    BlockTimeSlotDto,
    TimeSlot,
    AvailableSlot,
    CreateBookingResponse,
    BookingErrorResponse
} from "./models/bookingModels";
import { ServiceFullViewModel } from "./models/servicesModels";
import { Firestore, collection, query, where, getDocs, doc, getDoc, addDoc, setDoc, serverTimestamp, Timestamp, orderBy } from 'firebase/firestore';
import { parseFirestoreDate, parseBookingDateTime } from './utils/firestoreUtils';
import { AvailabilityService } from './availabilityService';

class BookingService {
    private db: Firestore | null = null;

    /**
     * Initialize the service with a Firestore instance
     * @param db - Firestore database instance
     */
    initialize(db: Firestore) {
        this.db = db;
    }

    // ========================================
    // DEPRECATED API METHODS - Use Firestore methods below
    // ========================================

    /**
     * @deprecated Use createBookingInFirestore() instead
     * Create a new booking with comprehensive validation
     */
    async createBooking(booking: CreateBookingDto): Promise<CreateBookingResponse> {
        console.warn('createBooking() is deprecated. Use createBookingInFirestore() instead.');
        return this.createBookingInFirestore(booking);
    }

    /**
     * @deprecated Use getBookingById() Firestore method instead
     */
    async getBookingByIdOld(bookingId: string): Promise<BookingViewModel> {
        console.warn('getBookingByIdOld() is deprecated. Use getBookingById() instead.');
        return this.getBookingById(bookingId);
    }

    /**
     * @deprecated Use getBookingsByUserId() instead
     */
    async getUserBookings(userId: string, status?: string): Promise<BookingViewModel[]> {
        console.warn('getUserBookings() is deprecated. Use getBookingsByUserId() instead.');
        const bookings = await this.getBookingsByUserId(userId);
        if (status) {
            return bookings.filter(b => b.status.toString() === status);
        }
        return bookings;
    }

    /**
     * @deprecated Use Firestore queries instead
     * Get all bookings (admin only) with optional filtering
     */
    async getAllBookings(filters?: {
        status?: string;
        trainerId?: string;
        clientId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<BookingViewModel[]> {
        console.warn('getAllBookings() is deprecated. Use direct Firestore queries instead.');
        if (!this.db) {
            throw new Error('BookingService not initialized. Call initialize(db) first.');
        }

        try {
            let bookingsQuery: any = collection(this.db, 'bookings');

            // Apply filters
            if (filters?.trainerId) {
                bookingsQuery = query(bookingsQuery, where('trainerId', '==', filters.trainerId));
            }
            if (filters?.clientId) {
                bookingsQuery = query(bookingsQuery, where('clientId', '==', filters.clientId));
            }
            if (filters?.startDate) {
                bookingsQuery = query(bookingsQuery, where('bookingDate', '>=', filters.startDate));
            }
            if (filters?.endDate) {
                bookingsQuery = query(bookingsQuery, where('bookingDate', '<=', filters.endDate));
            }

            const snapshot = await getDocs(bookingsQuery);
            let bookings = snapshot.docs.map((docSnapshot) => {
                const data = docSnapshot.data();
                const bookingDate = parseFirestoreDate(data.bookingDate);
                const startTime = parseFirestoreDate(data.startTime);
                const endTime = parseFirestoreDate(data.endTime);
                const createdAt = parseFirestoreDate(data.createdAt);
                const updatedAt = parseFirestoreDate(data.updatedAt);

                return {
                    id: docSnapshot.id,
                    ...data,
                    bookingDate: bookingDate || new Date(),
                    startTime: startTime || new Date(),
                    endTime: endTime || new Date(),
                    createdAt: createdAt || new Date(),
                    updatedAt: updatedAt || new Date(),
                } as BookingViewModel;
            });

            // Filter by status client-side if provided
            if (filters?.status) {
                bookings = bookings.filter(b => b.status.toString() === filters.status);
            }

            return bookings;
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            return [];
        }
    }

    /**
     * @deprecated Use AvailabilityService.getTrainerAvailability() instead
     */
    async getTrainerAvailability(request: GetAvailabilityDto): Promise<TrainerAvailabilityViewModel[]> {
        console.warn('getTrainerAvailability() is deprecated. Use AvailabilityService.getTrainerAvailability() instead.');
        // This is a complex method that would need significant refactoring
        // For now, delegate to AvailabilityService if available
        throw new Error('This method is deprecated. Use AvailabilityService.getTrainerAvailability() instead.');
    }

    /**
     * @deprecated Use AvailabilityService.getNextAvailableSlots() instead
     */
    async getNextAvailableSlots(request: NextAvailableSlotsDto): Promise<NextAvailableSlotViewModel[]> {
        console.warn('getNextAvailableSlots() is deprecated. Use AvailabilityService.getNextAvailableSlots() instead.');
        return AvailabilityService.getNextAvailableSlots(request.trainerId, request.count || 3, request.serviceId);
    }

    /**
     * @deprecated Use AvailabilityService.setTrainerAvailability() instead
     */
    async setTrainerAvailability(trainerId: string, availabilities: SetTrainerAvailabilityDto[]): Promise<void> {
        console.warn('setTrainerAvailability() is deprecated. Use AvailabilityService.setTrainerAvailability() instead.');
        // Convert array format to individual calls
        for (const availability of availabilities) {
            await AvailabilityService.setTrainerAvailability(
                trainerId,
                availability.dayOfWeek,
                availability.startTime,
                availability.endTime,
                availability.isAvailable
            );
        }
    }

    /**
     * @deprecated Use AvailabilityService.getTrainerAvailability() instead
     */
    async getTrainerWorkingHours(trainerId: string): Promise<SetTrainerAvailabilityDto[]> {
        console.warn('getTrainerWorkingHours() is deprecated. Use AvailabilityService.getTrainerAvailability() instead.');
        const availability = await AvailabilityService.getTrainerAvailability(trainerId);
        return availability.weeklyAvailability.map(avail => ({
            trainerId: avail.trainerId,
            dayOfWeek: avail.dayOfWeek,
            startTime: avail.startTime,
            endTime: avail.endTime,
            isAvailable: avail.isAvailable,
        }));
    }

    /**
     * @deprecated Use AvailabilityService.blockTimeSlot() instead
     */
    async blockTimeSlot(trainerId: string, blockRequest: BlockTimeSlotDto): Promise<void> {
        console.warn('blockTimeSlot() is deprecated. Use AvailabilityService.blockTimeSlot() instead.');
        const dateStr = blockRequest.date instanceof Date 
            ? blockRequest.date.toISOString().split('T')[0] 
            : blockRequest.date;
        await AvailabilityService.blockTimeSlot(
            trainerId,
            dateStr,
            blockRequest.startTime,
            blockRequest.endTime,
            blockRequest.reason
        );
    }

    // ServiceView Helper Methods
    // These methods format the API data for the ServiceView component

    async getServiceAvailability(service: ServiceFullViewModel): Promise<{
        nextAvailableSlots: AvailableSlot[];
        timeSlots: TimeSlot[];
        selectedDate: Date;
    }> {
        try {
            // TODO: Get trainerId from service
            const trainerId = service.trainerId; // This should come from the service data
            
            // Get next 3 available slots
            const nextSlots = await this.getNextAvailableSlots({
                trainerId,
                serviceId: service.id,
                count: 3
            });

            // Get availability for today
            const today = new Date();
            const availabilityData = await this.getTrainerAvailability({
                trainerId,
                startDate: today,
                endDate: today,
                serviceId: service.id
            });

            // Convert API data to frontend format
            const nextAvailableSlots: AvailableSlot[] = nextSlots.map(slot => ({
                date: new Date(slot.date),
                time: slot.startTime,
                formattedDate: slot.formattedDate,
                formattedTime: slot.formattedTime
            }));

            const timeSlots: TimeSlot[] = [];
            const todayAvailability = availabilityData.find(a => 
                new Date(a.date).toDateString() === today.toDateString()
            );

            if (todayAvailability) {
                // Add available slots
                todayAvailability.availableSlots.forEach(slot => {
                    timeSlots.push({
                        time: slot.startTime,
                        available: true
                    });
                });

                // Add busy slots
                todayAvailability.busySlots.forEach(slot => {
                    let reason: 'trainer-busy' | 'client-busy' | 'outside-hours' = 'trainer-busy';
                    if (slot.reason === 'blocked') reason = 'trainer-busy';
                    else if (slot.reason === 'booked') reason = 'trainer-busy';
                    else if (slot.reason === 'outside-hours') reason = 'outside-hours';

                    timeSlots.push({
                        time: slot.startTime,
                        available: false,
                        reason
                    });
                });
            }

            return {
                nextAvailableSlots,
                timeSlots: timeSlots.sort((a, b) => a.time.localeCompare(b.time)),
                selectedDate: today
            };

        } catch (error) {
            console.error('Error fetching service availability:', error);
            return {
                nextAvailableSlots: [],
                timeSlots: [],
                selectedDate: new Date()
            };
        }
    }

    async getAvailabilityForDate(trainerId: string, date: Date, serviceId?: string): Promise<TimeSlot[]> {
        try {
            const availabilityData = await this.getTrainerAvailability({
                trainerId,
                startDate: date,
                endDate: date,
                serviceId
            });

            const timeSlots: TimeSlot[] = [];
            const dayAvailability = availabilityData.find(a => 
                new Date(a.date).toDateString() === date.toDateString()
            );

            if (dayAvailability) {
                // Add available slots
                dayAvailability.availableSlots.forEach(slot => {
                    timeSlots.push({
                        time: slot.startTime,
                        available: true
                    });
                });

                // Add busy slots
                dayAvailability.busySlots.forEach(slot => {
                    let reason: 'trainer-busy' | 'client-busy' | 'outside-hours' = 'trainer-busy';
                    if (slot.reason === 'blocked') reason = 'trainer-busy';
                    else if (slot.reason === 'booked') reason = 'trainer-busy';
                    else if (slot.reason === 'outside-hours') reason = 'outside-hours';

                    timeSlots.push({
                        time: slot.startTime,
                        available: false,
                        reason
                    });
                });
            }

            return timeSlots.sort((a, b) => a.time.localeCompare(b.time));

        } catch (error) {
            console.error('Error fetching availability for date:', error);
            return [];
        }
    }

    /**
     * Book a service with delivery format information
     * @param serviceId - The service to book
     * @param clientId - The client making the booking
     * @param trainerId - The trainer providing the service
     * @param bookingDate - The date of the booking
     * @param startTime - Start time as DateTime
     * @param endTime - End time as DateTime
     * @param deliveryFormatId - The delivery format for the service
     * @param deliveryFormatOptionId - The specific delivery format option
     * @param notes - Optional notes for the booking
     * @returns Promise with the created booking ID
     */
    async bookService(
        serviceId: string, 
        clientId: string, 
        trainerId: string, 
        bookingDate: Date, 
        startTime: Date,    // Changed from string to Date
        endTime: Date,      // Changed from string to Date
        deliveryFormatId: string,
        deliveryFormatOptionId: string,
        notes?: string
    ): Promise<string> {
        const booking: CreateBookingDto = {
            serviceId,
            clientId,
            trainerId,
            bookingDate,
            startTime,
            endTime,
            deliveryFormatId,
            deliveryFormatOptionId,
            notes
        };

        const result = await this.createBooking(booking);
        return result.bookingId;
    }

    /**
     * Create a booking with comprehensive request data
     * This is the main method that client apps should use for booking creation
     * @param request - Complete booking request with all required fields
     * @returns Promise with the booking creation response
     */
    async createBookingRequest(request: CreateBookingDto): Promise<CreateBookingResponse> {
        return await this.createBooking(request);
    }

    // ========================================
    // FIRESTORE-BASED METHODS (Direct Queries)
    // ========================================

    /**
     * Get all bookings for a user (as trainer or client)
     * Uses direct Firestore queries for better performance
     * @param userId - User ID to get bookings for
     * @returns Array of bookings with enriched client/trainer names
     */
    async getBookingsByUserId(userId: string): Promise<BookingViewModel[]> {
        if (!this.db) {
            throw new Error('BookingService not initialized. Call initialize(db) first.');
        }

        if (!userId) {
            console.warn('getBookingsByUserId: userId is required');
            return [];
        }

        try {
            // Fetch bookings where user is the trainer
            const bookingsCollection = collection(this.db, 'bookings');
            
            const trainerBookingsQuery = query(
                bookingsCollection,
                where('trainerId', '==', userId)
            );
            const trainerBookingsSnapshot = await getDocs(trainerBookingsQuery);

            // Fetch bookings where user is the client
            const clientBookingsQuery = query(
                bookingsCollection,
                where('clientId', '==', userId)
            );
            const clientBookingsSnapshot = await getDocs(clientBookingsQuery);

            // Combine and deduplicate bookings
            const bookingsMap = new Map<string, any>();

            // Process trainer bookings
            trainerBookingsSnapshot.docs.forEach((docSnapshot) => {
                const data = docSnapshot.data();
                bookingsMap.set(docSnapshot.id, {
                    id: docSnapshot.id,
                    ...data,
                });
            });

            // Process client bookings (avoid duplicates)
            clientBookingsSnapshot.docs.forEach((docSnapshot) => {
                if (!bookingsMap.has(docSnapshot.id)) {
                    const data = docSnapshot.data();
                    bookingsMap.set(docSnapshot.id, {
                        id: docSnapshot.id,
                        ...data,
                    });
                }
            });

            const allBookings = Array.from(bookingsMap.values());

            // Enrich bookings with client names, trainer names, and service titles
            if (allBookings.length > 0) {
                // Get unique client IDs
                const clientIds = [...new Set(allBookings.map((b: any) => b.clientId).filter(Boolean))];
                // Get unique trainer IDs
                const trainerIds = [...new Set(allBookings.map((b: any) => b.trainerId).filter(Boolean))];
                // Get unique service IDs
                const serviceIds = [...new Set(allBookings.map((b: any) => b.serviceId).filter(Boolean))];

                // Fetch client profiles using document references
                const clientNamesMap = new Map<string, string>();
                const clientPromises = clientIds.map(async (clientId) => {
                    try {
                        const clientRef = doc(this.db!, 'profiles', clientId);
                        const clientSnapshot = await getDoc(clientRef);
                        if (clientSnapshot.exists()) {
                            const data = clientSnapshot.data();
                            const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name || 'Unknown';
                            return { id: clientId, name };
                        }
                        return null;
                    } catch (error) {
                        console.warn(`Error fetching client profile ${clientId}:`, error);
                        return null;
                    }
                });
                const clientResults = await Promise.all(clientPromises);
                clientResults.forEach((result) => {
                    if (result) {
                        clientNamesMap.set(result.id, result.name);
                    }
                });

                // Fetch trainer profiles using document references
                const trainerNamesMap = new Map<string, string>();
                const trainerPromises = trainerIds.map(async (trainerId) => {
                    try {
                        const trainerRef = doc(this.db!, 'profiles', trainerId);
                        const trainerSnapshot = await getDoc(trainerRef);
                        if (trainerSnapshot.exists()) {
                            const data = trainerSnapshot.data();
                            const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name || 'Unknown';
                            return { id: trainerId, name };
                        }
                        return null;
                    } catch (error) {
                        console.warn(`Error fetching trainer profile ${trainerId}:`, error);
                        return null;
                    }
                });
                const trainerResults = await Promise.all(trainerPromises);
                trainerResults.forEach((result) => {
                    if (result) {
                        trainerNamesMap.set(result.id, result.name);
                    }
                });

                // Fetch service titles using document references
                const serviceTitlesMap = new Map<string, string>();
                const servicePromises = serviceIds.map(async (serviceId) => {
                    try {
                        const serviceRef = doc(this.db!, 'services', serviceId);
                        const serviceSnapshot = await getDoc(serviceRef);
                        if (serviceSnapshot.exists()) {
                            const data = serviceSnapshot.data();
                            const title = data.title || 'Unknown Service';
                            return { id: serviceId, title };
                        }
                        return null;
                    } catch (error) {
                        console.warn(`Error fetching service ${serviceId}:`, error);
                        return null;
                    }
                });
                const serviceResults = await Promise.all(servicePromises);
                serviceResults.forEach((result) => {
                    if (result) {
                        serviceTitlesMap.set(result.id, result.title);
                    }
                });

                // Add names and service titles to bookings
                allBookings.forEach((booking: any) => {
                    if (booking.clientId && clientNamesMap.has(booking.clientId)) {
                        booking.clientName = clientNamesMap.get(booking.clientId);
                    } else if (booking.clientId) {
                        booking.clientName = booking.clientName || 'Unknown Client';
                    }
                    
                    if (booking.trainerId && trainerNamesMap.has(booking.trainerId)) {
                        booking.trainerName = trainerNamesMap.get(booking.trainerId);
                    } else if (booking.trainerId) {
                        booking.trainerName = booking.trainerName || 'Unknown Trainer';
                    }
                    
                    if (booking.serviceId && serviceTitlesMap.has(booking.serviceId)) {
                        booking.serviceTitle = serviceTitlesMap.get(booking.serviceId);
                    } else if (booking.serviceId) {
                        booking.serviceTitle = booking.serviceTitle || 'Unknown Service';
                    } else {
                        booking.serviceTitle = booking.serviceTitle || 'Unknown Service';
                    }
                });
            }

            // Parse dates in bookings
            const processedBookings: BookingViewModel[] = allBookings.map((booking: any) => {
                const bookingDate = parseFirestoreDate(booking.bookingDate);
                const startTime = parseBookingDateTime(booking, 'startTime');
                const endTime = parseBookingDateTime(booking, 'endTime');
                const createdAt = parseFirestoreDate(booking.createdAt);
                const updatedAt = parseFirestoreDate(booking.updatedAt);

                return {
                    ...booking,
                    bookingDate: bookingDate || new Date(),
                    startTime: startTime || new Date(),
                    endTime: endTime || new Date(),
                    createdAt: createdAt || new Date(),
                    updatedAt: updatedAt || new Date(),
                } as BookingViewModel;
            });

            return processedBookings;
        } catch (error) {
            console.error('Error fetching bookings by user ID:', error);
            return [];
        }
    }

    /**
     * Send booking confirmation email
     * Creates an email record in Firestore for processing
     * @param bookingId - The booking ID to confirm
     */
    async sendBookingConfirmation(bookingId: string): Promise<void> {
        if (!this.db) {
            throw new Error('BookingService not initialized. Call initialize(db) first.');
        }

        if (!bookingId) {
            throw new Error('bookingId is required');
        }

        try {
            // Get booking
            const bookingRef = doc(this.db, 'bookings', bookingId);
            const bookingSnapshot = await getDoc(bookingRef);

            if (!bookingSnapshot.exists()) {
                throw new Error('Booking not found');
            }

            const bookingData = bookingSnapshot.data();

            // Get client profile
            const clientRef = doc(this.db, 'profiles', bookingData.clientId);
            const clientSnapshot = await getDoc(clientRef);

            if (!clientSnapshot.exists()) {
                throw new Error('Client not found');
            }

            // Get trainer profile
            const trainerRef = doc(this.db, 'profiles', bookingData.trainerId);
            const trainerSnapshot = await getDoc(trainerRef);

            if (!trainerSnapshot.exists()) {
                throw new Error('Trainer not found');
            }

            const trainerData = trainerSnapshot.data();
            const trainerName = `${trainerData.firstName || ''} ${trainerData.lastName || ''}`.trim() || trainerData.name || 'Trainer';

            // Create email record
            await addDoc(collection(this.db, 'mail'), {
                to: 'lksoftwaredevelopment@outlook.com', // TODO: Use actual client email
                message: {
                    subject: 'Booking Confirmation',
                    text: 'Your booking has been confirmed',
                    html: `<p>Your booking has been confirmed by ${trainerName}</p>`,
                },
                createdAt: serverTimestamp(),
            });

            console.log(`Booking confirmation email queued for booking ${bookingId}`);
        } catch (error) {
            console.error('Error sending booking confirmation:', error);
            throw error;
        }
    }

    /**
     * Create a booking directly in Firestore
     * @param bookingData - Booking data to create
     * @returns Created booking ID
     */
    async createBookingInFirestore(bookingData: any): Promise<{ bookingId: string }> {
        if (!this.db) {
            throw new Error('BookingService not initialized. Call initialize(db) first.');
        }

        try {
            const bookingDoc = {
                ...bookingData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(this.db, 'bookings'), bookingDoc);
            return { bookingId: docRef.id };
        } catch (error) {
            console.error('Error creating booking in Firestore:', error);
            throw error;
        }
    }

    /**
     * Get a booking by ID with enriched data
     * @param bookingId - Booking ID to fetch
     * @returns Booking view model with client and trainer names
     */
    async getBookingById(bookingId: string): Promise<BookingViewModel | null> {
        if (!this.db) {
            throw new Error('BookingService not initialized. Call initialize(db) first.');
        }

        if (!bookingId) {
            throw new Error('bookingId is required');
        }

        try {
            const bookingRef = doc(this.db, 'bookings', bookingId);
            const bookingSnapshot = await getDoc(bookingRef);

            if (!bookingSnapshot.exists()) {
                return null;
            }

            const data = bookingSnapshot.data();

            // Get service details
            let serviceTitle = 'Unknown Service';
            if (data.serviceId) {
                try {
                    const serviceRef = doc(this.db, 'services', data.serviceId);
                    const serviceSnapshot = await getDoc(serviceRef);
                    if (serviceSnapshot.exists()) {
                        serviceTitle = serviceSnapshot.data().title || 'Unknown Service';
                    }
                } catch (error) {
                    console.warn(`Error fetching service for booking ${bookingId}:`, error);
                }
            }

            // Get client details
            let clientName = 'Unknown Client';
            if (data.clientId) {
                try {
                    const clientRef = doc(this.db, 'profiles', data.clientId);
                    const clientSnapshot = await getDoc(clientRef);
                    if (clientSnapshot.exists()) {
                        const clientData = clientSnapshot.data();
                        clientName = `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() 
                            || clientData.name 
                            || 'Unknown Client';
                    }
                } catch (error) {
                    console.warn(`Error fetching client for booking ${bookingId}:`, error);
                }
            }

            // Get trainer details
            let trainerName = 'Unknown Trainer';
            if (data.trainerId) {
                try {
                    const trainerRef = doc(this.db, 'profiles', data.trainerId);
                    const trainerSnapshot = await getDoc(trainerRef);
                    if (trainerSnapshot.exists()) {
                        const trainerData = trainerSnapshot.data();
                        trainerName = `${trainerData.firstName || ''} ${trainerData.lastName || ''}`.trim() 
                            || trainerData.name 
                            || 'Unknown Trainer';
                    }
                } catch (error) {
                    console.warn(`Error fetching trainer for booking ${bookingId}:`, error);
                }
            }

            const bookingDate = parseFirestoreDate(data.bookingDate);
            const startTime = parseFirestoreDate(data.startTime);
            const endTime = parseFirestoreDate(data.endTime);
            const createdAt = parseFirestoreDate(data.createdAt);
            const updatedAt = parseFirestoreDate(data.updatedAt);

            return {
                id: bookingSnapshot.id,
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
        } catch (error) {
            console.error('Error fetching booking by ID:', error);
            throw error;
        }
    }

    /**
     * Update booking status
     * @param bookingId - Booking ID to update
     * @param statusUpdate - Status update data
     */
    async updateBookingStatus(bookingId: string, statusUpdate: UpdateBookingStatusDto): Promise<void> {
        if (!this.db) {
            throw new Error('BookingService not initialized. Call initialize(db) first.');
        }

        if (!bookingId) {
            throw new Error('bookingId is required');
        }

        try {
            const bookingRef = doc(this.db, 'bookings', bookingId);
            const updateData: any = {
                status: statusUpdate.status,
                updatedAt: serverTimestamp(),
            };

            if (statusUpdate.notes) {
                updateData.notes = statusUpdate.notes;
            }

            await setDoc(bookingRef, updateData, { merge: true });
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    }
}

export default new BookingService(); 