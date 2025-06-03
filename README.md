# Car Dealership RESTful API

A comprehensive TypeScript/Express/MongoDB API for managing a car dealership with authentication, filtering, and full CRUD operations.

## Features

- User authentication with JWT
- Role-based authorization (customer, manager, admin)
- CRUD operations for cars, categories, customers, and managers
- Advanced car filtering and pagination
- Comprehensive error handling
- Automated testing suite

## Technologies

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- Jest (testing)
- Supertest (HTTP testing)

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/car-dealership-api.git
   cd car-dealership-api

2. Install dependencies:

- npm install

3. Set up environment variables (.env):

- PORT=3000
- MONGODB_URI=mongodb://localhost:27017/car-dealership
- JWT_SECRET=your-secret-key

5. Database:

- MONGODB_URI=mongodb://localhost:27017/car-dealership

4. Start the development server:

- npm run dev

## Testing

- npm test

## Deployment

- npm run build