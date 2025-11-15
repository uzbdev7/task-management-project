/* eslint-disable no-undef */
import 'dotenv/config'

export default {
    development: {
        client: "pg",
        connection: process.env.DATABASE_URL, 
        migrations: {
            directory: "./migrations",
        }
    }
};
