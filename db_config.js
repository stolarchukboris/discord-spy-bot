module.exports = {
    db_config: {
        password: process.env.DB_PASS,
        user: process.env.DB_USER,
        host: 'localhost',
        port: 33060,
        schema: process.env.DB_SCHEMA
    }
}