# Ngine

## Run the application with docker compose

   From this directory, run:

      ```sh
         docker compose up
      ```


## Run the application locally

1. From this directory, install both apps dependencies with:

   ```sh
      npm start
   ```

   npm workspaces install them together; npm may place shared dependencies in the root `node_modules` directory.
2. Copy `.env.example` to `.env` in this directory and configure the values.
3. Make sure PostgreSQL is running and available at `DB_HOST`/`DB_PORT` (defaults to `localhost:5432`).
4. From this directory, run:

   ```sh
   npm start
   ```

This starts the NestJS backend in watch mode and the Angular development server.
Open the frontend at the URL in `FRONTEND_URL` (by default, `http://localhost:4200`);
the backend listens on port `3000`.

