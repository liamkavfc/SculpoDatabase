import { environment } from "../environment";
import axiosInstance from './axiosConfig';
class BookingService {
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
    async createBooking(booking) {
        try {
            const response = await axiosInstance.post(`${this.apiUrl}`, booking);
            return response.data;
        }
        catch (error) {
            // Re-throw with additional context while preserving original error structure
            if (error.response?.data) {
                // Backend returned structured error response
                throw {
                    ...error,
                    validationError: error.response.data
                };
            }
            throw error;
        }
    }
    async getBookingById(bookingId) {
        const response = await axiosInstance.get(`${this.apiUrl}/${bookingId}`);
        return response.data;
    }
    async getUserBookings(userId, status) {
        const url = status ? `${this.apiUrl}/user/${userId}?status=${status}` : `${this.apiUrl}/user/${userId}`;
        const response = await axiosInstance.get(url);
        return response.data;
    }
    async updateBookingStatus(bookingId, statusUpdate) {
        await axiosInstance.put(`${this.apiUrl}/${bookingId}/status`, statusUpdate);
    }
    // Availability Methods
    async getTrainerAvailability(request) {
        const response = await axiosInstance.post(`${this.apiUrl}/availability`, request);
        return response.data;
    }
    async getNextAvailableSlots(request) {
        const response = await axiosInstance.post(`${this.apiUrl}/availability/next`, request);
        return response.data;
    }
    // Trainer Schedule Management
    async setTrainerAvailability(trainerId, availabilities) {
        await axiosInstance.post(`${this.apiUrl}/trainer/${trainerId}/availability`, availabilities);
    }
    async getTrainerWorkingHours(trainerId) {
        const response = await axiosInstance.get(`${this.apiUrl}/trainer/${trainerId}/hours`);
        return response.data;
    }
    async blockTimeSlot(trainerId, blockRequest) {
        await axiosInstance.post(`${this.apiUrl}/trainer/${trainerId}/block`, blockRequest);
    }
    // ServiceView Helper Methods
    // These methods format the API data for the ServiceView component
    async getServiceAvailability(service) {
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
            const nextAvailableSlots = nextSlots.map(slot => ({
                date: new Date(slot.date),
                time: slot.startTime,
                formattedDate: slot.formattedDate,
                formattedTime: slot.formattedTime
            }));
            const timeSlots = [];
            const todayAvailability = availabilityData.find(a => new Date(a.date).toDateString() === today.toDateString());
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
                    let reason = 'trainer-busy';
                    if (slot.reason === 'blocked')
                        reason = 'trainer-busy';
                    else if (slot.reason === 'booked')
                        reason = 'trainer-busy';
                    else if (slot.reason === 'outside-hours')
                        reason = 'outside-hours';
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
        }
        catch (error) {
            console.error('Error fetching service availability:', error);
            return {
                nextAvailableSlots: [],
                timeSlots: [],
                selectedDate: new Date()
            };
        }
    }
    async getAvailabilityForDate(trainerId, date, serviceId) {
        try {
            const availabilityData = await this.getTrainerAvailability({
                trainerId,
                startDate: date,
                endDate: date,
                serviceId
            });
            const timeSlots = [];
            const dayAvailability = availabilityData.find(a => new Date(a.date).toDateString() === date.toDateString());
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
                    let reason = 'trainer-busy';
                    if (slot.reason === 'blocked')
                        reason = 'trainer-busy';
                    else if (slot.reason === 'booked')
                        reason = 'trainer-busy';
                    else if (slot.reason === 'outside-hours')
                        reason = 'outside-hours';
                    timeSlots.push({
                        time: slot.startTime,
                        available: false,
                        reason
                    });
                });
            }
            return timeSlots.sort((a, b) => a.time.localeCompare(b.time));
        }
        catch (error) {
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
     * @param startTime - Start time in HH:MM:SS format
     * @param endTime - End time in HH:MM:SS format
     * @param deliveryFormatId - The delivery format for the service
     * @param deliveryFormatOptionId - The specific delivery format option
     * @param notes - Optional notes for the booking
     * @returns Promise with the created booking ID
     */
    async bookService(serviceId, clientId, trainerId, bookingDate, startTime, endTime, deliveryFormatId, deliveryFormatOptionId, notes) {
        const booking = {
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
    async createBookingRequest(request) {
        return await this.createBooking(request);
    }
}
export default new BookingService();
