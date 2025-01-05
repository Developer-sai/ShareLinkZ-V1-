import { Pool } from 'pg';

const pool = new Pool({
  user: 'your_username',
  host: 'localhost',
  database: 'sharelinkz',
  password: 'your_password',
  port: 5432,
});

export default pool;

