import { Collection } from "../../utils/collection";
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const { info } = require("firebase-functions/logger");
const { onCall } = require("firebase-functions/v2/https");
// The Firebase Admin SDK to access Firestore.
const { getFirestore } = require("firebase-admin/firestore");
export const getBookingsByUserId = onCall({
    // Allow Expo dev tunnel and local emulator origins to call this function
    cors: [
        /https:\/\/.*\.exp\.direct$/, // Expo web tunnel origins
        "http://localhost",
        "http://127.0.0.1",
    ]
}, async (req) => {
    info("getBookingsByUserId Invoked", { structuredData: true });
    const { userId } = req.data;
    info("getBookingsByUserId for userId", userId);
    if (!userId) {
        throw new Error("userId is required");
    }
    const firestore = getFirestore();
    // Fetch bookings where user is the trainer
    info("Getting bookings for trainerId", userId);
    let trainerBookings = await firestore.collection(Collection.BOOKINGS).where("trainerId", "==", userId).get();
    trainerBookings = trainerBookings.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    // Fetch bookings where user is the client
    info("Getting bookings for clientId", userId);
    let clientBookings = await firestore.collection(Collection.BOOKINGS).where("clientId", "==", userId).get();
    clientBookings = clientBookings.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    // Combine and deduplicate bookings
    const allBookings = [...trainerBookings];
    clientBookings.forEach((clientBooking) => {
        if (!allBookings.find((booking) => booking.id === clientBooking.id)) {
            allBookings.push(clientBooking);
        }
    });
    info("Total bookings found", allBookings.length);
    // Get client names for bookings where user is trainer
    if (allBookings.length > 0) {
        const clientIds = [...new Set(allBookings.map((booking) => booking.clientId))];
        if (clientIds.length > 0) {
            const clients = await firestore.collection(Collection.PROFILES).where("id", "in", clientIds).get();
            // Return array of client id and names
            const clientNames = clients.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().firstName + " " + doc.data().lastName
            }));
            // Add the client names to the bookings
            allBookings.forEach((booking) => {
                const clientName = clientNames.find((client) => client.id === booking.clientId)?.name;
                if (clientName) {
                    booking.clientName = clientName;
                }
            });
        }
        // Get trainer names for bookings where user is client
        const trainerIds = [...new Set(allBookings.map((booking) => booking.trainerId))];
        if (trainerIds.length > 0) {
            const trainers = await firestore.collection(Collection.PROFILES).where("id", "in", trainerIds).get();
            // Return array of trainer id and names
            const trainerNames = trainers.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().firstName + " " + doc.data().lastName
            }));
            // Add the trainer names to the bookings
            allBookings.forEach((booking) => {
                const trainerName = trainerNames.find((trainer) => trainer.id === booking.trainerId)?.name;
                if (trainerName) {
                    booking.trainerName = trainerName;
                }
            });
        }
    }
    info("getBookingsByUserId Response", { structuredData: true });
    return allBookings;
});
