import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 4000;

const sslConfig = process.env.DB_CA
  ? {
      ca: fs.readFileSync(process.env.DB_CA),
      rejectUnauthorized: true
    }
  : {
      rejectUnauthorized: false // Membantu koneksi langsung tanpa ribet mengunduh file CA
    };

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'sys',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: sslConfig
    }
  }
);
