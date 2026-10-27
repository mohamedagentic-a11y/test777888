import { Pool, QueryResult, QueryResultRow } from 'pg';

const {
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

let pool: Pool;

if (DATABASE_URL) {
  pool = new Pool({
    connectionString: DATABASE_URL,
  });
} else {
  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    console.error('FATAL ERROR: Database configuration is missing. Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME environment variables.');
    process.exit(1);
  }

  pool = new Pool({
    host: DB_HOST,
    port: DB_PORT ? parseInt(DB_PORT, 10) : 5432,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });
}

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export { pool };

export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};