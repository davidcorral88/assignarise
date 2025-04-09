
const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
  user: 'task_control',
  host: 'localhost',
  database: 'controltarefasv2', // Actualizado para a nova base de datos
  password: 'dc0rralIplan',
  port: 5433,
});

// Test database connection on initialization
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
    console.log('Using database: controltarefasv2');
  }
});

module.exports = pool;
