# Workforce Management System

## Overview

This is a full-stack workforce management application built for managing field workers across different specialties (plumbing, electrical, drilling, HVAC). The system provides role-based dashboards for administrators, HR managers, and field workers, with real-time job tracking, time management, and comprehensive reporting capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with role-based access control

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Session Store**: PostgreSQL-backed session storage
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Database Schema
The application uses a comprehensive PostgreSQL schema with the following main entities:

1. **Users Table**: Authentication and user management
   - Supports admin, hr, and worker roles
   - Stores basic profile information

2. **Workers Table**: Extended worker-specific data
   - Specialty tracking (plumbing, electrical, drilling, HVAC)
   - Status management (available, working, offline)
   - Location data and performance metrics

3. **Jobs Table**: Work order management
   - Job types, priorities, and status tracking
   - Location data and scheduling information
   - Customer details and duration tracking

4. **Job Reports Table**: Work completion documentation
5. **Activities Table**: System activity logging
6. **Time Tracking Table**: Worker time management

### Authentication & Authorization
- Session-based authentication using express-session
- Role-based access control (admin, hr, worker)
- Middleware functions for route protection
- Secure password handling (basic implementation)

### User Interface Components
- **Dashboard Views**: Role-specific interfaces for different user types
- **Interactive Maps**: Location-based job and worker tracking
- **Form Management**: React Hook Form with Zod validation
- **Photo Upload**: Multi-category image upload system
- **Real-time Updates**: Simulated real-time data refresh
- **Responsive Design**: Mobile-first approach with responsive layouts

## Data Flow

1. **Authentication Flow**: Login → Session creation → Role-based routing
2. **Job Management**: Creation → Assignment → Progress tracking → Completion
3. **Worker Management**: Status updates → Location tracking → Performance monitoring
4. **Real-time Updates**: Periodic data refresh for live dashboard updates

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **ORM**: drizzle-orm and drizzle-zod for database operations
- **UI Framework**: Comprehensive Radix UI component library
- **State Management**: @tanstack/react-query for server state
- **Validation**: Zod schemas for type-safe data validation
- **Session Management**: express-session with connect-pg-simple

### Development Tools
- **Build**: Vite with React plugin and TypeScript support
- **Styling**: Tailwind CSS with PostCSS
- **Development**: tsx for TypeScript execution
- **Database Tools**: Drizzle Kit for migrations and schema management

## Deployment Strategy

### Development Environment
- Replit-hosted with Node.js 20 runtime
- PostgreSQL 16 module integration
- Hot reload with Vite development server
- Environment-specific configuration

### Production Build
- Vite build for client-side assets
- esbuild for server-side bundling
- Static file serving from Express
- Autoscale deployment target on Replit

### Configuration
- Environment variables for database connections
- Session secrets and security configuration
- Development vs production mode handling

## Changelog

Changelog:
- June 17, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.