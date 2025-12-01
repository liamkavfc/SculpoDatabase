/**
 * This file is part of the Sculpo Admin project.
 * It retrieves trainer availability and blocked times via cloud functions.
 */
import { Collection } from "../../utils/collection";

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {info} = require("firebase-functions/logger");
const {onCall} = require("firebase-functions/v2/https");

// The Firebase Admin SDK to access Firestore.
const {getFirestore} = require("firebase-admin/firestore");

export const getTrainerAvailability = onCall(
    {
        // Allow Expo dev tunnel and local emulator origins to call this function
        cors: [
            /https:\/\/.*\.exp\.direct$/, // Expo web tunnel origins
            "http://localhost",
            "http://127.0.0.1",
        ]
    },
    async (req: any) => {
        info("getTrainerAvailability Invoked", {structuredData: true});
        const { trainerId } = req.data;
        info("Getting availability for trainerId:", trainerId);
        
        if (!trainerId) {
            throw new Error("trainerId is required");
        }

        const firestore = getFirestore();

        try {
            // Get weekly availability
            const availabilitySnapshot = await firestore
                .collection(Collection.TRAINER_AVAILABILITY)
                .where("trainerId", "==", trainerId)
                .get();

            const weeklyAvailability = availabilitySnapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Get blocked times
            const blockedTimesSnapshot = await firestore
                .collection(Collection.BLOCKED_TIMES)
                .where("trainerId", "==", trainerId)
                .where("isActive", "==", true)
                .orderBy("date", "asc")
                .get();

            const blockedTimes = blockedTimesSnapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data(),
            }));

            info("Retrieved availability data", {
                weeklyAvailability: weeklyAvailability.length,
                blockedTimes: blockedTimes.length
            });

            return {
                weeklyAvailability,
                blockedTimes
            };
            
        } catch (error) {
            console.error("Error getting trainer availability:", error);
            throw new Error("Failed to get trainer availability");
        }
    });