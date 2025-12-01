import { Timestamp } from "firebase-admin/firestore";
export declare enum BookingStatus {
    Pending = 0,
    Confirmed = 1,
    InProgress = 2,
    Completed = 3,
    CancelledByClient = 4,
    CancelledByTrainer = 5,
    NoShow = 6,
    Rejected = 7
}
export interface CreateBookingDto {
    serviceId: string;
    clientId: string;
    trainerId: string;
    bookingDate: Date;
    startTime: Date;
    endTime: Date;
    deliveryFormatId: string;
    deliveryFormatOptionId: string;
    notes?: string;
    clientName?: string;
}
export interface BookingViewModel {
    id: string;
    serviceId: string;
    serviceTitle: string;
    clientId: string;
    clientName: string;
    trainerId: string;
    trainerName: string;
    bookingDate: Timestamp;
    startTime: Timestamp;
    endTime: Date;
    status: BookingStatus;
    price: number;
    notes?: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}
export interface UpdateBookingStatusDto {
    status: BookingStatus;
    notes?: string;
}
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
    reason?: string;
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
    dayOfWeek: number;
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
export interface CreateBookingResponse {
    bookingId: string;
    message: string;
    status: string;
}
export interface BookingErrorResponse {
    error: string;
    message: string;
}
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
