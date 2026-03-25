import {Pool} from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const { POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE, POSTGRES_PORT } = process.env;

export const client = new Pool({
    host: POSTGRES_HOST,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DATABASE,
    port: POSTGRES_PORT ? parseInt(POSTGRES_PORT, 10) : undefined
});

