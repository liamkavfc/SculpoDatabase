/// <summary>
/// TypeScript models for booking and availability management
/// Corresponds to the C# models in ScupoApi
/// </summary>

// Enums
export enum BookingStatus {
    Pending = 0,
    Confirmed = 1,
    InProgress = 2,
    Completed = 3,
    CancelledByClient = 4,
    CancelledByTrainer = 5,
    NoShow = 6,
    Rejected = 7
}

// Booking Models
export interface CreateBookingDto {
    serviceId: string;
    clientId: string;
    trainerId: string;
    bookingDate: Date;
    startTime: Date; // Full DateTime for specific booking time
    endTime: Date;   // Full DateTime for specific booking time
    deliveryFormatId: string;
    deliveryFormatOptionId: string;
    notes?: string;
    clientName?: string; // Add clientName for display purposes
}

export interface BookingViewModel {
    id: string;
    serviceId: string;
    serviceTitle: string;
    clientId: string;
    clientName: string;
    trainerId: string;
    trainerName: string;
    bookingDate: Date;
    startTime: Date; // Changed from string to Date for consistency
    endTime: Date;   // Changed from string to Date for consistency
    status: BookingStatus;
    price: number;
    notes?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface UpdateBookingStatusDto {
    status: BookingStatus;
    notes?: string;
}

// Availability Models
export interface GetAvailabilityDto {
    trainerId: string;
    startDate: Date;
    endDate: Date;
    serviceId?: string;
}

export interface TrainerAvailabilityViewModel {
    trainerId: string;
    trainerName: string;
    date: Date;
    availableSlots: TimeSlotViewModel[];
    busySlots: TimeSlotViewModel[];
}

export interface TimeSlotViewModel {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    reason?: string; // "booked", "blocked", "outside-hours", etc.
    bookingId?: string;
}

export interface NextAvailableSlotsDto {
    trainerId: string;
    serviceId?: string;
    count: number;
}

export interface NextAvailableSlotViewModel {
    date: Date;
    startTime: string;
    endTime: string;
    formattedDate: string;
    formattedTime: string;
}

export interface SetTrainerAvailabilityDto {
    trainerId: string;
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

export interface BlockTimeSlotDto {
    trainerId: string;
    date: Date;
    startTime: string;
    endTime: string;
}

// API Response Types
export interface CreateBookingResponse {
    bookingId: string;
    message: string;
    status: string;
}

export interface BookingErrorResponse {
    error: string;
    message: string;
}

// Frontend-specific models for ServiceView
export interface TimeSlot {
    time: string;
    available: boolean;
    reason?: 'trainer-busy' | 'client-busy' | 'outside-hours';
}

export interface AvailableSlot {
    date: Date;
    time: string;
    formattedDate: string;
    formattedTime: string;
} 