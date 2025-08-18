/**
 * This file is part of the Sculpo Admin project.
 * It is repsonsible for fetching dashboard metrics from firebase via cloud functions.
 */

import { onCall } from "firebase-functions/https";
import { BookingViewModel, DashboardMetricsRequest } from "../../../services"; // Import BookingViewModel and DashboardMetricsRequest
import { getFirestore } from "firebase-admin/firestore";

export const fetchDashboardMetrics = onCall(
    { cors: ["54nqvew-liamksoftware-8081.exp.direct"] },
    async (req: any) => {
        console.log("fetchDashboardMetrics Invoked", {structuredData: true});
        const dashboardMetricsRequest = req.data as DashboardMetricsRequest;
        const firestore = getFirestore();

        // Fetch bookings for both clientId and trainerId
        const bookingsSnapshot = await firestore.collection("bookings").where("trainerId", "==", dashboardMetricsRequest.userId).get();

        const bookings = bookingsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        })) as BookingViewModel[];

        // Upcoming bookings
        const upcomingBookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.bookingDate);
            return bookingDate >= new Date(); // Filter for bookings in the future
        });

        // Bookings in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const lastThirtyDaysBookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.bookingDate);
            return bookingDate >= thirtyDaysAgo;
        });
        console.log("fetchDashboardMetrics Response", {structuredData: true});

        return {
            upcomingBookings: upcomingBookings,
            lastThirtyDaysBookings: lastThirtyDaysBookings.length
        }
    });