/**
 * Cloud function to send a booking confirmation email to the client
 *
 * @param req
 * @returns
 *
 */
import { getFirestore } from "firebase-admin/firestore";
import { info } from "firebase-functions/logger";
import { onCall } from "firebase-functions/v2/https";
import { Collection } from "../../../utils/collection";
export const sendBookingConfirmation = onCall({ cors: ["54nqvew-liamksoftware-8081.exp.direct"] }, async (req) => {
    info("sendBookingConfirmation Invoked", { structuredData: true });
    const bookingId = req.data.bookingId;
    // get booking
    const booking = await getFirestore().collection(Collection.BOOKINGS).doc(bookingId).get();
    if (!booking.exists) {
        info("Booking not found", { structuredData: true });
        return;
    }
    // get client
    const client = await getFirestore().collection(Collection.PROFILES).doc(booking.data()?.clientId).get();
    if (!client.exists) {
        info("Client not found", { structuredData: true });
        return;
    }
    // get trainer
    const trainer = await getFirestore().collection(Collection.PROFILES).doc(booking.data()?.trainerId).get();
    if (!trainer.exists) {
        info("Trainer not found", { structuredData: true });
        return;
    }
    // send email
    getFirestore().collection(Collection.EMAILS).add({
        to: "lksoftwaredevelopment@outlook.com",
        message: {
            subject: "Booking Confirmation",
            text: "Your booking has been confirmed",
            html: `<p>Your booking has been confirmed by ${trainer.data()?.name}</p>`
        }
    });
});
