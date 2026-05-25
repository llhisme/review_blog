const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function inspectTable() {
  try {
    const res = await pool.query(`
      SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default
      FROM 
          information_schema.columns 
      WHERE 
          table_name = 'articles'
      ORDER BY 
          ordinal_position;
    `);
    console.log('Detailed Articles Table Info:');
    console.table(res.rows);

    const constraints = await pool.query(`
      SELECT 
          conname as constraint_name, 
          pg_get_constraintdef(c.oid) as constraint_definition
      FROM 
          pg_constraint c
      JOIN 
          pg_namespace n ON n.oid = c.connamespace
      WHERE 
          contype IN ('p', 'f', 'u', 'c') 
          AND conrelid = 'articles'::regclass;
    `);
    console.log('\nConstraints on articles table:');
    console.table(constraints.rows);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

inspectTable();