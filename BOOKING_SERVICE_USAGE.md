# Booking Service Usage Guide

## Overview

The `bookingService.ts` provides a comprehensive interface for creating and managing bookings with the ScupoApi backend. This service handles all booking-related operations including validation, scheduling, and conflict detection.

## Enhanced Features

### 1. Updated Booking Creation

The service now supports the enhanced booking creation with delivery format validation:

#### New Required Fields
- `deliveryFormatId`: The delivery format for the service
- `deliveryFormatOptionId`: The specific delivery format option
- `notes`: Optional booking notes

#### Updated Models

```typescript
interface CreateBookingDto {
    serviceId: string;
    clientId: string;
    trainerId: string;
    bookingDate: Date;
    startTime: string; // Format: "HH:MM:SS"
    endTime: string;   // Format: "HH:MM:SS"
    deliveryFormatId: string;
    deliveryFormatOptionId: string;
    notes?: string;
}

interface CreateBookingResponse {
    bookingId: string;
    message: string;
    status: string;
}

interface BookingErrorResponse {
    error: string;
    message: string;
}
```

## Usage Examples

### 1. Basic Booking Creation

```typescript
import { BookingService, CreateBookingDto } from 'sculpo-database';

// Create a booking request
const bookingRequest: CreateBookingDto = {
    serviceId: "service_123",
    clientId: "client_456", 
    trainerId: "trainer_789",
    bookingDate: new Date("2024-01-15"),
    startTime: "09:00:00",
    endTime: "10:00:00",
    deliveryFormatId: "format_001",
    deliveryFormatOptionId: "option_001",
    notes: "First session with new trainer"
};

try {
    const response = await BookingService.createBookingRequest(bookingRequest);
    console.log('Booking created successfully:', response.bookingId);
    console.log('Status:', response.status); // "Pending"
} catch (error: any) {
    if (error.validationError) {
        // Handle validation errors from backend
        console.error('Validation Error:', error.validationError.error);
        console.error('Message:', error.validationError.message);
    } else {
        console.error('Network or other error:', error);
    }
}
```

### 2. Using the Convenience Method

```typescript
// For simpler booking scenarios, use the bookService method
try {
    const bookingId = await BookingService.bookService(
        "service_123",    // serviceId
        "client_456",     // clientId  
        "trainer_789",    // trainerId
        new Date("2024-01-15"), // bookingDate
        "09:00:00",       // startTime
        "10:00:00",       // endTime
        "format_001",     // deliveryFormatId
        "option_001",     // deliveryFormatOptionId
        "First session"   // notes (optional)
    );
    
    console.log('Booking ID:', bookingId);
} catch (error) {
    // Handle errors
}
```

### 3. Error Handling

The service provides structured error handling for different validation scenarios:

```typescript
try {
    const response = await BookingService.createBookingRequest(bookingData);
    // Success handling
} catch (error: any) {
    if (error.validationError) {
        const validationError = error.validationError as BookingErrorResponse;
        
        switch (validationError.error) {
            case 'QUESTIONNAIRE_NOT_COMPLETED':
                // Redirect user to complete questionnaire
                showQuestionnairePrompt();
                break;
                
            case 'SLOT_CONFLICT':
                // Show alternative time slots
                showAlternativeSlots();
                break;
                
            case 'INVALID_SERVICE':
                // Show error and redirect to service selection
                showServiceError();
                break;
                
            case 'OUTSIDE_AVAILABILITY':
                // Show trainer's available hours
                showAvailabilityInfo();
                break;
                
            default:
                // Generic error handling
                showGenericError(validationError.message);
        }
    } else {
        // Network or other errors
        console.error('Request failed:', error);
    }
}
```

## Backend Validation

The service automatically handles comprehensive backend validation:

### ✅ **Automatically Validated**
- User authorization (token-based)
- Client questionnaire completion
- Service exists and belongs to trainer
- Delivery format/option compatibility
- Trainer availability windows
- Booking conflicts and time slot overlaps
- Blocked time periods

### 🚫 **No Client-Side Validation Required**
- The service layer does NOT perform validation
- All business rules are enforced by the backend
- Client apps should handle validation errors gracefully

## Authentication

The service uses the existing `axiosConfig` with automatic token handling:

```typescript
// Token is automatically added from AsyncStorage
// No manual authentication required in service calls
```

## Additional Methods

### Get User Bookings
```typescript
const userBookings = await BookingService.getUserBookings("user_123");
const pendingBookings = await BookingService.getUserBookings("user_123", "Pending");
```

### Check Availability
```typescript
const availability = await BookingService.getTrainerAvailability({
    trainerId: "trainer_789",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-01-20"),
    serviceId: "service_123"
});
```

### Get Next Available Slots
```typescript
const nextSlots = await BookingService.getNextAvailableSlots({
    trainerId: "trainer_789",
    serviceId: "service_123",
    count: 5
});
```

## Integration with React Native Apps

### AsyncStorage Token Management
The service automatically handles JWT tokens stored in AsyncStorage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Token is automatically retrieved and added to requests
// Automatic token expiration handling with 401 response cleanup
```

### Error Boundaries
Implement error boundaries to handle booking validation errors:

```typescript
import React from 'react';

const BookingErrorBoundary = ({ children }) => {
    const handleBookingError = (error: any) => {
        if (error.validationError) {
            // Handle specific validation errors
            return <BookingValidationErrorComponent error={error.validationError} />;
        }
        return <GenericErrorComponent error={error} />;
    };

    // Error boundary implementation
};
```

## Best Practices

1. **Always handle validation errors** - Backend provides detailed error codes
2. **Use structured error responses** - Check for `validationError` property
3. **Don't duplicate validation** - Let backend handle all business rules
4. **Provide user feedback** - Show meaningful messages based on error codes
5. **Handle token expiration** - Service automatically manages auth tokens
6. **Use TypeScript types** - Leverage provided interfaces for type safety

## Migration from Previous Version

If upgrading from a previous version without delivery format fields:

```typescript
// Old version (no longer works)
const booking = {
    serviceId: "123",
    clientId: "456", 
    trainerId: "789",
    bookingDate: new Date(),
    startTime: "09:00:00",
    endTime: "10:00:00"
    // Missing: deliveryFormatId, deliveryFormatOptionId
};

// New version (required)
const booking = {
    serviceId: "123",
    clientId: "456", 
    trainerId: "789", 
    bookingDate: new Date(),
    startTime: "09:00:00",
    endTime: "10:00:00",
    deliveryFormatId: "format_001", // Required
    deliveryFormatOptionId: "option_001", // Required
    notes: "Optional notes"
};
```

This enhanced booking service provides robust, validated booking creation while maintaining clean separation between client and server validation logic. 