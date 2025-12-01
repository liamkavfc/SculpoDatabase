/**
 * Reusable Firestore utility functions
 * Provides common operations for parsing and transforming Firestore data
 */
import { Timestamp } from 'firebase/firestore';

/**
 * Parse a Firestore timestamp to a JavaScript Date
 * Handles various timestamp formats from Firestore
 */
export const parseFirestoreDate = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value instanceof Timestamp) return value.toDate();
    if (value?.toDate && typeof value.toDate === 'function') {
        return value.toDate();
    }
    if (value?._seconds) {
        return new Date(value._seconds * 1000);
    }
    if (typeof value === 'string') {
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
};

/**
 * Parse a Firestore timestamp to an ISO string
 * Returns null if the value cannot be parsed
 */
export const parseFirestoreDateToISO = (value: any): string | null => {
    const date = parseFirestoreDate(value);
    return date ? date.toISOString() : null;
};

/**
 * Parse booking date/time fields
 * Handles both Date objects and time strings
 */
export const parseBookingDateTime = (
    booking: any,
    field: 'startTime' | 'endTime' | 'bookingDate'
): Date | null => {
    const fieldValue: any = booking[field];
    const parsedField = parseFirestoreDate(fieldValue);

    if (parsedField) {
        return parsedField;
    }

    // If it's a time string (HH:MM), combine with bookingDate
    if (typeof fieldValue === 'string' && fieldValue.includes(':')) {
        const bookingDate = parseFirestoreDate(booking.bookingDate);
        if (!bookingDate) {
            return null;
        }

        const [hours, minutes] = fieldValue.split(':').map((part) => parseInt(part, 10));
        const dateWithTime = new Date(bookingDate);
        if (!isNaN(hours) && !isNaN(minutes)) {
            dateWithTime.setHours(hours, minutes, 0, 0);
            return dateWithTime;
        }
    }

    return parsedField;
};
