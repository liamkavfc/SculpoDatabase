import { environment } from "../environment";
import axiosInstance from './axiosConfig';
import { DeliveryFormatListViewModel } from "./models/deliverFormatModels";
import { ServiceFullViewModel, ServiceListViewModel } from "./models/servicesModels";

class ServicesService {

    private apiUrl: string;

    constructor() {
        this.apiUrl = `${environment.apiUrl}/api/services`;
    }

    async getAllServicesByUserId(userId: string): Promise<ServiceListViewModel[]> {
        console.log("Getting services for user", userId);
        const response = await axiosInstance.get<ServiceListViewModel[]>(`${this.apiUrl}/user/${userId}`);
        console.log("response", response.data);
        return response.data;
    }

    async createService(service: ServiceFullViewModel): Promise<ServiceFullViewModel> {
        console.log(service);
        const response = await axiosInstance.post<ServiceFullViewModel>(`${this.apiUrl}`, service);
        return response.data;
    }

    async getServiceById(serviceId: string): Promise<ServiceFullViewModel> {
        const response = await axiosInstance.get<ServiceFullViewModel>(`${this.apiUrl}/${serviceId}`);
        return response.data;
    }

    async updateService(service: ServiceFullViewModel): Promise<ServiceFullViewModel> {
        const response = await axiosInstance.put<ServiceFullViewModel>(`${this.apiUrl}/${service.id}`, service);
        return response.data;
    }

    async getAvailableDeliveryFormats(): Promise<DeliveryFormatListViewModel[]> {
        const response = await axiosInstance.get<DeliveryFormatListViewModel[]>(`${this.apiUrl}/delivery-formats`);
        return response.data;
    }

    async searchServices(): Promise<ServiceListViewModel[]> {
        const response = await axiosInstance.get<ServiceListViewModel[]>(`${this.apiUrl}/search`);
        return response.data;
    }
}

export default new ServicesService(); 