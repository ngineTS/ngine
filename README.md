# Ngine

## Run the frontend and backend locally

1. From this directory, install both apps' dependencies with `npm install`.
   npm workspaces install them together; npm may place shared dependencies in
   the root `node_modules` directory.
2. Copy `.env.example` to `.env` in this directory and configure the values.
3. Make sure PostgreSQL is running and available at `DB_HOST`/`DB_PORT` (defaults to `localhost:5432`).
4. From this directory, run:

   ```sh
   npm start
   ```

This starts the NestJS backend in watch mode and the Angular development server.
Open the frontend at the URL in `FRONTEND_URL` (by default, `http://localhost:4200`);
the backend listens on port `3000`.

For local startup, `DB_TYPE`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`,
`DB_NAME`, and `DB_SCHEMA` can be set in `.env`. If omitted, the launcher uses
PostgreSQL on localhost and maps `POSTGRES_USER`, `POSTGRES_PASSWORD`, and
`POSTGRES_DB` to the corresponding backend settings. The same `.env` remains
available to Docker Compose.
