# SculpoDatabase - Comprehensive Project Documentation

## 🎯 Project Overview

**SculpoDatabase** is a shared TypeScript package that serves as the **centralized data access layer** for the Sculpo fitness application ecosystem. It provides a unified API client library with consistent HTTP configuration, authentication handling, and type-safe data models that can be consumed by multiple applications (SculpoAdmin, SculpoClient, and potentially future apps).

### Primary Purpose
- **Centralized API Layer**: Single source of truth for all backend API interactions
- **Type Safety**: Comprehensive TypeScript interfaces and models for all data structures
- **Authentication Management**: Automatic token handling and refresh logic
- **Code Reusability**: Shared services across multiple client applications
- **Consistency**: Standardized error handling, logging, and HTTP configuration

### Architecture Pattern
The project follows a **service-oriented architecture** with clear separation of concerns:
- **Services**: Business logic and API interaction layers
- **Models**: Type definitions and data structures
- **Configuration**: Environment and HTTP setup
- **Exports**: Clean public API surface

## 🏗️ Project Structure & Architecture

```
SculpoDatabase/
├── services/                    # Core business logic services
│   ├── models/                  # TypeScript type definitions
│   │   ├── bookingModels.ts    # Booking-related types
│   │   ├── deliverFormatModels.ts # Service delivery format types
│   │   ├── goalsModels.ts      # User goals and responses types
│   │   ├── onboardingQuestionnaireModels.ts # Onboarding questionnaire types
│   │   └── servicesModels.ts   # Trainer services types
│   ├── adminService.ts         # Admin functionality (delivery formats, goals, onboarding)
│   ├── authService.ts          # Authentication (login, register, logout)
│   ├── axiosConfig.ts          # HTTP client configuration with interceptors
│   ├── bookingService.ts       # Booking management
│   ├── clientService.ts        # Client-specific operations
│   ├── goalsService.ts         # Goals feature management
│   ├── profileService.ts       # User profile CRUD operations
│   ├── servicesService.ts      # Trainer services management
│   └── index.ts               # Service exports
├── environment.ts              # API URL configuration
├── index.ts                   # Main package entry point
├── package.json               # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── FIREBASE_DATASTORE_STRUCTURE.md # Database schema documentation
├── GOALS_IMPLEMENTATION.md    # Goals feature implementation guide
└── README.md                 # Basic usage instructions
```

## 🔧 Core Services Architecture

### HTTP Configuration (`axiosConfig.ts`)
- **Base URL**: Configurable via `environment.ts`
- **Automatic Authentication**: Injects Bearer tokens from AsyncStorage
- **Request Interceptors**: Adds tokens, handles special cases (login, OPTIONS)
- **Response Interceptors**: Handles 401 errors, token expiration
- **Error Handling**: Comprehensive logging and error propagation
- **Headers**: Standard JSON headers plus ngrok bypass for development

### Service Classes Pattern
All services follow a consistent pattern:

```typescript
class ServiceName {
    private apiUrl: string;
    
    constructor() {
        this.apiUrl = `${environment.apiUrl}/api/controller-name`;
    }
    
    async methodName(params): Promise<ReturnType> {
        // HTTP operation using axiosInstance
        // Error handling
        // Return typed response
    }
}
```

### Authentication Service (`authService.ts`)
- **Login**: Email/password authentication, token storage
- **Register**: User registration with profile data
- **Logout**: Token cleanup and storage clearing
- **Token Management**: AsyncStorage integration
- **User Profile Caching**: Stores user data locally for performance

### Profile Service (`profileService.ts`)
- **CRUD Operations**: Complete profile management
- **User Types**: Admin, Trainer, Client role handling
- **Extended Profile**: Additional client information (height, weight, BMI)
- **Image Handling**: Profile picture management
- **Type Conversion**: DTO to ViewModel mapping

### Admin Service (`adminService.ts`)
- **Delivery Formats**: Service delivery method management
- **Onboarding Questions**: Dynamic questionnaire creation/management
- **Goals Management**: Fitness goals CRUD operations
- **Analytics**: Goal selection reporting and insights
- **User Management**: Admin-level user operations

### Goals Service (`goalsService.ts`)
- **Goal Selection**: Multi-select goal choosing for users
- **Custom Goals**: "Other" option with custom text input (50 char limit)
- **Response Tracking**: User goal selection persistence
- **Analytics**: Goal popularity and user preference insights
- **Admin Interface**: Goal creation, ordering, and management

### Booking Service (`bookingService.ts`)
- **Availability Management**: Trainer schedule handling
- **Booking Creation**: Client-trainer session booking
- **Status Tracking**: Booking state management (pending, confirmed, cancelled)
- **Calendar Integration**: Time slot management
- **Conflict Resolution**: Scheduling validation

### Services Service (`servicesService.ts`)
- **Service Creation**: Trainer service offering management
- **Service Discovery**: Client service browsing
- **Pricing Management**: Service cost handling
- **Category Management**: Service type organization

### Client Service (`clientService.ts`)
- **Onboarding**: New user questionnaire completion
- **Goal Submission**: User goal selection processing
- **Profile Management**: Client-specific profile operations
- **Service Browsing**: Available service discovery

## 📊 Data Models & Types

### Core User Types
```typescript
enum UserType {
    Admin = 0,
    Trainer = 1,
    Client = 2
}
```

### Profile Models
- **ProfileFullViewModel**: Complete user profile with all fields
- **ProfileListViewModel**: Minimal profile for list displays
- **CreateClientProfileDto**: Client-specific profile creation
- **ExtendedProfileInfo**: Additional client metrics (fitness data)

