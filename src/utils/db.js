import mysql from 'mysql2/promise';

export async function executeQuery({ query, values = [] }) {
const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

try {
    const [results] = await connection.execute(query, values);
    return results;
} catch (error) {
    console.error('Database query error:', error);
    throw error;
} finally {
    await connection.end();
}
}