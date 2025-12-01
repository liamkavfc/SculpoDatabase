// Firebase Cloud function to get all users by trainer id
// Users that have or have had a booking with the trainer
// And External Clients added by the trainer

import { Collection } from "../../utils/collection";

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {info} = require("firebase-functions/logger");
const {onCall} = require("firebase-functions/v2/https");

// The Firebase Admin SDK to access Firestore.
const {getFirestore} = require("firebase-admin/firestore");


export const getUsersByTrainerId = onCall(
    { cors: true },
    async (req: any) => {
        info("getUsersByTrainerId Invoked", {structuredData: true});
        const trainerId = req.data.trainerId;
        const firestore = getFirestore();
        
        // get trainer bookings
        const bookings = await firestore.collection(Collection.BOOKINGS).where("trainerId", "==", trainerId).get();
        // info("bookings", bookings.docs);

        if (bookings.empty) {
            info("No bookings found", {structuredData: true});
            return [];
        }

        // get client ids from bookings
        let clientIds = bookings.docs.map((doc: any) => doc.data().clientId);
        
        // now lets get rid of duplicates
        clientIds = [...new Set(clientIds)];
        info("clientIds", clientIds);
        
        // get users from client ids
        const users = await firestore.collection(Collection.PROFILES).where("userId", "in", clientIds).get();
        info("users", users.docs);

        // now get external users by id
        const externalUsers = await firestore.collection(Collection.PROFILES).where("id", "in", clientIds).get();
        info("externalUsers", externalUsers.docs);

        // now add external users to users
        users.docs.push(...externalUsers.docs);
        info("users", users.docs);
        
        // convert to ProfileListViewModel
        info("getUsersByTrainerId Completed", {structuredData: true});
        return users.docs.map((doc: any) => {
            return {
                id: doc.id,
                ...doc.data()
            }
        });
});
