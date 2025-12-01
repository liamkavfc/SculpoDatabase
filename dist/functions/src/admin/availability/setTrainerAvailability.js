/**
 * This file is part of the Sculpo Admin project.
 * It handles setting trainer weekly availability via cloud functions.
 */
import { Collection } from "../../utils/collection";
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const { info } = require("firebase-functions/logger");
const { onCall } = require("firebase-functions/v2/https");
// The Firebase Admin SDK to access Firestore.
const { getFirestore } = require("firebase-admin/firestore");
export const setTrainerAvailability = onCall({
    // Allow Expo dev tunnel and local emulator origins to call this function
    cors: [
        /https:\/\/.*\.exp\.direct$/, // Expo web tunnel origins
        "http://localhost",
        "http://127.0.0.1",
    ]
}, async (req) => {
    info("setTrainerAvailability Invoked", { structuredData: true });
    const { trainerId, dayOfWeek, startTime, endTime, isAvailable } = req.data;
    info("Setting availability for trainerId:", trainerId, "day:", dayOfWeek);
    if (!trainerId || dayOfWeek < 0 || dayOfWeek > 6) {
        throw new Error("Invalid trainerId or dayOfWeek");
    }
    const firestore = getFirestore();
    try {
        // Use composite key for unique weekly availability records
        const availabilityId = `${trainerId}_${dayOfWeek}`;
        const availabilityData = {
            trainerId,
            dayOfWeek,
            startTime,
            endTime,
            isAvailable,
            updatedAt: new Date(),
        };
        // Set or update the availability record
        await firestore.collection(Collection.TRAINER_AVAILABILITY)
            .doc(availabilityId)
            .set(availabilityData, { merge: true });
        info("Trainer availability updated successfully", availabilityId);
        return { success: true, message: "Availability updated successfully" };
    }
    catch (error) {
        console.error("Error setting trainer availability:", error);
        throw new Error("Failed to set trainer availability");
    }
});
