// Quick script to clear progress from AsyncStorage
// Run with: node clear-progress.js

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// Replace with your email
const email = 'morgan@gmail.com';
const sanitizedEmail = email.replace(/[^a-zA-Z0-9._-]/g, '_');
const key = `lesson_progress_${sanitizedEmail}`;

console.log(`Clearing progress for key: ${key}`);
// Note: This won't work directly in Node.js, but shows the key format
console.log('To clear in React Native, use:');
console.log(`AsyncStorage.removeItem('${key}')`);
