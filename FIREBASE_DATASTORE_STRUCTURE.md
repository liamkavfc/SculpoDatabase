# Firebase Datastore Structure - Sculpo Application

## Overview
This document outlines the complete Firebase Firestore database structure for the Sculpo application, including all collections, documents, and their relationships.

## Collections Structure

### 1. **profiles** Collection
**Purpose**: Stores user profile information for all user types (Admin, Trainer, Client)

**Document Structure**:
```typescript
{
  id: string;                    // Auto-generated document ID
  userId: string;               // Firebase Auth UID
  email: string;                // User's email address
  firstName: string;            // User's first name
  lastName: string;             // User's last name
  name: string;                 // Full name (firstName + lastName)
  image: string | null;         // Profile image URL
  dateOfBirth: Date | null;     // User's date of birth
  gender: string | null;        // 'Male', 'Female', 'Other', or null
  location: string | null;      // User's location
  phoneNumber: string | null;   // User's phone number
  userType: UserType;           // 0=Admin, 1=Trainer, 2=Client
  about: string | null;         // User's bio/description
  height: number | null;        // Height in centimeters
  weight: number | null;        // Weight in kilograms
  bmi: number | null;           // Calculated BMI (read-only)
  referralCode: string | null;  // Trainer referral code used during registration
  questionnaireCompleted: boolean; // Whether user has completed onboarding questionnaire
  createdAt: Timestamp;         // Document creation timestamp
  updatedAt: Timestamp;         // Document last update timestamp
}
```

**Indexes**:
- `userId` (for quick user lookup)
- `email` (for authentication)
- `userType` (for filtering by user role)

---

### 2. **goals** Collection
**Purpose**: Stores fitness goals that users can select during onboarding

**Document Structure**:
```typescript
{
  id: string;                   // Auto-generated document ID
  title: string;                // Goal title/description
  active: boolean;              // Whether goal is active/available
  order: number;                // Display order (for sorting)
  isOtherOption: boolean;       // Whether this is an "Other" option allowing custom text
  createdAt: Timestamp;         // Document creation timestamp
  updatedAt: Timestamp;         // Document last update timestamp
}
```

**Indexes**:
- `active` (for filtering active goals)
- `order` (for sorting)

---

### 3. **userGoalResponses** Collection
**Purpose**: Stores user responses to goal selection during onboarding

**Document Structure**:
```typescript
{
  id: string;                   // Auto-generated document ID
  userId: string;               // Reference to user who submitted response
  goalId: string;               // Reference to selected goal
  goalTitle: string;            // Goal title (denormalized for reporting)
  selected: boolean;            // Whether user selected this goal
  otherText?: string;           // Custom text if goal is "Other" option (max 50 chars)
  submittedAt: Timestamp;       // When response was submitted
}
```

**Indexes**:
- `userId` (for user-specific queries)
- `goalId` (for goal analytics)
- `submittedAt` (for chronological ordering)

---

### 4. **onboardingQuestions** Collection
**Purpose**: Stores onboarding questionnaire questions configured by admins

**Document Structure**:
```typescript
{
  id: string;                   // Auto-generated document ID
  title: string;                // Question text
  section: string;              // Question section/category
  type: QuestionType;           // 0=FreeText, 1=MultipleChoice
  active: boolean;              // Whether question is active
  order: number;                // Display order within section
  options: string[];            // Available options (for multiple choice)
  createdAt: Timestamp;         // Document creation timestamp
  updatedAt: Timestamp;         // Document last update timestamp
}
```

**Indexes**:
- `active` (for filtering active questions)
- `section` (for grouping questions)
- `order` (for sorting within sections)

---

### 5. **onboardingAnswers** Collection
**Purpose**: Stores user responses to onboarding questionnaire

**Document Structure**:
```typescript
{
  id: string;                   // Auto-generated document ID
  userId: string;               // Reference to user who submitted answers
  questionId: string;           // Reference to answered question
  questionTitle: string;        // Question title (denormalized)
  answer: string;               // User's answer
  submittedAt: Timestamp;       // When answer was submitted
}
```

**Indexes**:
- `userId` (for user-specific queries)
- `questionId` (for question analytics)
- `submittedAt` (for chronological ordering)

---

### 6. **deliveryFormats** Collection
**Purpose**: Stores service delivery format types (e.g., "In-Person", "Online")

**Document Structure**:
```typescript
{
  id: string;                   // Auto-generated document ID
  type: string;                 // Delivery format type name
  createdAt: Timestamp;         // Document creation timestamp
  updatedAt: Timestamp;         // Document last update timestamp
}
```

**Subcollection**: `deliveryFormats/{formatId}/options`
**Purpose**: Stores specific options for each delivery format

