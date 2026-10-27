import { Pool, QueryResult, QueryResultRow } from 'pg';

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  throw new Error('FATAL: Missing required database configuration environment variables. Ensure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME are set.');
}

const pool = new Pool({
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

export { pool };

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};