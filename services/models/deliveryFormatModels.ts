export interface DeliveryFormatListViewModel {
    id: string;
    type: string;
    options: DeliveryFormatOptionListViewModel[];
}

export interface DeliveryFormatOptionListViewModel {
    id: string;
    parentId: string;
    type: string;
} 