### Authentication Models
- **LoginDto**: Email/password login request
- **LoginResponseDto**: JWT token and user info response
- **RegisterDto**: New user registration data
- **RegisterResponseDto**: Registration success response

### Goals Models
- **GoalViewModel**: Complete goal definition with ordering
- **UserGoalResponseViewModel**: User's goal selections
- **GoalAnalyticsViewModel**: Admin reporting data
- **CreateGoalDto/UpdateGoalDto**: Goal management operations

### Booking Models
- **BookingDto**: Complete booking information
- **AvailabilityDto**: Trainer availability slots
- **BookingStatus**: Enum for booking states

## 🔐 Security & Authentication

### Token Management
- **AsyncStorage Integration**: Secure token persistence
- **Automatic Injection**: HTTP interceptors add tokens to requests
- **Expiration Handling**: 401 response triggers token cleanup
- **Route Protection**: Login bypass for authentication endpoints

### Security Best Practices
- **Bearer Token Authentication**: Standard JWT implementation
- **Request Validation**: Type-safe request/response handling
- **Error Sanitization**: Consistent error response formatting
- **HTTPS Enforcement**: Production-ready SSL configuration

## 🚀 Development Patterns & Best Practices

### TypeScript Configuration
- **Strict Mode**: Full type checking enabled
- **ES2020 Target**: Modern JavaScript features
- **ESNext Modules**: Tree-shakable exports
- **Declaration Files**: Type definitions generated for consumers

### Error Handling Pattern
```typescript
try {
    const response = await axiosInstance.method(url, data);
    return response.data;
} catch (error: any) {
    console.error('Descriptive error message:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status
    });
    throw error; // Let consuming app handle UI/navigation
}
```

### Async/Await Consistency
- All service methods use async/await
- Promise-based return types with proper typing
- Consistent error propagation to consuming applications

### Logging Strategy
- Comprehensive request/response logging
- Token presence verification logs
- Error context capture for debugging
- Production-appropriate log levels

## 📈 Extensibility & Future Development

### Adding New Services
1. Create service class following the established pattern
2. Add corresponding models in `models/` directory
3. Export service and types in `services/index.ts`
4. Update main `index.ts` export
5. Add documentation to this file

### Adding New Endpoints
1. Add method to appropriate service class
2. Create necessary DTOs/ViewModels
3. Update type exports
4. Follow error handling patterns
5. Add comprehensive logging

### Database Schema Evolution
- Update `FIREBASE_DATASTORE_STRUCTURE.md` for schema changes
- Create migration documentation
- Update corresponding TypeScript models
- Version service methods if breaking changes

### New Feature Implementation
- Follow the Goals feature pattern (see `GOALS_IMPLEMENTATION.md`)
- Create dedicated service if feature is substantial
- Add comprehensive models and DTOs
- Include admin and client-facing methods
- Document feature architecture

## 🛠️ Integration Guidelines for Consuming Applications

### Installation & Setup
```typescript
// Install package in consuming app
npm install sculpo-database

// Import required services
import { AuthService, ProfileService, AdminService } from 'sculpo-database';

// Configure environment
// Update environment.ts with your API URL
```

### Authentication Flow
```typescript
// Login
const response = await AuthService.login(email, password);
// Token automatically stored and managed

// Check authentication status
const isLoggedIn = await AuthService.isLoggedIn();

// Logout
await AuthService.logout();
```

### Service Usage Pattern
```typescript
// Service calls are typed and async
const profiles = await ProfileService.getAll();
const userProfile = await ProfileService.getByUserId(userId);
const goals = await GoalsService.getActiveGoals();
```

### Error Handling in Consuming Apps
- Services throw errors that need to be caught
- Handle authentication failures (redirect to login)
- Provide user-friendly error messages
- Log errors for debugging

## 🎯 AI Agent Guidance for Future Development

### When Adding Features
1. **Identify the Domain**: Determine if it's admin, client, profile, or booking related
2. **Model First Approach**: Design TypeScript interfaces before implementation
3. **Service Pattern**: Follow established service class patterns
4. **Error Handling**: Implement comprehensive error logging and propagation
5. **Export Management**: Update all index.ts files for proper exports

### When Modifying Existing Features
1. **Backward Compatibility**: Avoid breaking changes to public interfaces
2. **Version Considerations**: Plan for database migrations
3. **Type Safety**: Update all related TypeScript definitions
4. **Documentation**: Update this file and feature-specific docs

### Common Patterns to Follow
- **Consistent Naming**: Use descriptive method names (get, create, update, delete)
- **Type Safety**: Always provide proper TypeScript interfaces
- **Async Operations**: Use async/await consistently
- **Error Propagation**: Let consuming apps handle UI feedback
- **Logging**: Include context for debugging

### Architecture Decisions
- **Shared Package**: Maintains consistency across applications
- **Service Classes**: Encapsulate domain logic and HTTP operations
- **Type Definitions**: Centralized models prevent type mismatches
- **HTTP Abstraction**: axiosInstance provides consistent configuration
- **Token Management**: Automatic authentication handling reduces boilerplate

### Performance Considerations
- **Caching Strategy**: Profile data caching example in AuthService
- **Request Optimization**: Avoid unnecessary API calls
- **Type Compilation**: Efficient TypeScript compilation with proper tsconfig
- **Bundle Size**: Tree-shakable exports for consuming applications

This documentation serves as a comprehensive guide for understanding, maintaining, and extending the SculpoDatabase package. The architecture promotes consistency, type safety, and maintainability across the entire Sculpo application ecosystem. 