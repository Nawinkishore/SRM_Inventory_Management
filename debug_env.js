
const fs = require('fs');
const path = require('path');

console.log("--- BACKEND .ENV ---");
try {
  const backendPath = path.join(__dirname, 'backend', '.env');
  if (fs.existsSync(backendPath)) {
     console.log(fs.readFileSync(backendPath, 'utf8'));
  } else {
     console.log("File not found: " + backendPath);
  }
} catch (e) {
  console.error("Error reading backend .env:", e.message);
}

console.log("\n--- FRONTEND .ENV ---");
try {
  const frontendPath = path.join(__dirname, 'frontend', '.env');
    if (fs.existsSync(frontendPath)) {
     console.log(fs.readFileSync(frontendPath, 'utf8'));
  } else {
     console.log("File not found: " + frontendPath);
  }
} catch (e) {
  console.error("Error reading frontend .env:", e.message);
}
