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
      rejectUnauthorized: false
    };

async function run() {
  // Hubungkan ke database default kosong (tanpa menentukan nama DB)
  const sequelize = new Sequelize(
    '', // Dikosongkan agar bisa terhubung ke server utama tanpa me-require database tertentu
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

  try {
    console.log('Menghubungkan ke server TiDB Cloud untuk membuat database...');
    await sequelize.authenticate();
    console.log('✅ Terhubung ke server TiDB Cloud!');

    // Jalankan query untuk membuat database proyek
    const dbName = 'ninetynine_shoe';
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`✅ Database \`${dbName}\` berhasil dibuat atau sudah ada!`);

  } catch (error: any) {
    console.error('❌ Gagal membuat database:', error.message || error);
  } finally {
    await sequelize.close();
  }
}

run();
