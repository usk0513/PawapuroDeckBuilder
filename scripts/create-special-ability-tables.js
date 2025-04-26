// Create special ability tables script
import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;
dotenv.config();

async function createTables() {
  // Create a new client
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Create special_abilities table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS special_abilities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        player_type TEXT NOT NULL
      );
    `);
    console.log('Created special_abilities table');

    // Create character_special_ability_sets table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS character_special_ability_sets (
        id SERIAL PRIMARY KEY,
        character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
        name TEXT,
        player_type TEXT NOT NULL,
        choice_type TEXT NOT NULL,
        description TEXT
      );
    `);
    console.log('Created character_special_ability_sets table');

    // Create special_ability_set_items table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS special_ability_set_items (
        id SERIAL PRIMARY KEY,
        set_id INTEGER NOT NULL REFERENCES character_special_ability_sets(id) ON DELETE CASCADE,
        special_ability_id INTEGER NOT NULL REFERENCES special_abilities(id) ON DELETE CASCADE,
        "order" INTEGER NOT NULL DEFAULT 1
      );
    `);
    console.log('Created special_ability_set_items table');

    console.log('All tables created successfully');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    // Close the client
    await client.end();
    console.log('Connection closed');
  }
}

createTables().catch(console.error);