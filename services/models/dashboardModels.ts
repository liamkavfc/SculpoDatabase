import { BookingViewModel } from "./bookingModels";

export interface DashboardMetricsRequest {
    userId: string;
}

export interface DashboardMetricsResponse {
    upcomingBookings: BookingViewModel[];
    lastThirtyDaysBookings: number;
}