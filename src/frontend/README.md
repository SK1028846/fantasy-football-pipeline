# Fantasy Trade Evaluator

A React application for evaluating fantasy sports trades, built with Vite and authenticated using Auth0.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Auth0

1. Create an Auth0 account at [auth0.com](https://auth0.com) if you don't have one
2. Create a new Single Page Application in your Auth0 Dashboard
3. Create an API in your Auth0 Dashboard (if you need API authentication)
4. Copy the following values from your Auth0 Dashboard:
   - Domain
   - Client ID
   - API Identifier (Audience)

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=your-api-identifier
VITE_API_BASE_URL=http://localhost:3000
```

**Note:** Replace the placeholder values with your actual Auth0 credentials.

### 4. Configure Auth0 Application Settings

In your Auth0 Dashboard, configure your application:

1. **Allowed Callback URLs**: Add `http://localhost:5173` (or your production URL)
2. **Allowed Logout URLs**: Add `http://localhost:5173` (or your production URL)
3. **Allowed Web Origins**: Add `http://localhost:5173` (or your production URL)

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port Vite assigns).

## Features

- **Authentication**: Secure login and signup using Auth0
- **Trade Evaluation**: Evaluate fantasy sports trades
- **Previous Trades**: View and paginate through previous trade evaluations
- **Protected Routes**: Routes are protected and require authentication

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

