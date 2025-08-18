import { DeliveryFormatListViewModel } from "./models/deliverFormatModels";
import { ServiceFullViewModel, ServiceListViewModel } from "./models/servicesModels";
declare class ServicesService {
    private apiUrl;
    constructor();
    getAllServicesByUserId(userId: string): Promise<ServiceListViewModel[]>;
    createService(service: ServiceFullViewModel): Promise<ServiceFullViewModel>;
    getServiceById(serviceId: string): Promise<ServiceFullViewModel>;
    updateService(service: ServiceFullViewModel): Promise<ServiceFullViewModel>;
    getAvailableDeliveryFormats(): Promise<DeliveryFormatListViewModel[]>;
    searchServices(): Promise<ServiceListViewModel[]>;
}
declare const _default: ServicesService;
export default _default;
