/**
 * Booking Service Test - Demonstrates usage and validates types
 * Note: These are example tests showing the service interface
 */

import BookingService from '../bookingService';
import { CreateBookingDto, CreateBookingResponse, BookingErrorResponse } from '../models/bookingModels';

describe('BookingService Enhanced Features', () => {
    // Mock data for testing
    const mockBookingRequest: CreateBookingDto = {
        serviceId: "service_123",
        clientId: "client_456", 
        trainerId: "trainer_789",
        bookingDate: new Date("2024-01-15"),
        startTime: new Date("2024-01-15T09:00:00"),
        endTime: new Date("2024-01-15T10:00:00"),
        deliveryFormatId: "format_001",
        deliveryFormatOptionId: "option_001",
        notes: "Test booking session"
    };

    const mockSuccessResponse: CreateBookingResponse = {
        bookingId: "booking_abc123",
        message: "Booking created successfully",
        status: "Pending"
    };

    const mockValidationError: BookingErrorResponse = {
        error: "QUESTIONNAIRE_NOT_COMPLETED",
        message: "Client must complete the onboarding questionnaire before booking"
    };

    test('createBookingRequest method signature and types', () => {
        // This test validates that the method signature is correct
        expect(typeof BookingService.createBookingRequest).toBe('function');
        
        // Validate that the method accepts CreateBookingDto
        const methodCall = BookingService.createBookingRequest(mockBookingRequest);
        expect(methodCall).toBeInstanceOf(Promise);
    });

    test('bookService method with all required parameters', () => {
        // Validate enhanced bookService method signature
        expect(typeof BookingService.bookService).toBe('function');
        
        const methodCall = BookingService.bookService(
            "service_123",
            "client_456",
            "trainer_789",
            new Date("2024-01-15"),
            new Date("2024-01-15T09:00:00"),
            new Date("2024-01-15T10:00:00"),
            "format_001",
            "option_001",
            "Test booking"
        );
        expect(methodCall).toBeInstanceOf(Promise);
    });

    test('CreateBookingDto interface has all required fields', () => {
        // This test ensures the interface includes delivery format fields
        const booking: CreateBookingDto = {
            serviceId: "test",
            clientId: "test",
            trainerId: "test",
            bookingDate: new Date(),
            startTime: new Date("2024-01-15T09:00:00"),
            endTime: new Date("2024-01-15T10:00:00"),
            deliveryFormatId: "test", // Required field
            deliveryFormatOptionId: "test", // Required field
            notes: "optional"
        };

        expect(booking.deliveryFormatId).toBeDefined();
        expect(booking.deliveryFormatOptionId).toBeDefined();
    });

    test('Response type interfaces are properly defined', () => {
        // Validate CreateBookingResponse structure
        const response: CreateBookingResponse = {
            bookingId: "test",
            message: "test",
            status: "test"
        };

        expect(response.bookingId).toBeDefined();
        expect(response.message).toBeDefined();
        expect(response.status).toBeDefined();

        // Validate BookingErrorResponse structure
        const errorResponse: BookingErrorResponse = {
            error: "TEST_ERROR",
            message: "Test error message"
        };

        expect(errorResponse.error).toBeDefined();
        expect(errorResponse.message).toBeDefined();
    });

    test('Error handling structure example', () => {
        // This demonstrates the expected error handling pattern
        const mockError = {
            response: {
                status: 403,
                data: mockValidationError
            },
            validationError: mockValidationError
        };

        expect(mockError.validationError.error).toBe("QUESTIONNAIRE_NOT_COMPLETED");
        expect(mockError.validationError.message).toContain("questionnaire");
    });
});

/**
 * Usage Examples for Documentation
 */
describe('BookingService Usage Examples', () => {
    test('Example: Basic booking creation', async () => {
        // This is how client apps should use the service
        const exampleUsage = () => {
            const bookingRequest: CreateBookingDto = {
                serviceId: "service_123",
                clientId: "client_456", 
                trainerId: "trainer_789",
                bookingDate: new Date("2024-01-15"),
                startTime: new Date("2024-01-15T09:00:00"),
                endTime: new Date("2024-01-15T10:00:00"),
                deliveryFormatId: "format_001",
                deliveryFormatOptionId: "option_001",
                notes: "First session with new trainer"
            };

            return BookingService.createBookingRequest(bookingRequest);
        };

        expect(typeof exampleUsage).toBe('function');
    });

    test('Example: Error handling pattern', () => {
        const errorHandlingExample = (error: any) => {
            if (error.validationError) {
                const validationError = error.validationError as BookingErrorResponse;
                
                switch (validationError.error) {
                    case 'QUESTIONNAIRE_NOT_COMPLETED':
                        return 'redirect_to_questionnaire';
                    case 'SLOT_CONFLICT':
                        return 'show_alternative_slots';
                    case 'INVALID_SERVICE':
                        return 'show_service_error';
                    case 'OUTSIDE_AVAILABILITY':
                        return 'show_availability_info';
                    default:
                        return 'generic_error';
                }
            }
            return 'network_error';
        };

        expect(typeof errorHandlingExample).toBe('function');
        
        // Test specific error handling
        const questionnaire_error = {
            validationError: { error: 'QUESTIONNAIRE_NOT_COMPLETED', message: 'Complete questionnaire' }
        };
        expect(errorHandlingExample(questionnaire_error)).toBe('redirect_to_questionnaire');
    });
}); 