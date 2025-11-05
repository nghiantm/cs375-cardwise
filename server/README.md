# CardWise API

This repository contains a minimal Express API written in Node.js that connects to a MongoDB database using Mongoose. It includes CORS for cross‑origin requests, uses `dotenv` for environment variable management, provides a simple health check route, and centralizes error handling. Docker and Docker Compose files are included for easy containerized deployment.

## Features

- **Express server** built with Node.js (JavaScript).
- **MongoDB connection** using Mongoose, with clear logging of successful connections or errors.
- **CORS** enabled (allowing all origins in development).
- **Environment variables** loaded from a `.env` file via `dotenv`.
- **Centralized error handling** that returns JSON in a consistent format.
- **Dockerfile** and **docker‑compose.yml** for containerized development and production.

## Getting Started

These instructions will help you run the API on your local machine for development and testing purposes. They also cover running the API using Docker Compose.

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or newer
- [npm](https://www.npmjs.com/)
- (Optional) [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) if you wish to run the services in containers

### Installation (Local Development)

1. Clone this repository and navigate into the `server` directory:

   ```bash
   cd server
   ```

2. Copy the example environment file and adjust the variables if necessary:

   ```bash
   cp .env.example .env
   # Edit .env to set PORT and MONGO_URI if needed
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the development server with hot reloading:

   ```bash
   npm run dev
   ```

   This command uses `nodemon` to automatically restart the server when you make changes. The server will listen on the port defined in `.env` (default is 3000).

5. To run in production mode without hot reloading, use:

   ```bash
   npm start
   ```

### Running with Docker Compose

The included `docker-compose.yml` spins up two services: the API and a MongoDB instance. The API connects to Mongo using the service name `mongo` on the default port.

1. Ensure Docker and Docker Compose are installed.
2. From the `server` directory, run:

   ```bash
   docker-compose up --build
   ```

   This will build the API image, start a MongoDB container, and expose the API on port 3000 and MongoDB on port 27017. The MongoDB data is persisted in a named volume `mongo_data`.

3. To run the services in detached mode, append `-d`:

   ```bash
   docker-compose up -d --build
   ```

4. To stop the services:

   ```bash
   docker-compose down
   ```

### API Endpoints

#### Health Check

The API exposes a simple health check endpoint that you can use to verify the server is running:

```
GET /api/health
```

**Response**

```json
{
  "status": "ok",
  "version": "v1"
}
```

#### Error Handling

Any unhandled errors in the application will be passed to the centralized error handler. It responds with HTTP status code 500 and the following JSON structure:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error"
  }
}
```

### Testing

You can test the health endpoint using `curl`:

```bash
curl -s http://localhost:3000/api/health
# Expected output: {"status":"ok","version":"v1"}
```

### Notes

- The server attempts to connect to MongoDB on startup. If MongoDB is unavailable (for example, if it’s not running locally when not using Docker), the server will log an error but will continue to run so the health endpoint still works.
- Do not commit your `.env` file or any secrets to version control. Use `.env.example` as a template for your own environment file.

### Using MongoDB Atlas (cloud)

If you want to use MongoDB Atlas, create a cluster on Atlas and copy the connection string (it begins with `mongodb+srv://`). Set that value in your `.env` file as `MONGODB_URI`.

Example `.env` entry:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcd1.mongodb.net/myDatabase?retryWrites=true&w=majority
PORT=3000
```

Keep credentials out of source control. For Docker deployments, pass `MONGODB_URI` as an environment variable in your `docker-compose.yml` or via your container orchestration secrets manager.


# Other Details

## API


## Frontend ↔ API (User-facing)

### Cards
GET    /api/cards                    - list all cards (with filters)
GET    /api/cards/:id                - get single card details
GET    /api/cards/recommend          - NEW: get card recommendations based on spending

### User Spending
POST   /api/spending                 - add a spending transaction
GET    /api/spending                 - get user's spending history
GET    /api/spending/:id             - get single transaction
PUT    /api/spending/:id             - update a transaction
DELETE /api/spending/:id             - delete a transaction
GET    /api/spending/summary         - NEW: get spending summary by category

### Analytics
POST   /api/cards/analyze            - trigger analysis for user's spending pattern
GET    /api/analytics/profile        - NEW: get user's spending profile
GET    /api/analytics/savings        - NEW: calculate potential savings with different cards

### Users (optional, for later)
POST   /api/users/register           - create account
POST   /api/users/login              - authenticate
GET    /api/users/profile            - get user profile


## API ↔ Scripts:
### Scraper Control
POST   /api/scraper/run              - trigger scraper (with target: "chase", "amex", etc.)
GET    /api/scraper/status           - check last scraper run status
GET    /api/scraper/jobs             - NEW: list all scraper job history

### Data Access 
GET    /api/data/cards/raw           - get raw scraped card data (for script processing)
POST   /api/data/cards/bulk          - bulk insert processed cards from scripts
GET    /api/data/export/:collection  - export collection as JSON (for analysis)

