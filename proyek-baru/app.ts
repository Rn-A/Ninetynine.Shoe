import { sequelize } from './database.js';
import { DataTypes } from 'sequelize';

// Contoh definisi tabel User
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true }
});

async function startApp() {
  try {
    console.log('Mencoba menghubungkan ke TiDB Cloud...');
    // 1. Uji koneksi ke TiDB Cloud
    await sequelize.authenticate();
    console.log('✅ Berhasil terhubung ke database TiDB Cloud!');

    // 2. Buat tabel secara otomatis di TiDB Cloud jika belum ada
    await sequelize.sync({ alter: true });
    console.log('✅ Tabel database berhasil disinkronisasikan!');

  } catch (error: any) {
    console.error('❌ Gagal terhubung ke database TiDB:', error);
  } finally {
    await sequelize.close();
  }
}

startApp();
