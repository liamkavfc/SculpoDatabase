import { CreateBookingDto, BookingViewModel, UpdateBookingStatusDto, GetAvailabilityDto, TrainerAvailabilityViewModel, NextAvailableSlotsDto, NextAvailableSlotViewModel, SetTrainerAvailabilityDto, BlockTimeSlotDto, TimeSlot, AvailableSlot, CreateBookingResponse } from "./models/bookingModels";
import { ServiceFullViewModel } from "./models/servicesModels";
declare class BookingService {
    private apiUrl;
    constructor();
    /**
     * Create a new booking with comprehensive validation
     * @param booking - The booking data to create
     * @returns Promise with booking creation response
     * @throws BookingValidationException with specific error codes for validation failures
     */
    createBooking(booking: CreateBookingDto): Promise<CreateBookingResponse>;
    getBookingById(bookingId: string): Promise<BookingViewModel>;
    getUserBookings(userId: string, status?: string): Promise<BookingViewModel[]>;
    updateBookingStatus(bookingId: string, statusUpdate: UpdateBookingStatusDto): Promise<void>;
    getTrainerAvailability(request: GetAvailabilityDto): Promise<TrainerAvailabilityViewModel[]>;
    getNextAvailableSlots(request: NextAvailableSlotsDto): Promise<NextAvailableSlotViewModel[]>;
    setTrainerAvailability(trainerId: string, availabilities: SetTrainerAvailabilityDto[]): Promise<void>;
    getTrainerWorkingHours(trainerId: string): Promise<SetTrainerAvailabilityDto[]>;
    blockTimeSlot(trainerId: string, blockRequest: BlockTimeSlotDto): Promise<void>;
    getServiceAvailability(service: ServiceFullViewModel): Promise<{
        nextAvailableSlots: AvailableSlot[];
        timeSlots: TimeSlot[];
        selectedDate: Date;
    }>;
    getAvailabilityForDate(trainerId: string, date: Date, serviceId?: string): Promise<TimeSlot[]>;
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
    bookService(serviceId: string, clientId: string, trainerId: string, bookingDate: Date, startTime: string, endTime: string, deliveryFormatId: string, deliveryFormatOptionId: string, notes?: string): Promise<string>;
    /**
     * Create a booking with comprehensive request data
     * This is the main method that client apps should use for booking creation
     * @param request - Complete booking request with all required fields
     * @returns Promise with the booking creation response
     */
    createBookingRequest(request: CreateBookingDto): Promise<CreateBookingResponse>;
}
declare const _default: BookingService;
export default _default;
