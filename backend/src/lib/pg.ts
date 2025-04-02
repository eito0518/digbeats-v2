import { Pool } from "pg";

const connectionString = process.env.SUPABASE_DB_URL;

export const pool = new Pool({
  connectionString,
  max: 10,
});
