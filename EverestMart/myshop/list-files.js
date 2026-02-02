const fs = require('fs');
const path = require('path');

function listFiles(dir, indent = 0) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      if (['node_modules', '.git'].includes(file)) return;
      
      const fullPath = path.join(dir, file);
      const spaces = '  '.repeat(indent);
      
      console.log(spaces + file);
      
      try {
        if (fs.statSync(fullPath).isDirectory()) {
          listFiles(fullPath, indent + 1);
        }
      } catch (err) {}
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

console.log('\n=== FRONTEND ===');
console.log('src/');
listFiles('./src', 1);

console.log('\n=== BACKEND ===');
console.log('myshop-backend/');
listFiles('./myshop-backend', 1);
