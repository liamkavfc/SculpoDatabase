/**
 * This file is part of the Sculpo Admin project.
 * It handles blocking specific time slots for trainers via cloud functions.
 */
import { Collection } from "../../utils/collection";

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {info} = require("firebase-functions/logger");
const {onCall} = require("firebase-functions/v2/https");

// The Firebase Admin SDK to access Firestore.
const {getFirestore} = require("firebase-admin/firestore");

interface BlockTimeSlotRequest {
    trainerId: string;
    date: string; // ISO date string
    startTime: string;
    endTime: string;
    reason?: string;
}

export const blockTimeSlot = onCall(
    {
        // Allow Expo dev tunnel and local emulator origins to call this function
        cors: [
            /https:\/\/.*\.exp\.direct$/, // Expo web tunnel origins
            "http://localhost",
            "http://127.0.0.1",
        ]
    },
    async (req: any) => {
        info("blockTimeSlot Invoked", {structuredData: true});
        const { trainerId, date, startTime, endTime, reason } = req.data as BlockTimeSlotRequest;
        info("Blocking time slot for trainerId:", trainerId, "date:", date);
        
        if (!trainerId || !date || !startTime || !endTime) {
            throw new Error("Missing required fields: trainerId, date, startTime, endTime");
        }

        const firestore = getFirestore();

        try {
            const blockedTimeData = {
                trainerId,
                date: new Date(date),
                startTime,
                endTime,
                reason: reason || "Blocked by trainer",
                createdAt: new Date(),
                isActive: true,
            };

            // Add the blocked time record
            const docRef = await firestore.collection(Collection.BLOCKED_TIMES)
                .add(blockedTimeData);

            info("Time slot blocked successfully", docRef.id);
            return { 
                success: true, 
                message: "Time slot blocked successfully",
                id: docRef.id 
            };
            
        } catch (error) {
            console.error("Error blocking time slot:", error);
            throw new Error("Failed to block time slot");
        }
    });