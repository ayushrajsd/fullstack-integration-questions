
# CineScope MERN Lab 2: Authentication System — Register, Login, and JWT

This repository contains a working demo solution for **LAB 2: User Auth — Register, Login & JWT**. It implements the backend Express/MongoDB authentication API and the frontend React auth service/forms that learners can run and test.

## What was implemented

- `POST /api/auth/register`
  - Accepts `{ name, email, password }`.
  - Rejects duplicate emails with `400` and `{ success: false, message: 'Email already registered' }`.
  - Hashes passwords with `bcrypt.hash(password, 10)` before saving.
  - Creates a JWT with payload `{ userId: user._id }`, `process.env.JWT_SECRET`, and `expiresIn: '7d'`.
  - Returns `201` with `{ success: true, token, user: { _id, name, email } }`.
- `POST /api/auth/login`
  - Accepts `{ email, password }`.
  - Rejects unknown users with `404` and `{ success: false, message: 'User not found' }`.
  - Rejects wrong passwords with `401` and `{ success: false, message: 'Invalid credentials' }`.
  - Returns `200` with a JWT and public user object on success.
- Frontend auth service
  - Calls the backend register/login routes with `axios`.
  - Stores successful JWTs in `localStorage` under `cinescope_token`.
  - Re-throws request errors automatically by not catching them in the service, so pages can display API error messages.
- React demo pages
  - `/register` creates accounts, stores the returned token, and then shows a success nudge that links learners to `/login` so they test the login flow with their new credentials.
  - `/login` signs in existing users and redirects to `/browse`.
  - `/browse` is a simple authenticated destination page for the lab demo and includes a logout button that clears the saved token.

## Project structure

```text
.
├── models/User.js                 # Provided Mongoose user model
├── routes/authRoutes.js           # Register/login route handlers
├── server.js                      # Express app and Mongo connection bootstrap
├── src/services/authService.js    # Frontend axios auth calls and token storage
├── src/pages/Register.jsx         # Register form
├── src/pages/Login.jsx            # Login form
├── src/pages/Browse.jsx           # Demo post-auth route
├── tests/auth.test.js             # Backend Jest/Supertest test cases
└── cypress/e2e/auth.cy.js         # Frontend Cypress auth-flow tests
```

## Environment setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

3. Set values in `.env`:

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/cinescope
   JWT_SECRET=replace-with-a-long-random-secret
   ```

## Running the demo application

Start the backend and frontend together:

```bash
npm run dev
```

- API server: <http://localhost:5000>
- React app: <http://localhost:5173>

You can also run each side separately:

```bash
npm run server
npm run client
```

## Authentication flow for learners

### Register flow

1. The learner opens `/register`.
2. `Register.jsx` controls the form state for `name`, `email`, and `password`.
3. On submit, the page calls `registerUser(name, email, password)`.
4. `registerUser` sends `POST http://localhost:5000/api/auth/register` with the form body.
5. The backend checks whether the email already exists.
6. If the email is new, the backend hashes the password and creates the user.
7. The backend signs a 7-day JWT containing `{ userId: user._id }`.
8. The frontend stores the returned token as `localStorage.cinescope_token`.
9. Instead of skipping ahead, the register page stays visible and shows a success message with a link to `/login`. This nudges learners to verify the second half of the lab by logging in with the credentials they just created.
10. The login link passes the registered email in router state, so the login form can prefill the email field.

### Duplicate registration flow

1. The learner submits a register form with an email already in the database.
2. The backend returns `400` with `Email already registered`.
3. Axios rejects the request.
4. `Register.jsx` catches the error and displays the backend message in `[data-testid="error-msg"]`.

### Login flow

1. The learner opens `/login`.
2. `Login.jsx` controls the form state for `email` and `password`.
3. On submit, the page calls `loginUser(email, password)`.
4. `loginUser` sends `POST http://localhost:5000/api/auth/login`.
5. The backend finds the user by email.
6. The backend compares the typed password with the saved bcrypt hash.
7. If the credentials are correct, the backend signs and returns a JWT.
8. The frontend stores the token as `localStorage.cinescope_token`.
9. The page redirects to `/browse`.
10. On `/browse`, the learner can click **Logout** to remove `localStorage.cinescope_token` and return to `/login`.

### Wrong password flow

1. The learner submits `/login` with an existing email but the wrong password.
2. The backend returns `401` with `Invalid credentials`.
3. Axios rejects the request.
4. `Login.jsx` catches the error and displays the backend message in `[data-testid="error-msg"]`.

## Backend testing

Backend tests use **Jest**, **Supertest**, and **mongodb-memory-server**. The memory server means learners do not need a local MongoDB instance to run the automated backend tests.

Run backend tests:

```bash
npm run test:backend
```

The backend test suite covers:

1. Successful registration returns `201`, a JWT, and a public user object without `password`.
2. Duplicate email registration returns `400`.
3. Successful login returns `200`, a JWT, and a public user object.
4. Wrong password login returns `401`.

## Frontend testing

Frontend end-to-end tests use **Cypress**. The tests intercept API calls so they can verify the React flow without depending on a live backend or database.

In one terminal, start Vite:

```bash
npm run client
```

In another terminal, run Cypress headlessly:

```bash
npm run test:frontend
```

The Cypress suite covers:

1. Register page renders the name, email, password, and submit button.
2. Successful registration stores `cinescope_token` and shows the login nudge link instead of redirecting directly to browse.
3. The login nudge link opens `/login` and prefills the registered email.
4. Successful login stores a login JWT and redirects to `/browse`.
5. Logout removes `cinescope_token` and redirects to `/login`.
6. Duplicate registration displays `Email already registered`.
7. Wrong-password login displays `Invalid credentials`.

## Manual API checks

After starting the API with `npm run server`, you can manually test with `curl`.

Register:

```bash
curl -i -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@test.com","password":"secret123"}'
```

Login:

```bash
curl -i -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@test.com","password":"secret123"}'
```
