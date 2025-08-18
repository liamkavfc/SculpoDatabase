import { environment } from "../environment";
import axiosInstance from './axiosConfig';
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

class BookingService {

    private apiUrl: string;

    constructor() {
        this.apiUrl = `${environment.apiUrl}/api/booking`;
    }

    // Booking Management Methods

    /**
     * Create a new booking with comprehensive validation
     * @param booking - The booking data to create
     * @returns Promise with booking creation response
     * @throws BookingValidationException with specific error codes for validation failures
     */
    async createBooking(booking: CreateBookingDto): Promise<CreateBookingResponse> {
        try {
            const response = await axiosInstance.post<CreateBookingResponse>(`${this.apiUrl}`, booking);
            return response.data;
        } catch (error: any) {
            // Re-throw with additional context while preserving original error structure
            if (error.response?.data) {
                // Backend returned structured error response
                throw {
                    ...error,
                    validationError: error.response.data as BookingErrorResponse
                };
            }
            throw error;
        }
    }

    async getBookingById(bookingId: string): Promise<BookingViewModel> {
        const response = await axiosInstance.get<BookingViewModel>(`${this.apiUrl}/${bookingId}`);
        return response.data;
    }

    async getUserBookings(userId: string, status?: string): Promise<BookingViewModel[]> {
        const url = status ? `${this.apiUrl}/user/${userId}?status=${status}` : `${this.apiUrl}/user/${userId}`;
        const response = await axiosInstance.get<BookingViewModel[]>(url);
        return response.data;
    }

    /**
     * Get all bookings (admin only) with optional filtering
     * @param status - Optional status filter
     * @param trainerId - Optional trainer filter
     * @param clientId - Optional client filter
     * @param startDate - Optional start date filter
     * @param endDate - Optional end date filter
     * @returns Promise with array of all bookings
     */
    async getAllBookings(filters?: {
        status?: string;
        trainerId?: string;
        clientId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<BookingViewModel[]> {
        let url = `${this.apiUrl}/admin/all`;
        const params = new URLSearchParams();
        
        if (filters?.status) params.append('status', filters.status);
        if (filters?.trainerId) params.append('trainerId', filters.trainerId);
        if (filters?.clientId) params.append('clientId', filters.clientId);
        if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
        if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        const response = await axiosInstance.get<BookingViewModel[]>(url);
        return response.data;
    }

    async updateBookingStatus(bookingId: string, statusUpdate: UpdateBookingStatusDto): Promise<void> {
        await axiosInstance.put(`${this.apiUrl}/${bookingId}/status`, statusUpdate);
    }

    // Availability Methods

    async getTrainerAvailability(request: GetAvailabilityDto): Promise<TrainerAvailabilityViewModel[]> {
        const response = await axiosInstance.post<TrainerAvailabilityViewModel[]>(`${this.apiUrl}/availability`, request);
        return response.data;
    }

    async getNextAvailableSlots(request: NextAvailableSlotsDto): Promise<NextAvailableSlotViewModel[]> {
        const response = await axiosInstance.post<NextAvailableSlotViewModel[]>(`${this.apiUrl}/availability/next`, request);
        return response.data;
    }

    // Trainer Schedule Management

    async setTrainerAvailability(trainerId: string, availabilities: SetTrainerAvailabilityDto[]): Promise<void> {
        await axiosInstance.post(`${this.apiUrl}/trainer/${trainerId}/availability`, availabilities);
    }

    async getTrainerWorkingHours(trainerId: string): Promise<SetTrainerAvailabilityDto[]> {
        const response = await axiosInstance.get<SetTrainerAvailabilityDto[]>(`${this.apiUrl}/trainer/${trainerId}/hours`);
        return response.data;
    }

    async blockTimeSlot(trainerId: string, blockRequest: BlockTimeSlotDto): Promise<void> {
        await axiosInstance.post(`${this.apiUrl}/trainer/${trainerId}/block`, blockRequest);
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
}

export default new BookingService(); 