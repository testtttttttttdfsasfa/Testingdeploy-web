// Test Database Connection
console.log('🔍 Testing database connection...\n');

require('dotenv').config();

const mysql = require('mysql2');

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gereja_damai_kristus',
  port: process.env.DB_PORT || 3306
};

console.log('📋 Configuration:');
console.log(`   Host: ${config.host}`);
console.log(`   User: ${config.user}`);
console.log(`   Database: ${config.database}`);
console.log(`   Port: ${config.port}`);
console.log(`   Password: ${config.password ? '***' : '(empty)'}\n`);

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed!');
    console.error('Error:', err.message);
    console.error('\n💡 Tips:');
    console.error('   1. Make sure MySQL is running');
    console.error('   2. Check your password in .env file');
    console.error('   3. Verify database exists: mysql -u root -p');
    process.exit(1);
  }

  console.log('✅ Database connected successfully!\n');

  // Test query
  connection.query('SELECT COUNT(*) as count FROM finance', (err, results) => {
    if (err) {
      console.error('❌ Query failed:', err.message);
      connection.end();
      process.exit(1);
    }

    console.log(`📊 Finance table has ${results[0].count} records\n`);
    console.log('🎉 Everything looks good! You can now run: npm run dev\n');
    
    connection.end();
    process.exit(0);
  });
});
