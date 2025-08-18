# SculpoDatabase - Shared Services

This package contains shared database services and API layer for the Sculpo application ecosystem.

## Installation

```bash
npm install
```

## Development

```bash
# Install dependencies
npm install

# Start development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test
```

## Usage

### Importing Services

```typescript
// Import individual services
import { AdminService, AuthService, ProfileService, ServicesService } from 'sculpo-database';

// Import axios instance
import { axiosInstance } from 'sculpo-database';

// Import types
import { ProfileFullViewModel, UserType, LoginDto } from 'sculpo-database';
```

### Available Services

- **AdminService**: Admin-related operations (delivery formats management)
- **AuthService**: Authentication operations (login, logout, token management)
- **ProfileService**: User profile management (CRUD operations)
- **ServicesService**: Service management for trainers

### Configuration

Make sure to configure the environment variables in your consuming applications:

```typescript
// environment.ts
export const environment = {
  apiUrl: 'your-api-base-url'
};
```

## Project Structure

```
SculpoDatabase/
├── services/
│   ├── models/
│   │   ├── deliverFormatModels.ts
│   │   └── servicesModels.ts
│   ├── adminService.ts
│   ├── authService.ts
│   ├── axiosConfig.ts
│   ├── profileService.ts
│   ├── servicesService.ts
│   └── index.ts
├── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Dependencies

This package requires the following peer dependencies in your consuming application:

- `@react-native-async-storage/async-storage`
- `expo-router` (for React Native/Expo apps)
- Environment configuration with `apiUrl`

## Notes

- All services use the shared `axiosInstance` for consistent HTTP configuration
- Authentication tokens are automatically handled via interceptors
- Services include proper error handling and logging 