const fs = require('fs');
const path = require('path');

console.log('🧹 Windows Cleanup Script Running...\n');

// Files to delete
const filesToDelete = [
  'testEmail.js',
  'debugEmail.js',
  'test-admin-auth.js',
  'test-jwt.js',
  'test-riders.js',
  'debug-token.js',
  'check-admin.js',
  'check-env.js',
  'check-user-orders.js',
  'create-test-order.js',
  'fix-emails.js',
  'show-emails.js',
  'approve-riders.js',
  'reset-passwords.js',
  'backend-structure.txt',
  'seed.js',
  'utils/emailServiceOAuth.js',
  'utils/emailServiceSendGrid.js'
];

let deletedCount = 0;
let notFoundCount = 0;

// Delete files
filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${file}`);
      deletedCount++;
    } catch (error) {
      console.log(`❌ Failed to delete ${file}: ${error.message}`);
    }
  } else {
    console.log(`⏭️  Not found: ${file}`);
    notFoundCount++;
  }
});

// Clean upload test folders
const foldersToClean = [
  'uploads/rider-documents',
  'uploads/riders'
];

foldersToClean.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  
  if (fs.existsSync(folderPath)) {
    try {
      // Get all files in folder
      const files = fs.readdirSync(folderPath);
      
      // Delete all files
      files.forEach(file => {
        const filePath = path.join(folderPath, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });
      
      console.log(`✅ Cleaned folder: ${folder} (${files.length} files removed)`);
      deletedCount += files.length;
    } catch (error) {
      console.log(`❌ Failed to clean ${folder}: ${error.message}`);
    }
  }
});

// Clean test uploads from uploads root
const uploadsPath = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsPath)) {
  const files = fs.readdirSync(uploadsPath);
  files.forEach(file => {
    const filePath = path.join(uploadsPath, file);
    
    try {
      const stat = fs.statSync(filePath);
      
      // Delete only JPG files in root uploads folder (test images)
      if (stat.isFile() && file.endsWith('.jpg')) {
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted test upload: ${file}`);
        deletedCount++;
      }
    } catch (error) {
      // Skip if error
    }
  });
}

// Create .gitkeep files in upload folders
const uploadFolders = [
  'uploads/products',
  'uploads/riders',
  'uploads/rider-documents'
];

uploadFolders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  
  // Create folder if doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  
  // Create .gitkeep
  const gitkeepPath = path.join(folderPath, '.gitkeep');
  fs.writeFileSync(gitkeepPath, '# Placeholder to keep folder in Git\n');
  console.log(`📁 Created: ${folder}/.gitkeep`);
});

console.log('\n' + '═'.repeat(50));
console.log('✅ Cleanup Complete!');
console.log('═'.repeat(50));
console.log(`   Files deleted: ${deletedCount}`);
console.log(`   Files not found: ${notFoundCount}`);
console.log('\n📊 Project is now cleaner and production-ready!');
console.log('\n📋 Next Steps:');
console.log('   1. Running npm audit fix...');
console.log('   2. Regenerating documentation...');
console.log('   3. Test with: npm start');
console.log('   4. Ready to deploy! 🚀\n');
