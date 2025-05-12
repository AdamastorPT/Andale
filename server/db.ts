import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create connection string
const connectionString = process.env.DATABASE_URL;

// Create a connection instance
// For migrations and other operations that require exclusive connection
const migrationClient = postgres(connectionString, { max: 1 });

// For query purposes (can be reused)
const queryClient = postgres(connectionString);

// Initialize Drizzle with the client and schema
export const db = drizzle(queryClient, { schema });

// Run migrations
async function runMigrations() {
  try {
    console.log('Running migrations...');
    await migrate(drizzle(migrationClient), { migrationsFolder: 'drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

// Export the migration function to be called from the server entry point
export { runMigrations };