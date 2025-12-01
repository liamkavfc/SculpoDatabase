import { DeliveryFormatListViewModel, DeliveryFormatOptionListViewModel } from "./deliverFormatModels";
export interface ServiceFullViewModel {
    id: string;
    title: string;
    overview: string;
    price: number;
    trainerId: string;
    serviceImageUrl?: string;
    images?: string[];
    serviceDetails?: string[];
    deliveryFormatId: string;
    deliveryFormat: DeliveryFormatListViewModel;
    deliveryFormatOptionId: string;
    deliveryFormatOption: DeliveryFormatOptionListViewModel;
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
}
