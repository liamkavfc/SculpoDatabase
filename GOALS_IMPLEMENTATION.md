# Goals Feature Implementation - SculpoDatabase

## 📋 Overview
This document outlines the goals feature implementation in the SculpoDatabase package. The goals feature allows users to select multiple goals during onboarding, including a special "Other" option with custom text input.

## 🗂️ Files Added/Modified

### New Files
- `services/models/goalsModels.ts` - TypeScript interfaces and types for goals
- `services/goalsService.ts` - Dedicated service for goals functionality
- `GOALS_IMPLEMENTATION.md` - This documentation file

### Modified Files
- `services/index.ts` - Added exports for goals models and service
- `services/adminService.ts` - Added goals management methods
- `services/clientService.ts` - Added client-side goals methods

## 🎯 Models Structure

### Core Models
```typescript
// Main goal definition
GoalViewModel {
    id: string;
    title: string;
    description?: string;
    active: boolean;
    order: number;
    isOtherOption: boolean; // Special flag for "Other" option
    createdAt: Date;
    updatedAt: Date;
}

// User's response to goals
UserGoalResponseViewModel {
    id: string;
    userId: string;
    goalId: string;
    goalTitle: string; // Denormalized for performance
    selected: boolean;
    otherText?: string; // Only for "Other" option (max 50 chars)
    submittedAt: Date;
}
```

### DTOs
- `CreateGoalDto` - For creating new goals
- `UpdateGoalDto` - For updating existing goals
- `SubmitGoalResponsesDto` - For submitting user goal selections
- `GoalResponseDto` - Individual goal response

### Analytics Models
- `GoalAnalyticsViewModel` - Goal selection statistics
- `UserGoalSummaryViewModel` - User's goal summary for reporting

## 🔧 API Endpoints Structure

### Admin Endpoints (`/api/admin/goals`)
- `GET /` - Get all goals
- `GET /{id}` - Get goal by ID
- `POST /` - Create new goal
- `PUT /{id}` - Update goal
- `DELETE /{id}` - Delete goal
- `PUT /reorder` - Reorder goals
- `GET /analytics` - Get goal analytics
- `GET /user-summaries` - Get all user goal summaries
- `GET /user-summaries/{userId}` - Get specific user's goal summary

### Client Endpoints (`/api/client/goals`)
- `GET /` - Get active goals for onboarding
- `POST /` - Submit goal responses
- `GET /my-responses` - Get user's own goal responses

## 🎨 Usage Examples

### Admin Usage
```typescript
import { AdminService, GoalViewModel, CreateGoalDto } from '@/SculpoDatabase';

// Create a new goal
const newGoal: CreateGoalDto = {
    title: "Weight Loss",
    description: "Lose weight and maintain healthy body composition",
    active: true,
    order: 1,
    isOtherOption: false
};

const createdGoal = await AdminService.createGoal(newGoal);

// Create the "Other" option
const otherGoal: CreateGoalDto = {
    title: "Other",
    description: "Custom goal specified by user",
    active: true,
    order: 999, // Always last
    isOtherOption: true
};

const otherOption = await AdminService.createGoal(otherGoal);
```

### Client Usage
```typescript
import { ClientService, SubmitGoalResponsesDto } from '@/SculpoDatabase';

// Get active goals for onboarding
const goals = await ClientService.getActiveGoals();

// Submit user's goal selections
const responses: SubmitGoalResponsesDto = {
    userId: "user123",
    responses: [
        { goalId: "goal1", selected: true, otherText: null },
        { goalId: "goal2", selected: false, otherText: null },
        { goalId: "otherGoal", selected: true, otherText: "Marathon training" }
    ]
};

const success = await ClientService.submitGoalResponses(responses);
```

## 🛡️ Validation Rules

### Frontend Validation
1. "Other" option must have text if selected (max 50 characters)
2. Non-"Other" options should not have otherText
3. At least one goal should be selected (business rule)

### Backend Validation
1. String length validation for otherText (50 characters max)
2. Goal existence validation
3. User authentication validation
4. Only one goal can have `isOtherOption: true`

## 📊 Database Storage Pattern

When a user selects multiple goals, separate records are created for each goal:

```
User selects: Weight Loss ✅, Muscle Building ✅, Other: "Marathon training" ✅, Flexibility ❌

Database records:
- { userId: "user123", goalId: "goal1", selected: true, otherText: null }
- { userId: "user123", goalId: "goal2", selected: true, otherText: null }
- { userId: "user123", goalId: "goal3", selected: false, otherText: null }
- { userId: "user123", goalId: "other", selected: true, otherText: "Marathon training" }
```

## 🔄 Integration Points

### With Admin App
- Goal management UI (CRUD operations)
- Analytics dashboard
- User goal reports

### With Client App
- Onboarding flow integration
- Goal selection checklist
- "Other" text input handling

### With API
- RESTful endpoints for all operations
- Proper error handling and validation
- Analytics and reporting endpoints

## 🚀 Next Steps

1. **API Implementation**: Implement the backend API endpoints in ScupoApi
2. **Admin UI**: Create admin interface for goal management
3. **Client UI**: Integrate goals into client onboarding flow
4. **Testing**: Add unit and integration tests
5. **Documentation**: Update API documentation

## 📈 Benefits

1. **Flexible Goal Management**: Admins can easily add/remove/reorder goals
2. **Custom Goals**: Users can specify custom goals via "Other" option
3. **Analytics Ready**: Built-in analytics and reporting capabilities
4. **Scalable**: Supports unlimited goals and users
5. **Consistent**: Follows existing patterns in the codebase
6. **Type Safe**: Full TypeScript support with proper interfaces 