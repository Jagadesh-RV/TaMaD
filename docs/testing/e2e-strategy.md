# E2E Test Strategy for TaMaD

## Objective
To ensure end-to-end tests are deterministic, safe, and isolated from the production environment. We use Playwright for our E2E testing framework.

## Approach: Firebase Emulators
We use **Firebase Local Emulator Suite** for E2E tests. This guarantees:
1. No pollution of production data.
2. Fast test execution without network latency to Firebase.
3. Completely deterministic authentication state.

## Configuration
When running E2E tests, the application must be configured to connect to the emulators.
This is controlled by the `VITE_USE_FIREBASE_EMULATOR=true` and `USE_FIREBASE_EMULATOR=true` environment variables.

## Running Tests Locally
To run tests locally using the emulator:
1. Start the emulators:
   ```bash
   pnpm emulators
   ```
2. In a separate terminal, start the E2E tests:
   ```bash
   VITE_USE_FIREBASE_EMULATOR=true USE_FIREBASE_EMULATOR=true pnpm test:e2e
   ```

## CI/CD Pipeline
In the GitHub Actions pipeline, the process is:
1. Install `firebase-tools`.
2. Start the emulator in the background:
   ```bash
   firebase emulators:exec "pnpm test:e2e"
   ```
3. Playwright handles standing up the local frontend (`pnpm dev` or `preview`) and backend (`node backend/dist/index.js`), which will pick up the `USE_FIREBASE_EMULATOR=true` environment variables defined in the CI YAML.

## Test Data Seeding
Before tests run, `playwright.config.ts` runs a `setup` project (`auth.setup.ts`).
When connected to the emulator, `auth.setup.ts` safely registers a dummy user because the emulator database starts empty.
If the test requires workspaces or tasks to exist, `setup` should insert them via API calls to the backend running locally.
