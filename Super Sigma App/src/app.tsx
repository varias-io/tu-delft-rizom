import "./events/index.js"
import { app } from './utils/index.js';

// Start your app
await app.start(process.env.PORT || 9000);

console.log('⚡️ Bolt app is running!');
