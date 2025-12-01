import { DeliveryFormatListViewModel, DeliveryFormatOptionListViewModel } from "./models/deliveryFormatModels";
import { ServiceFullViewModel, ServiceListViewModel } from "./models/servicesModels";
import { Firestore, collection, query, where, getDocs, doc, getDoc, addDoc, setDoc, serverTimestamp, orderBy, limit, DocumentSnapshot } from 'firebase/firestore';
import { parseFirestoreDate } from './utils/firestoreUtils';

class ServicesService {
    private db: Firestore | null = null;

    /**
     * Initialize the service with a Firestore instance
     * @param db - Firestore database instance
     */
    initialize(db: Firestore) {
        this.db = db;
    }

    /**
     * Helper method to map Firestore data to ServiceFullViewModel
     */
    private async mapToServiceFullViewModel(docId: string, data: any): Promise<ServiceFullViewModel> {
        if (!this.db) {
            throw new Error('ServicesService not initialized. Call initialize(db) first.');
        }

        // Get delivery format details
        let deliveryFormat: DeliveryFormatListViewModel | null = null;
        if (data.deliveryFormatId) {
            try {
                const formatRef = doc(this.db, 'deliveryFormats', data.deliveryFormatId);
                const formatSnapshot = await getDoc(formatRef);
                if (formatSnapshot.exists()) {
                    deliveryFormat = {
                        id: formatSnapshot.id,
                        ...formatSnapshot.data(),
                    } as DeliveryFormatListViewModel;
                }
            } catch (error) {
                console.warn(`Error fetching delivery format for service ${docId}:`, error);
            }
        }

        // Get delivery format option details if available
        let deliveryFormatOption: DeliveryFormatOptionListViewModel | null = null;
        if (data.deliveryFormatOptionId && data.deliveryFormatId) {
            try {
                // Delivery format options are typically subcollections or need to be queried
                // For now, we'll leave it as null - can be enhanced later if needed
            } catch (error) {
                console.warn(`Error fetching delivery format option for service ${docId}:`, error);
            }
        }

        const createdAt = parseFirestoreDate(data.createdAt);
        const updatedAt = parseFirestoreDate(data.updatedAt);

        return {
            id: docId,
            title: data.title || '',
            overview: data.overview || '',
            price: data.price || 0,
            trainerId: data.trainerId || '',
            serviceImageUrl: data.serviceImageUrl || data.image || '',
            images: data.images || [],
            serviceDetails: data.serviceDetails || [],
            deliveryFormatId: data.deliveryFormatId || '',
            deliveryFormat: deliveryFormat || {} as DeliveryFormatListViewModel,
            deliveryFormatOptionId: data.deliveryFormatOptionId || '',
            deliveryFormatOption: deliveryFormatOption,
            duration: data.duration || undefined,
            pricingType: data.pricingType !== undefined ? data.pricingType : 0, // Default to FixedDuration
            createdAt: createdAt || new Date(),
            updatedAt: updatedAt || new Date(),
        } as ServiceFullViewModel;
    }

    /**
     * Get all services for a user (trainer)
     * Uses direct Firestore queries
     * @param userId - User's ID (trainer ID)
     * @returns Array of service list view models
     * @deprecated Use getServicesByTrainerId instead - this method is kept for backward compatibility
     */
    async getAllServicesByUserId(userId: string): Promise<ServiceListViewModel[]> {
        // Delegate to getServicesByTrainerId to avoid code duplication
        return this.getServicesByTrainerId(userId);
    }

