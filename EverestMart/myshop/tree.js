/* eslint-env node */
const fs = require('fs');
const path = require('path');

const EXCLUDE = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];

function tree(dir, prefix = '', result = []) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach((file, index) => {
      if (EXCLUDE.includes(file)) return;

      const filePath = path.join(dir, file);
      const isLast = index === files.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const newPrefix = prefix + (isLast ? '    ' : '│   ');

      result.push(prefix + connector + file);

      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          tree(filePath, newPrefix, result);
        }
      } catch {
        // Skip files that can't be accessed
      }
    });
  } catch (err) {
    console.error('Error reading directory:', err.message);
  }

  return result;
}

// Generate frontend tree
console.log('\n📁 FRONTEND STRUCTURE:\n');
const frontendPath = path.join(__dirname, 'src');
if (fs.existsSync(frontendPath)) {
  const frontendTree = tree(frontendPath);
  console.log('src/');
  frontendTree.forEach(line => console.log(line));
} else {
  console.log('❌ src/ folder not found');
}

// Generate backend tree
console.log('\n\n📁 BACKEND STRUCTURE:\n');
const backendPath = path.join(__dirname, 'myshop-backend');
if (fs.existsSync(backendPath)) {
  const backendTree = tree(backendPath);
  console.log('myshop-backend/');
  backendTree.forEach(line => console.log(line));
} else {
  console.log('❌ myshop-backend/ folder not found');
}

console.log('\n✅ Done!\n');
