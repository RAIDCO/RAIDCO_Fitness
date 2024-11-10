# FitTracker

Welcome to FitTracker, a comprehensive fitness tracking application built on the Internet Computer. This application helps users track their workouts, calculate calories burned, plan meals, and view training splits.

## Features

- **Calorie Calculator**: Calculate calories burned based on:
  - Exercise type
  - Duration
  - Intensity level
  - User's weight
- **Personal Bests**: Track your records for:
  - Longest workout duration
  - Highest calories burned
- **Training Splits**: Pre-made workout routines including:
  - Push Pull Legs (PPL)
  - Upper Lower Split
  - Full Body Workouts
- **Meal Planner**: Personalized macro calculations with:
  - Custom meal plans
  - Calorie and macro tracking
  - Sample meal suggestions

## Running the project locally

If you want to test FitTracker locally, you can use the following commands:

```bash
# Starts the replica, running in the background
dfx start --background

# Deploys your canisters to the replica and generates your candid interface
dfx deploy
```

Once the job completes, your application will be available at `http://localhost:4943?canisterId={asset_canister_id}`.

If you have made changes to your backend canister, you can generate a new candid interface with:

```bash
npm run generate
```

For frontend development, start the development server with:

```bash
npm start
```

This will start a server at `http://localhost:8080`, proxying API requests to the replica at port 4943.

## Technology Stack

- Frontend: JavaScript with Lit-html
- Backend: Motoko
- Styling: SCSS
- Platform: Internet Computer

## Project Structure

- `/src/fit_backend/`: Motoko backend code
- `/src/fit_frontend/`: Frontend application code
- `/src/declarations/`: Auto-generated interface bindings
