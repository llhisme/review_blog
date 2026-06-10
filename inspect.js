const pool = require('./config/database');
async function inspectTables() {
    try {
        const client = await pool.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log('Tables:', res.rows.map(r => r.table_name).join(', '));
        client.release();
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
inspectTables();