    /**
     * Create a new service
     * Uses direct Firestore writes
     * @param service - Service data to create
     * @returns Created service with ID
     */
    async createService(service: ServiceFullViewModel): Promise<ServiceFullViewModel> {
        if (!this.db) {
            throw new Error('ServicesService not initialized. Call initialize(db) first.');
        }

        if (!service.trainerId) {
            throw new Error('trainerId is required to create a service');
        }

        try {
            // Prepare service data for Firestore
            const serviceData: any = {
                title: service.title || '',
                overview: service.overview || '',
                price: service.price || 0,
                trainerId: service.trainerId,
                serviceImageUrl: service.serviceImageUrl || null,
                images: service.images || [],
                serviceDetails: service.serviceDetails || [],
                deliveryFormatId: service.deliveryFormatId || '',
                deliveryFormatOptionId: service.deliveryFormatOptionId || '',
                duration: service.duration || null,
                pricingType: service.pricingType !== undefined ? service.pricingType : 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(this.db, 'services'), serviceData);

            // Return the created service with the new ID
            return {
                ...service,
                id: docRef.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        } catch (error) {
            console.error('Error creating service:', error);
            throw error;
        }
    }

    /**
     * Get a service by ID
     * Uses direct Firestore queries
     * @param serviceId - Service ID to fetch
     * @returns Service full view model or throws error if not found
     */
    async getServiceById(serviceId: string): Promise<ServiceFullViewModel> {
        if (!this.db) {
            throw new Error('ServicesService not initialized. Call initialize(db) first.');
        }

        if (!serviceId) {
            throw new Error('serviceId is required');
        }

        try {
            const serviceRef = doc(this.db, 'services', serviceId);
            const serviceSnapshot = await getDoc(serviceRef);
            
            if (!serviceSnapshot.exists()) {
                throw new Error(`Service with ID ${serviceId} not found`);
            }

            const data = serviceSnapshot.data();
            return await this.mapToServiceFullViewModel(serviceSnapshot.id, data);
        } catch (error) {
            console.error(`Error fetching service ${serviceId}:`, error);
            throw error;
        }
    }

    /**
     * Update an existing service
     * Uses direct Firestore writes
     * @param service - Service data to update
     * @returns Updated service
     */
    async updateService(service: ServiceFullViewModel): Promise<ServiceFullViewModel> {
        if (!this.db) {
            throw new Error('ServicesService not initialized. Call initialize(db) first.');
        }

        if (!service.id) {
            throw new Error('Service ID is required to update a service');
        }

        try {
            const serviceRef = doc(this.db, 'services', service.id);
            
            // Prepare update data (exclude id, createdAt, and computed fields)
            const updateData: any = {
                title: service.title || '',
                overview: service.overview || '',
                price: service.price || 0,
                trainerId: service.trainerId,
                serviceImageUrl: service.serviceImageUrl || null,
                images: service.images || [],
                serviceDetails: service.serviceDetails || [],
                deliveryFormatId: service.deliveryFormatId || '',
                deliveryFormatOptionId: service.deliveryFormatOptionId || '',
                duration: service.duration || null,
                pricingType: service.pricingType !== undefined ? service.pricingType : 0,
                updatedAt: serverTimestamp(),
            };

            await setDoc(serviceRef, updateData, { merge: true });

            // Fetch and return the updated service
            return await this.getServiceById(service.id);
        } catch (error) {
            console.error('Error updating service:', error);
            throw error;
        }
    }

    /**
     * Get all available delivery formats
     * Uses direct Firestore queries
     * @returns Array of delivery format list view models
     */
    async getAvailableDeliveryFormats(): Promise<DeliveryFormatListViewModel[]> {
        if (!this.db) {
            throw new Error('ServicesService not initialized. Call initialize(db) first.');
        }

        try {
            // Try to order by 'name' if it exists, otherwise just get all formats
            let formatsQuery;
            try {
                formatsQuery = query(
                    collection(this.db, 'deliveryFormats'),
                    orderBy('name', 'asc')
                );
            } catch (error) {
                // If orderBy fails (e.g., no index or no 'name' field), just get all formats
                console.warn('Could not order delivery formats by name, fetching without order:', error);
                formatsQuery = query(collection(this.db, 'deliveryFormats'));
            }

            const snapshot = await getDocs(formatsQuery);

            const formats = snapshot.docs.map((docSnapshot) => {
                const data = docSnapshot.data();
                return {
                    id: docSnapshot.id,
                    type: data.type || data.name || '',
                    options: data.options || [],
                } as DeliveryFormatListViewModel;
            });

            // Sort client-side if orderBy failed
            if (formats.length > 0 && !formats[0].type) {
                formats.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
            }

            return formats;
        } catch (error) {
            console.error('Error fetching delivery formats:', error);
            return [];
        }
    }

    /**
     * Search services (can be enhanced with filters)
     * Uses direct Firestore queries
     * @param searchTerm - Optional search term (can be enhanced)
     * @param trainerId - Optional trainer ID filter
     * @returns Array of service list view models
     */
    async searchServices(searchTerm?: string, trainerId?: string): Promise<ServiceListViewModel[]> {
        if (!this.db) {
            throw new Error('ServicesService not initialized. Call initialize(db) first.');
        }

        try {
            let servicesQuery: any = collection(this.db, 'services');

            // Apply filters if provided
            if (trainerId) {
                servicesQuery = query(servicesQuery, where('trainerId', '==', trainerId));
            }

            // Note: Firestore doesn't support full-text search natively
            // For now, we'll return all services (or filtered by trainerId)
            // Can be enhanced with Algolia or similar for full-text search
            const snapshot = await getDocs(servicesQuery);

            const services: ServiceListViewModel[] = await Promise.all(
                snapshot.docs.map(async (docSnapshot) => {
                    const data = docSnapshot.data();

                    // Get trainer name
                    let trainerName = 'Unknown Trainer';
                    if (data.trainerId) {
                        try {
                            const trainerRef = doc(this.db!, 'profiles', data.trainerId);
                            const trainerSnapshot = await getDoc(trainerRef);
                            if (trainerSnapshot.exists()) {
                                const trainerData = trainerSnapshot.data();
                                trainerName = `${trainerData.firstName || ''} ${trainerData.lastName || ''}`.trim() || trainerData.name || 'Unknown Trainer';
                            }
                        } catch (error) {
                            console.warn(`Error fetching trainer name for service ${docSnapshot.id}:`, error);
                        }
                    }

                    // Get delivery format details
                    let deliveryFormat: DeliveryFormatListViewModel | null = null;
                    if (data.deliveryFormatId) {
                        try {
                            const formatRef = doc(this.db!, 'deliveryFormats', data.deliveryFormatId);
                            const formatSnapshot = await getDoc(formatRef);
                            if (formatSnapshot.exists()) {
                                deliveryFormat = {
                                    id: formatSnapshot.id,
                                    ...formatSnapshot.data(),
                                } as DeliveryFormatListViewModel;
                            }
                        } catch (error) {
                            console.warn(`Error fetching delivery format for service ${docSnapshot.id}:`, error);
                        }
                    }

                    // Simple client-side filtering if searchTerm provided
                    const matchesSearch = !searchTerm || 
                        (data.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (data.overview || '').toLowerCase().includes(searchTerm.toLowerCase());

                    if (!matchesSearch) {
                        return null;
                    }

                    return {
                        id: docSnapshot.id,
                        title: data.title || '',
                        overview: data.overview || '',
                        price: data.price || 0,
                        trainerId: data.trainerId || '',
                        trainerName,
                        serviceImageUrl: data.serviceImageUrl || data.image || '',
                        deliveryFormatId: data.deliveryFormatId || '',
                        deliveryFormat: deliveryFormat || {} as DeliveryFormatListViewModel,
                        deliveryFormatOptionId: data.deliveryFormatOptionId || '',
                        deliveryFormatOption: null,
                        duration: data.duration || undefined,
                        pricingType: data.pricingType !== undefined ? data.pricingType : 0,
                    } as ServiceListViewModel;
                })
            );

            // Filter out null results from search filtering
            return services.filter((s): s is ServiceListViewModel => s !== null);
        } catch (error) {
            console.error('Error searching services:', error);
            return [];
        }
    }

    /**
     * Get all services for a trainer
     * Uses direct Firestore queries for better performance
     * @param trainerId - Trainer's user ID
     * @returns Array of services
     */
    async getServicesByTrainerId(trainerId: string): Promise<ServiceListViewModel[]> {
        if (!this.db) {
            throw new Error('ServicesService not initialized. Call initialize(db) first.');
        }

        if (!trainerId) {
            console.warn('getServicesByTrainerId: trainerId is required');
            return [];
        }

        try {
            const servicesQuery = query(
                collection(this.db, 'services'),
                where('trainerId', '==', trainerId)
            );

            const snapshot = await getDocs(servicesQuery);

            const services: ServiceListViewModel[] = await Promise.all(
                snapshot.docs.map(async (docSnapshot: DocumentSnapshot<ServiceListViewModel>) => {
                    const data = docSnapshot.data() as ServiceListViewModel;

                    // Get trainer name
                    let trainerName = 'Unknown Trainer';
                    if (data.trainerId) {
                        try {
                            const trainerRef = doc(this.db!, 'profiles', data.trainerId);
                            const trainerSnapshot = await getDoc(trainerRef);
                            if (trainerSnapshot.exists()) {
                                const trainerData = trainerSnapshot.data();
                                trainerName = `${trainerData.firstName || ''} ${trainerData.lastName || ''}`.trim() || trainerData.name || 'Unknown Trainer';
                            }
                        } catch (error) {
                            console.warn(`Error fetching trainer name for service ${docSnapshot.id}:`, error);
                        }
                    }

                    // Get delivery format details if needed
                    let deliveryFormat: DeliveryFormatListViewModel | null = null;
                    if (data.deliveryFormatId) {
                        try {
                            const formatRef = doc(this.db!, 'deliveryFormats', data.deliveryFormatId);
                            const formatSnapshot = await getDoc(formatRef);
                            if (formatSnapshot.exists()) {
                                deliveryFormat = {
                                    id: formatSnapshot.id,
                                    ...formatSnapshot.data(),
                                } as DeliveryFormatListViewModel;
                            }
                        } catch (error) {
                            console.warn(`Error fetching delivery format for service ${docSnapshot.id}:`, error);
                        }
                    }

                    return {
                        id: docSnapshot.id,
                        title: data.title || '',
                        overview: data.overview || '',
                        price: data.price || 0,
                        trainerId: data.trainerId || '',
                        trainerName,
                        serviceImageUrl: data.serviceImageUrl || data.image || '',
                        deliveryFormatId: data.deliveryFormatId || '',
                        deliveryFormat: deliveryFormat || {} as DeliveryFormatListViewModel,
                        deliveryFormatOptionId: data.deliveryFormatOptionId || '',
                        deliveryFormatOption: null, // Would need additional query
                        duration: data.duration || undefined,
                        pricingType: data.pricingType !== undefined ? data.pricingType : 0, // Default to FixedDuration
                    } as ServiceListViewModel;
                })
            );

            return services;
        } catch (error) {
            console.error('Error fetching services by trainer ID:', error);
            return [];
        }
    }
}

export default new ServicesService(); 