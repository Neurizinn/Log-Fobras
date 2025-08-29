# replit.md

## Overview

This is a cargo and truck management system built as a modern web application with a full-stack architecture. The system implements a Kanban-style interface for managing loading and unloading operations at a logistics facility. It features Microsoft authentication integration, real-time status tracking, and both simplified (TV display) and detailed professional views.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom logistics theme variables
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)
- **API Design**: RESTful endpoints with JSON responses

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Connection**: Neon serverless connection pool with WebSocket support
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Location**: `shared/schema.ts` for type-safe schema definitions shared between frontend and backend

## Key Components

### Authentication System
- **Provider**: Microsoft OAuth integration (currently mocked for development)
- **Authorization**: Company domain email validation
- **Session Storage**: Server-side sessions with PostgreSQL backing
- **Security**: HTTP-only cookies, CSRF protection, secure session configuration

### Database Schema
- **Users**: User accounts with role-based permissions (admin, operator, viewer)
- **Vehicles**: Truck and trailer registration with plates, capacity, transport companies
- **Materials**: Material catalog with categories, units, weights, and risk classifications
- **Operations**: Core workflow entity tracking loading/unloading operations through status progression

### Status Workflow
Operations progress through defined states:
1. **Scheduled** - Planned operations with date/time
2. **At Gate** - Vehicle arrived at facility entrance
3. **Loading** - Active loading operations
4. **Unloading** - Active unloading operations
5. **Completed** - Finished operations

### User Interface Components
- **Dashboard**: Central navigation hub with status cards
- **Simplified View**: Full-screen TV display for warehouse monitoring
- **Complete View**: Professional interface with filtering, search, and detailed management
- **Registrations**: Administrative forms for vehicles, materials, and user permissions
- **Reports**: Analytics and operational reporting

## Data Flow

### Authentication Flow
1. User initiates Microsoft OAuth login
2. Server validates company domain email
3. User record created/updated in database
4. Session established with role-based permissions
5. Frontend receives user context and navigation access

### Operations Management Flow
1. Operations created through registration interface
2. Status updates tracked through API endpoints
3. Real-time data fetched via TanStack Query
4. UI components reactively update based on status changes
5. Kanban-style organization in simplified view

### Database Operations
- **Create**: New vehicles, materials, and operations via validated forms
- **Read**: Real-time queries for dashboard statistics and operation lists
- **Update**: Status transitions and entity modifications
- **Delete**: Administrative removal of entities with referential integrity

## External Dependencies

### Production Dependencies
- **Database**: Neon PostgreSQL serverless platform
- **UI Components**: Radix UI primitives for accessibility
- **Icons**: Lucide React icon library
- **Authentication**: Microsoft Graph API (production implementation)
- **Form Validation**: Zod schema validation
- **Date Handling**: date-fns library

### Development Tools
- **Build**: Vite with React plugin and TypeScript support
- **Development**: TSX for TypeScript execution
- **Database**: Drizzle Kit for schema management and migrations
- **Linting**: TypeScript compiler for type checking

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React application to `dist/public`
2. **Backend**: ESBuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied to production database

### Environment Configuration
- **Development**: Local development with TSX and Vite dev server
- **Production**: Node.js server serving static files and API endpoints
- **Database**: Environment-based connection strings for Neon PostgreSQL

### Session Management
- **Storage**: PostgreSQL-backed sessions for scalability
- **Security**: Secure cookies in production, HTTP-only for development
- **Persistence**: 24-hour session lifetime with automatic table creation

### Monitoring
- **Logging**: Request/response logging for API endpoints
- **Error Handling**: Centralized error middleware with status code mapping
- **Performance**: Query optimization through Drizzle ORM

This architecture provides a robust foundation for a logistics management system with room for scaling both user base and feature complexity.