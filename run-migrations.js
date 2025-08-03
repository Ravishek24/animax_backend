const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Running database migrations...');

// Run migrations
const migrateCommand = 'npx sequelize-cli db:migrate';

exec(migrateCommand, { cwd: __dirname }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Migration error:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Migration warnings:', stderr);
  }
  
  console.log('✅ Migrations output:', stdout);
  console.log('🎉 Database migrations completed successfully!');
}); 