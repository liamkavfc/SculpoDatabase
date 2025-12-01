import { Collection } from "../../utils/collection";
// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const { info } = require("firebase-functions/logger");
const { onCall } = require("firebase-functions/v2/https");
// The Firebase Admin SDK to access Firestore.
const { getFirestore } = require("firebase-admin/firestore");
export const fetchDashboardMetrics = onCall({
    // Allow Expo dev tunnel and local emulator origins to call this function
    cors: [
        /https:\/\/.*\.exp\.direct$/, // Expo web tunnel origins
        "http://localhost",
        "http://127.0.0.1",
    ]
}, async (req) => {
    info("fetchDashboardMetrics Invoked", { structuredData: true });
    const dashboardMetricsRequest = req.data;
    info("dashboardMetricsRequest", dashboardMetricsRequest);
    const firestore = getFirestore();
    // Fetch bookings for both clientId and trainerId
    // we need to convert the dates to Date objects
    info("Getting bookings for trainerId", dashboardMetricsRequest.userId);
    let bookings = await firestore.collection(Collection.BOOKINGS).where("trainerId", "==", dashboardMetricsRequest.userId).get();
    bookings = bookings.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    info("bookings", bookings);
    // get client names
    const clients = await firestore.collection(Collection.PROFILES).where("id", "in", bookings.map((booking) => booking.clientId)).get();
    // return array of client id and names
    const clientNames = clients.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().firstName + " " + doc.data().lastName
    }));
    // now add the client names to the bookings
    bookings = bookings.map((booking) => ({
        ...booking,
        clientName: clientNames.find((client) => client.id === booking.clientId)?.name
    }));
    // Upcoming bookings
    // where bookingDate is greater than or equal to today
    const upcomingBookings = bookings.filter((booking) => new Date(booking.bookingDate._seconds * 1000) >= new Date());
    // info("upcomingBookings", upcomingBookings);
    // Bookings in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const lastThirtyDaysBookings = bookings.filter((booking) => {
        const bookingDate = new Date(booking.bookingDate._seconds * 1000);
        info("booking", booking);
        return bookingDate >= thirtyDaysAgo;
    });
    info("fetchDashboardMetrics Response", { structuredData: true });
    return {
        upcomingBookings: upcomingBookings,
        lastThirtyDaysBookings: lastThirtyDaysBookings.length
    };
});