**Subcollection Document Structure**:
```typescript
{
  id: string;                   // Auto-generated document ID
  parentId: string;             // Reference to parent delivery format
  type: string;                 // Option type/name
  createdAt: Timestamp;         // Document creation timestamp
  updatedAt: Timestamp;         // Document last update timestamp
}
```

**Indexes**:
- Parent collection: `type` (for filtering by format type)
- Subcollection: `parentId` (for parent relationship)

---

### 7. **services** Collection
**Purpose**: Stores services offered by trainers

**Document Structure**:
```typescript
{
  id: string;                   // Auto-generated document ID
  title: string;                // Service title
  overview: string;             // Service description
  price: number;                // Service price (stored as double in Firestore)
  trainerId: string;            // Reference to trainer's userId
  clientId?: string;            // Reference to client's userId (if assigned)
  serviceImageUrl?: string;     // Main service image URL
  images?: string[];            // Additional service image URLs
  deliveryFormatId: string;     // Reference to delivery format
  deliveryFormatOptionId: string; // Reference to delivery format option
  createdAt: Timestamp;         // Document creation timestamp
  updatedAt: Timestamp;         // Document last update timestamp
}
```

**Indexes**:
- `trainerId` (for trainer-specific services)
- `clientId` (for client-specific services)
- `deliveryFormatId` (for filtering by delivery format)

---

### 8. **bookings** Collection
**Purpose**: Stores booking/appointment information between clients and trainers

**Document Structure**:
```typescript
{
  id: string;                   // Auto-generated document ID
  serviceId: string;            // Reference to booked service
  clientId: string;             // Reference to client user ID
  trainerId: string;            // Reference to trainer user ID
  bookingDate: Date;            // Date of the booking
  startTime: string;            // Start time (format: "HH:MM:SS")
  endTime: string;              // End time (format: "HH:MM:SS")
  status: BookingStatus;        // 0=Pending, 1=Confirmed, 2=InProgress, 3=Completed, 4=CancelledByClient, 5=CancelledByTrainer, 6=NoShow, 7=Rejected
  price: number;                // Booking price (decimal)
  notes?: string;               // Optional booking notes
  createdAt: Timestamp;         // Document creation timestamp
  updatedAt?: Timestamp;        // Document last update timestamp
}
```

**Indexes**:
- `clientId` (for client booking queries)
- `trainerId` (for trainer booking queries)
- `serviceId` (for service-specific bookings)
- `status` (for booking status filtering)
- `bookingDate` (for date-based queries)

---

### 9. **trainerAvailability** Collection
**Purpose**: Stores trainer working hours and availability schedules

**Document Structure**:
```typescript
{
  id: string;                   // Auto-generated document ID
  trainerId: string;            // Reference to trainer user ID
  dayOfWeek: number;            // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string;            // Start time (format: "HH:MM:SS")
  endTime: string;              // End time (format: "HH:MM:SS")
  isAvailable: boolean;         // Whether trainer is available on this day/time
  createdAt: Timestamp;         // Document creation timestamp
  updatedAt: Timestamp;         // Document last update timestamp
}
```

**Indexes**:
- `trainerId` (for trainer-specific availability)
- `dayOfWeek` (for day-based queries)

---

### 10. **blockedSlots** Collection
**Purpose**: Stores temporarily blocked time slots for trainers

**Document Structure**:
```typescript
{
  id: string;                   // Auto-generated document ID
  trainerId: string;            // Reference to trainer user ID
  date: Date;                   // Specific date for the blocked slot
  startTime: string;            // Start time (format: "HH:MM:SS")
  endTime: string;              // End time (format: "HH:MM:SS")
  reason: string;               // Reason for blocking (e.g., "Personal appointment", "Holiday")
  createdAt: Timestamp;         // Document creation timestamp
}
```

**Indexes**:
- `trainerId` (for trainer-specific blocked slots)
- `date` (for date-based queries)

---

## Authentication Integration

### Firebase Authentication
- **User Management**: Firebase Auth handles user authentication
- **User Types**: Determined by `userType` field in profiles collection
- **Token Validation**: JWT tokens validated via Firebase Admin SDK

### User Roles
```typescript
enum UserType {
  Admin = 0,    // System administrators
  Trainer = 1,  // Fitness trainers
  Client = 2    // End users/clients
}
```

### Booking Status Enum
```typescript
enum BookingStatus {
  Pending = 0,              // Booking requested but not confirmed
  Confirmed = 1,            // Booking confirmed by trainer
  InProgress = 2,           // Booking currently happening
  Completed = 3,            // Booking successfully completed
  CancelledByClient = 4,    // Client cancelled the booking
  CancelledByTrainer = 5,   // Trainer cancelled the booking
  NoShow = 6,               // Client didn't show up
  Rejected = 7              // Trainer rejected the booking
}
```

