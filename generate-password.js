// Script untuk generate password hash
// Jalankan: node generate-password.js

const bcrypt = require('bcryptjs');

async function generatePasswords() {
    console.log('Generating password hashes...\n');
    
    // Password untuk admin
    const adminPassword = 'admin123';
    const adminHash = await bcrypt.hash(adminPassword, 10);
    console.log(`Admin password: ${adminPassword}`);
    console.log(`Admin hash: ${adminHash}\n`);
    
    // Password untuk user lain
    const userPassword = 'password123';
    const userHash = await bcrypt.hash(userPassword, 10);
    console.log(`User password: ${userPassword}`);
    console.log(`User hash: ${userHash}\n`);
    
    console.log('='.repeat(60));
    console.log('Copy hash di atas ke file database/gereja_lengkap.sql');
    console.log('Ganti $2a$10$YourHashedPasswordHere dengan hash yang sesuai');
    console.log('='.repeat(60));
}

generatePasswords().catch(console.error);
