import { Firestore, collection, query, where, getDocs, Timestamp, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

class ProfileService {
    private db: Firestore | null = null;

    /**
     * Initialize the service with a Firestore instance
     * @param db - Firestore database instance
     */
    initialize(db: Firestore) {
        this.db = db;
    }

    /**
     * Create a new profile
     * Uses direct Firestore writes
     * @param profile - Profile data to create
     * @returns Created profile ID
     */
    async create(profile: ProfileFullViewModel): Promise<string> {
        if (!this.db) {
            throw new Error('ProfileService not initialized. Call initialize(db) first.');
        }

        if (!profile.userId) {
            throw new Error('userId is required to create a profile');
        }

        try {
            // Use userId as the document ID for profiles
            const profileRef = doc(this.db, 'profiles', profile.userId);
            
            const profileData: any = {
                userId: profile.userId,
                email: profile.email || '',
                firstName: profile.name?.split(' ')[0] || '',
                lastName: profile.name?.split(' ').slice(1).join(' ') || '',
                name: profile.name || '',
                phoneNumber: profile.phoneNumber || null,
                userType: profile.userType || UserType.Client,
                image: profile.image || null,
                dateOfBirth: profile.dateOfBirth || null,
                gender: profile.gender || null,
                location: profile.location || null,
                about: profile.about || null,
                qualifications: profile.qualifications || null,
                specialisms: profile.specialisms || null,
                gyms: profile.gyms || null,
                height: profile.height || null,
                weight: profile.weight || null,
                bmi: profile.bmi || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await setDoc(profileRef, profileData);

            return profile.userId;
        } catch (error) {
            console.error('Error creating profile:', error);
            throw error;
        }
    }

    /**
     * Create a client profile
     * Uses direct Firestore writes
     * @param clientData - Client profile data
     * @returns Created profile ID (userId)
     */
    async createClientProfile(clientData: CreateClientProfileDto): Promise<string> {
        if (!this.db) {
            throw new Error('ProfileService not initialized. Call initialize(db) first.');
        }

        if (!clientData.userId) {
            throw new Error('userId is required to create a client profile');
        }

        try {
            const profileRef = doc(this.db, 'profiles', clientData.userId);
            
            const profileData: any = {
                userId: clientData.userId,
                email: clientData.email,
                firstName: clientData.firstName,
                lastName: clientData.lastName,
                name: `${clientData.firstName} ${clientData.lastName}`,
                phoneNumber: clientData.tel || null,
                userType: UserType.Client,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await setDoc(profileRef, profileData);

            return clientData.userId;
        } catch (error) {
            console.error('Error creating client profile:', error);
            throw error;
        }
    }

    /**
     * Update an existing profile
     * Uses direct Firestore writes
     * @param id - Profile ID (userId or document ID)
     * @param profile - Updated profile data
     */
    async update(id: string, profile: ProfileFullViewModel): Promise<void> {
        if (!this.db) {
            throw new Error('ProfileService not initialized. Call initialize(db) first.');
        }

        if (!id) {
            throw new Error('Profile ID is required to update a profile');
        }

        try {
            const profileRef = doc(this.db, 'profiles', id);
            
            // Prepare update data (exclude id, createdAt, and computed fields)
            const updateData: any = {
                email: profile.email || '',
                firstName: profile.name?.split(' ')[0] || '',
                lastName: profile.name?.split(' ').slice(1).join(' ') || '',
                name: profile.name || '',
                phoneNumber: profile.phoneNumber || null,
                userType: profile.userType || UserType.Client,
                image: profile.image || null,
                dateOfBirth: profile.dateOfBirth || null,
                gender: profile.gender || null,
                location: profile.location || null,
                about: profile.about || null,
                qualifications: profile.qualifications || null,
                specialisms: profile.specialisms || null,
                gyms: profile.gyms || null,
                height: profile.height || null,
                weight: profile.weight || null,
                bmi: profile.bmi || null,
                updatedAt: serverTimestamp(),
            };

            await setDoc(profileRef, updateData, { merge: true });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    /**
     * Update extended profile information (height, weight, gender, BMI)
     * Uses direct Firestore writes
     * @param userId - User's Firebase Auth ID
     * @param extendedInfo - Extended profile information
     */
    async updateExtendedInfo(userId: string, extendedInfo: ExtendedProfileInfo): Promise<void> {
        if (!this.db) {
            throw new Error('ProfileService not initialized. Call initialize(db) first.');
        }

        if (!userId) {
            throw new Error('userId is required');
        }

        try {
            // First get the current profile
            const currentProfile = await this.getByUserId(userId);
            if (!currentProfile) {
                throw new Error('Profile not found');
            }

            // Calculate BMI if height and weight are provided
            let bmi: number | null = null;
            if (extendedInfo.height && extendedInfo.weight) {
                // BMI = weight (kg) / (height (m))^2
                const heightInMeters = extendedInfo.height / 100; // Convert cm to meters
                bmi = extendedInfo.weight / (heightInMeters * heightInMeters);
                bmi = Math.round(bmi * 10) / 10; // Round to 1 decimal place
            }

            // Update the profile with extended information
            const updatedProfile: ProfileFullViewModel = {
                ...currentProfile,
                height: extendedInfo.height,
                weight: extendedInfo.weight,
                gender: extendedInfo.gender || currentProfile.gender,
                bmi: bmi,
            };

            await this.update(currentProfile.id, updatedProfile);
        } catch (error) {
            console.error('Error updating extended profile info:', error);
            throw error;
        }
    }
    

    /**
     * Get all profiles
     * Uses direct Firestore queries
     * @returns Array of profile list view models
     */
    async getAll(): Promise<ProfileListViewModel[]> {
        if (!this.db) {
            throw new Error('ProfileService not initialized. Call initialize(db) first.');
        }

        try {
            const profilesQuery = query(collection(this.db, 'profiles'));
            const snapshot = await getDocs(profilesQuery);

            return snapshot.docs.map((docSnapshot) => {
                const data = docSnapshot.data();
                return this.mapToProfileListViewModel(docSnapshot.id, data);
            });
        } catch (error) {
            console.error('Error fetching all profiles:', error);
            return [];
        }
    }

    /**
     * Get profile by document ID
     * Uses direct Firestore queries
     * @param id - Profile document ID
     * @returns Profile full view model or null if not found
     */
    async getById(id: string): Promise<ProfileFullViewModel | null> {
        if (!this.db) {
            throw new Error('ProfileService not initialized. Call initialize(db) first.');
        }

        if (!id) {
            return null;
        }

        try {
            const profileRef = doc(this.db, 'profiles', id);
            const profileSnapshot = await getDoc(profileRef);

            if (!profileSnapshot.exists()) {
                return null;
            }

            const data = profileSnapshot.data();
            return this.mapToProfileFullViewModel(profileSnapshot.id, data);
        } catch (error) {
            console.error('Error fetching profile by ID:', error);
            return null;
        }
    }

    /**
     * Get profile by userId
     * Uses direct Firestore queries
     * @param userId - User's Firebase Auth ID
     * @returns Profile full view model or null if not found
     */
    async getByUserId(userId: string): Promise<ProfileFullViewModel | null> {
        if (!this.db) {
            throw new Error('ProfileService not initialized. Call initialize(db) first.');
        }

        if (!userId) {
            return null;
        }

        try {
            // Try to get profile by document ID (userId is typically the document ID)
            const profileRef = doc(this.db, 'profiles', userId);
            const profileSnapshot = await getDoc(profileRef);

            if (profileSnapshot.exists()) {
                const data = profileSnapshot.data();
                return this.mapToProfileFullViewModel(profileSnapshot.id, data);
            }

            // If not found by document ID, try querying by userId field
            const profilesQuery = query(
                collection(this.db, 'profiles'),
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(profilesQuery);

            if (!querySnapshot.empty) {
                const docSnapshot = querySnapshot.docs[0];
                const data = docSnapshot.data();
                return this.mapToProfileFullViewModel(docSnapshot.id, data);
            }

            return null;
        } catch (error) {
            console.error('Error fetching profile by userId:', error);
            return null;
        }
    }

    /**
     * Get all external clients
     * Uses direct Firestore queries
     * @returns Array of external client profiles
     */
    async getExternalClients(): Promise<ProfileListViewModel[]> {
        if (!this.db) {
            throw new Error('ProfileService not initialized. Call initialize(db) first.');
        }

        try {
            const externalClientsQuery = query(
                collection(this.db, 'profiles'),
                where('userType', '==', UserType.ExternalClient)
            );
            const snapshot = await getDocs(externalClientsQuery);
            return snapshot.docs.map((docSnapshot) => {
                const data = docSnapshot.data();
                return this.mapToProfileListViewModel(docSnapshot.id, data);
            });
        } catch (error) {
            console.error('Error fetching external clients from Firestore:', error);
            return [];
        }
    }

    /**
     * Create an external client profile
     * External clients don't have Firebase Auth accounts
     * @param clientData - Client data to create
     * @returns Created client profile ID
     */
    async createExternalClient(clientData: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
        trainerId?: string;
    }): Promise<{ id: string }> {
        if (!this.db) {
            throw new Error('ProfileService not initialized. Call initialize(db) first.');
        }

        if (!clientData.firstName || !clientData.lastName || !clientData.email) {
            throw new Error('firstName, lastName, and email are required');
        }

        try {
            const profileData = {
                userId: '', // External clients don't have userId
                email: clientData.email,
                firstName: clientData.firstName,
                lastName: clientData.lastName,
                name: `${clientData.firstName} ${clientData.lastName}`,
                phoneNumber: clientData.phoneNumber || null,
                userType: UserType.ExternalClient,
                trainerId: clientData.trainerId || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(this.db, 'profiles'), profileData);
            return { id: docRef.id };
        } catch (error) {
            console.error('Error creating external client:', error);
            throw error;
        }
    }

    /**
     * Get all users (clients) associated with a trainer
     * This includes users who have bookings with the trainer and external clients added by the trainer
     * Uses direct Firestore queries for better performance
     * @param trainerId - The trainer's user ID
     * @returns Array of profile list view models
     */
    async getUsersByTrainerId(trainerId: string): Promise<ProfileListViewModel[]> {
        if (!this.db) {
            throw new Error('ProfileService not initialized. Call initialize(db) first.');
        }

        if (!trainerId) {
            console.warn('getUsersByTrainerId: trainerId is required');
            return [];
        }

        try {
            // Step 1: Get all bookings for this trainer
            const bookingsQuery = query(
                collection(this.db, 'bookings'),
                where('trainerId', '==', trainerId)
            );

            const bookingsSnapshot = await getDocs(bookingsQuery);

            if (bookingsSnapshot.empty) {
                console.log('No bookings found for trainer:', trainerId);
                return [];
            }

            // Step 2: Extract unique client IDs from bookings
            const clientIds = [...new Set(
                bookingsSnapshot.docs.map((doc) => doc.data().clientId).filter(Boolean)
            )];

            console.log(`[getUsersByTrainerId] Found ${clientIds.length} unique client IDs from bookings:`, clientIds);

            if (clientIds.length === 0) {
                console.log('No client IDs found in bookings');
                return [];
            }

            // Firestore 'in' queries are limited to 10 items, so we need to batch if needed
            const batchSize = 10;
            const profilePromises: Promise<ProfileListViewModel[]>[] = [];

            // Step 3: Get profiles by userId (for regular clients)
            // Note: clientId in bookings could be either userId OR document ID
            for (let i = 0; i < clientIds.length; i += batchSize) {
                const batch = clientIds.slice(i, i + batchSize);
                const profilesQuery = query(
                    collection(this.db, 'profiles'),
                    where('userId', 'in', batch)
                );
                profilePromises.push(
                    getDocs(profilesQuery).then((snapshot) => {
                        const profiles = snapshot.docs.map((doc) => {
                            const data = doc.data();
                            const profile = this.mapToProfileListViewModel(doc.id, data);
                            console.log(`[getUsersByTrainerId] Found profile by userId: ${profile.id} (${profile.email}) - userId: ${data.userId}`);
                            return profile;
                        });
                        return profiles;
                    })
                );
            }

            // Step 4: Get profiles by document ID (for external clients who don't have userId)
            // External clients have their profile ID as the clientId in bookings
            // We need to track which profiles we've already found to avoid duplicates
            const foundProfileIds = new Set<string>();
            const foundProfileEmails = new Set<string>(); // Also track by email for additional deduplication
            
            // First, collect all profiles found by userId query
            const userIdProfiles = await Promise.all(profilePromises);
            const userIdProfilesFlat = userIdProfiles.flat();
            userIdProfilesFlat.forEach((profile) => {
                foundProfileIds.add(profile.id);
                if (profile.email) {
                    foundProfileEmails.add(profile.email.toLowerCase());
                }
            });

            console.log(`[getUsersByTrainerId] Found ${userIdProfilesFlat.length} profiles by userId query`);
            console.log(`[getUsersByTrainerId] Found profile IDs:`, Array.from(foundProfileIds));
            console.log(`[getUsersByTrainerId] Found profile emails:`, Array.from(foundProfileEmails));

            // Now get external clients (profiles by document ID that weren't already found)
            // External clients are identified by: they don't have a userId OR their document ID is used as clientId in bookings
            const externalProfilePromises = clientIds
                .filter((clientId) => !foundProfileIds.has(clientId)) // Skip if already found by ID
                .map((clientId) => {
                    const profileRef = doc(this.db, 'profiles', clientId);
                    return getDoc(profileRef).then((docSnapshot) => {
                        if (docSnapshot.exists()) {
                            const data = docSnapshot.data();
                            const profile = this.mapToProfileListViewModel(docSnapshot.id, data);
                            
                            // Double-check: if this profile ID was already found, skip it
                            if (foundProfileIds.has(profile.id)) {
                                console.log(`[getUsersByTrainerId] Skipping - profile ${profile.id} already found by userId query`);
                                return null;
                            }
                            
                            // External clients don't have a userId (or have empty userId)
                            // If it has a userId, it means it's a regular client and should have been found by the userId query
                            // Only include if it's truly an external client (no userId)
                            if (!data.userId || data.userId === '') {
                                console.log(`[getUsersByTrainerId] Found external client by document ID: ${profile.id} (${profile.email}) - userId: none`);
                                if (profile.email) {
                                    foundProfileEmails.add(profile.email.toLowerCase());
                                }
                                return profile;
                            } else {
                                // This profile has a userId, so it's a regular client
                                // It should have been found by the userId query, but if it wasn't,
                                // it means the clientId in booking is the document ID, not the userId
                                // This is a data inconsistency - the booking should use userId, not document ID
                                // For now, we'll skip it to avoid duplicates, but log a warning
                                console.log(`[getUsersByTrainerId] Skipping profile ${profile.id} (${profile.email}) - has userId ${data.userId} but wasn't found by userId query`);
                                console.log(`[getUsersByTrainerId] This suggests a data inconsistency: booking uses document ID ${clientId} but profile has userId ${data.userId}`);
                                console.log(`[getUsersByTrainerId] The booking should use userId ${data.userId} as clientId, not document ID ${clientId}`);
                                return null;
                            }
                        }
                        return null;
                    }).catch((error) => {
                        console.warn(`[getUsersByTrainerId] Error fetching profile ${clientId}:`, error);
                        return null;
                    });
                });

            const externalProfiles = await Promise.all(externalProfilePromises);
            const validExternalProfiles = externalProfiles.filter(
                (p): p is ProfileListViewModel => {
                    if (p === null) return false;
                    // Skip if we already have this exact profile by ID (shouldn't happen due to filter, but double-check)
                    if (foundProfileIds.has(p.id)) {
                        console.log(`[getUsersByTrainerId] Skipping duplicate by ID: ${p.id} (${p.email})`);
                        return false;
                    }
                    // For external clients, we allow them even if email matches a regular client
                    // because they're separate entities. Only skip if it's the same document ID.
                    // Email-based deduplication is too aggressive for external clients.
                    return true;
                }
            );

            console.log(`[getUsersByTrainerId] Found ${validExternalProfiles.length} external profiles by document ID`);

            // Step 5: Combine all results and remove duplicates by ID only
            // We use ID-based deduplication only, because:
            // - External clients might legitimately have the same email as regular clients
            // - The same profile should only appear once (same document ID)
            const allProfiles = [...userIdProfilesFlat, ...validExternalProfiles];
            const profilesMapById = new Map<string, ProfileListViewModel>();

            allProfiles.forEach((profile) => {
                // Use document ID as the key for deduplication
                if (!profilesMapById.has(profile.id)) {
                    profilesMapById.set(profile.id, profile);
                } else {
                    console.log(`[getUsersByTrainerId] Duplicate detected by ID: ${profile.id} (${profile.email}) - keeping first occurrence`);
                }
            });

            const uniqueProfiles = Array.from(profilesMapById.values());

            console.log(`[getUsersByTrainerId] Final result: ${uniqueProfiles.length} unique users for trainer ${trainerId}`);
            uniqueProfiles.forEach((p) => {
                console.log(`  - ${p.id}: ${p.firstName} ${p.lastName} (${p.email}) - Type: ${p.userType}`);
            });
            
            return uniqueProfiles;
        } catch (error) {
            console.error('Error fetching users by trainer ID:', error);
            return [];
        }
    }

    /**
     * Map Firestore document data to ProfileFullViewModel
     */
    private mapToProfileFullViewModel(id: string, data: any): ProfileFullViewModel {
        // Parse dates if they exist
        const parseDate = (value: any): Date | null => {
            if (!value) return null;
            if (value instanceof Date) return value;
            if (value instanceof Timestamp) return value.toDate();
            if (value?.toDate && typeof value.toDate === 'function') return value.toDate();
            if (value?._seconds) return new Date(value._seconds * 1000);
            if (typeof value === 'string') {
                const parsed = new Date(value);
                return isNaN(parsed.getTime()) ? null : parsed;
            }
            return null;
        };

        // Handle name field - could be in 'name' field or constructed from firstName/lastName
        let firstName = data.firstName || '';
        let lastName = data.lastName || '';
        let name = data.name || '';
        
        // If no name but we have firstName/lastName, construct it
        if (!name && (firstName || lastName)) {
            name = `${firstName} ${lastName}`.trim();
        }
        
        // If no firstName/lastName but we have a 'name' field, try to parse it
        if ((!firstName && !lastName) && name) {
            const nameParts = name.trim().split(/\s+/);
            if (nameParts.length > 0) {
                firstName = nameParts[0];
                if (nameParts.length > 1) {
                    lastName = nameParts.slice(1).join(' ');
                }
            }
        }

        return {
            id,
            userId: data.userId || id, // userId might be the document ID
            email: data.email || '',
            name: name || `${firstName} ${lastName}`.trim() || '',
            phoneNumber: data.phoneNumber || null,
            userType: this.parseUserType(data.userType),
            image: data.image || null,
            dateOfBirth: parseDate(data.dateOfBirth),
            gender: data.gender || null,
            location: data.location || null,
            about: data.about || null,
            qualifications: data.qualifications || null,
            specialisms: data.specialisms || null,
            gyms: data.gyms || null,
            newPassword: null, // Never return password
            height: data.height || null,
            weight: data.weight || null,
            bmi: data.bmi || null,
        };
    }

    /**
     * Map Firestore document data to ProfileListViewModel
     */
    private mapToProfileListViewModel(id: string, data: any): ProfileListViewModel {
        // Parse dates if they exist
        const parseDate = (value: any): Date | null => {
            if (!value) return null;
            if (value instanceof Date) return value;
            if (value instanceof Timestamp) return value.toDate();
            if (value?.toDate && typeof value.toDate === 'function') return value.toDate();
            if (value?._seconds) return new Date(value._seconds * 1000);
            if (typeof value === 'string') {
                const parsed = new Date(value);
                return isNaN(parsed.getTime()) ? null : parsed;
            }
            return null;
        };

        // Handle name field - could be in 'name' field or constructed from firstName/lastName
        let firstName = data.firstName || '';
        let lastName = data.lastName || '';
        
        // If no firstName/lastName but we have a 'name' field, try to parse it
        if ((!firstName && !lastName) && data.name) {
            const nameParts = data.name.trim().split(/\s+/);
            if (nameParts.length > 0) {
                firstName = nameParts[0];
                if (nameParts.length > 1) {
                    lastName = nameParts.slice(1).join(' ');
                }
            }
        }

        return {
            id,
            email: data.email || '',
            firstName: firstName,
            lastName: lastName,
            userType: this.parseUserType(data.userType),
        };
    }

    /**
     * Parse user type from various formats
     */
    private parseUserType(userType: any): UserType {
        if (typeof userType === 'number') {
            return userType as UserType;
        }
        if (typeof userType === 'string') {
            const numeric = Number(userType);
            if (!isNaN(numeric)) {
                return numeric as UserType;
            }
            // Try to match enum key
            const key = userType as keyof typeof UserType;
            if (UserType[key] !== undefined) {
                return UserType[key] as UserType;
            }
        }
        return UserType.Client; // Default
    }
}

export default new ProfileService();

export interface ProfileListViewModel {
  id: string;
  email: string;
  firstName: string;    
  lastName: string;
  userType: UserType;
}

export interface ProfileFullViewModel {
    id: string;
    image: string | null;
    name: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    location: string | null;
    email: string | null;
    phoneNumber: string | null;
    userType: UserType;
    about: string | null;
    qualifications: string | null;
    specialisms: string | null;
    gyms: string | null;
    newPassword: string | null;
    userId: string;
    height: number | null; // Height in centimeters
    weight: number | null; // Weight in kilograms
    bmi: number | null; // Calculated BMI (read-only)
}

export interface CreateClientProfileDto {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    tel: string;
}

export interface ExtendedProfileInfo {
    height: number | null; // Height in centimeters
    weight: number | null; // Weight in kilograms
    gender: string | null; // 'Male', 'Female', 'Other', or null
}

export enum UserType {
    Admin,
    Trainer,
    Client,
    ExternalClient
} 