---

## Data Relationships

### User Profile → Goals
- **One-to-Many**: One user can have multiple goal responses
- **Collection**: `userGoalResponses`
- **Foreign Key**: `userId` → `profiles.userId`

### User Profile → Onboarding Answers
- **One-to-Many**: One user can have multiple onboarding answers
- **Collection**: `onboardingAnswers`
- **Foreign Key**: `userId` → `profiles.userId`

### Trainer → Services
- **One-to-Many**: One trainer can offer multiple services
- **Collection**: `services`
- **Foreign Key**: `trainerId` → `profiles.userId`

### Trainer → Bookings
- **One-to-Many**: One trainer can have multiple bookings
- **Collection**: `bookings`
- **Foreign Key**: `trainerId` → `profiles.userId`

### Client → Bookings
- **One-to-Many**: One client can have multiple bookings
- **Collection**: `bookings`
- **Foreign Key**: `clientId` → `profiles.userId`

### Service → Bookings
- **One-to-Many**: One service can have multiple bookings
- **Collection**: `bookings`
- **Foreign Key**: `serviceId` → `services.id`

### Trainer → Availability
- **One-to-Many**: One trainer can have multiple availability slots
- **Collection**: `trainerAvailability`
- **Foreign Key**: `trainerId` → `profiles.userId`

### Trainer → Blocked Slots
- **One-to-Many**: One trainer can have multiple blocked slots
- **Collection**: `blockedSlots`
- **Foreign Key**: `trainerId` → `profiles.userId`

### Delivery Format → Options
- **One-to-Many**: One delivery format can have multiple options
- **Subcollection**: `deliveryFormats/{formatId}/options`
- **Relationship**: Parent-child via document path

### Service → Delivery Format
- **Many-to-One**: Multiple services can use same delivery format
- **References**: `deliveryFormatId` and `deliveryFormatOptionId`

---

## Security Rules Considerations

### Collection Access Patterns
- **profiles**: Users can read/write their own profile, admins can read all
- **goals**: All authenticated users can read, admins can write
- **userGoalResponses**: Users can write their own responses, admins can read all
- **onboardingQuestions**: All authenticated users can read, admins can write
- **onboardingAnswers**: Users can write their own answers, admins can read all
- **deliveryFormats**: All authenticated users can read, admins can write
- **services**: Trainers can write their own services, clients can read assigned services
- **bookings**: Users can read/write their own bookings (as client or trainer)
- **trainerAvailability**: Trainers can read/write their own availability, clients can read
- **blockedSlots**: Trainers can read/write their own blocked slots

---

## Analytics and Reporting

### Goal Analytics
- **Source**: `userGoalResponses` collection
- **Metrics**: Selection counts, percentages, custom responses
- **Aggregation**: Real-time queries for admin dashboard

### Booking Analytics
- **Source**: `bookings` collection
- **Metrics**: Booking counts by status, revenue tracking, popular services
- **Performance**: Trainer utilization, client engagement

### User Progress Tracking
- **Onboarding Completion**: Track via `onboardingAnswers` and `userGoalResponses`
- **Profile Completeness**: Monitor required fields in `profiles`
- **Service Engagement**: Track via `services` assignments and `bookings`

---

## Data Migration and Backup

### Backup Strategy
- **Firestore Export**: Regular automated exports
- **Critical Collections**: All collections are business-critical
- **Retention**: Follow data retention policies for user data

### Migration Considerations
- **Schema Evolution**: Use versioned document structures
- **Data Validation**: Implement client and server-side validation
- **Rollback Plans**: Maintain ability to revert schema changes

---

## Performance Optimization

### Indexing Strategy
- **Composite Indexes**: For complex queries (e.g., active goals ordered by order)
- **Single Field Indexes**: For simple lookups (e.g., userId, email)
- **Query Optimization**: Limit results, use pagination where appropriate

### Caching Strategy
- **Client-Side**: Cache user profiles and static data (goals, questions)
- **Server-Side**: Cache frequently accessed data in memory
- **Invalidation**: Implement cache invalidation on data updates

---

## Data Validation Rules

### Client-Side Validation
- **Profile Data**: Email format, phone number format, required fields
- **Goal Responses**: Ensure at least one goal selected, validate "other" text length
- **Onboarding Answers**: Validate answer format based on question type
- **Booking Data**: Validate date/time ranges, availability conflicts

### Server-Side Validation
- **Firebase Functions**: Validate data before writing to Firestore
- **Schema Validation**: Ensure document structure matches expected format
- **Business Rules**: Enforce business logic constraints

---

*This document serves as the authoritative reference for the Sculpo Firebase datastore structure. Update this document when schema changes are made.* 