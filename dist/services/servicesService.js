import { environment } from "../environment";
import axiosInstance from './axiosConfig';
class ServicesService {
    constructor() {
        this.apiUrl = `${environment.apiUrl}/api/services`;
    }
    async getAllServicesByUserId(userId) {
        console.log("Getting services for user", userId);
        const response = await axiosInstance.get(`${this.apiUrl}/user/${userId}`);
        console.log("response", response.data);
        return response.data;
    }
    async createService(service) {
        console.log(service);
        const response = await axiosInstance.post(`${this.apiUrl}`, service);
        return response.data;
    }
    async getServiceById(serviceId) {
        const response = await axiosInstance.get(`${this.apiUrl}/${serviceId}`);
        return response.data;
    }
    async updateService(service) {
        const response = await axiosInstance.put(`${this.apiUrl}/${service.id}`, service);
        return response.data;
    }
    async getAvailableDeliveryFormats() {
        const response = await axiosInstance.get(`${this.apiUrl}/delivery-formats`);
        return response.data;
    }
    async searchServices() {
        const response = await axiosInstance.get(`${this.apiUrl}/search`);
        return response.data;
    }
}
export default new ServicesService();
