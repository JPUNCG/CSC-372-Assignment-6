/**
 * Name: Jeethesh Pallinti
 * Date: 04.02.2026
 * Handles the database connection using the URL from the .env file.
 */

let { Pool } = require('pg');
require('dotenv').config();

let pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = pool;