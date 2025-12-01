import { DeliveryFormatListViewModel, DeliveryFormatOptionListViewModel } from "./deliveryFormatModels";

/**
 * Service pricing/duration type
 * - FixedDuration: Service has a fixed duration (e.g., 1 hour PT session)
 *   The duration is set when creating the service and cannot be changed during booking
 * - VariableDuration: Service duration can vary (e.g., pay per hour, 45 mins PT training)
 *   The trainer/client selects the duration when booking
 */
export enum ServicePricingType {
    FixedDuration = 0,    // Fixed duration service (duration set in service definition)
    VariableDuration = 1  // Variable duration service (duration selected during booking)
}

export interface ServiceFullViewModel {
    id: string;
    title: string;
    overview: string;
    price: number;
    trainerId: string;
    serviceImageUrl?: string; // Main service image
    images?: string[]; // Additional service images
    serviceDetails?: string[]; // Custom service detail pills/tags
    deliveryFormatId: string;
    deliveryFormat: DeliveryFormatListViewModel;
    deliveryFormatOptionId: string;
    deliveryFormatOption: DeliveryFormatOptionListViewModel;
    duration?: number; // Duration in minutes
    // For FixedDuration: this is the fixed duration of the service
    // For VariableDuration: this is the minimum duration (if any) or can be null
    pricingType: ServicePricingType; // FixedDuration or VariableDuration
    // For VariableDuration services, price is typically per hour or per unit of time
    // The final price will be calculated as: price * (selectedDuration / 60) for per-hour pricing
    createdAt: Date;
    updatedAt: Date;
}

export interface ServiceListViewModel {
    id: string;
    title: string;
    overview: string;
    price: number;
    trainerId: string;
    trainerName: string;
    serviceImageUrl: string;
    deliveryFormatId: string;
    deliveryFormat: DeliveryFormatListViewModel;
    deliveryFormatOptionId: string;
    deliveryFormatOption: DeliveryFormatOptionListViewModel;
    duration?: number; // Duration in minutes (for FixedDuration services)
    pricingType: ServicePricingType; // FixedDuration or VariableDuration
} 