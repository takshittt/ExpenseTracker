const dotenv = require('dotenv');
const path = require('path');

// Load env vars based on NODE_ENV
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';

// Set the path to the env file
const envPath = path.resolve(process.cwd(), envFile);

// Load env vars
const result = dotenv.config({ path: envPath });

if (result.error) {
  // Fallback to default .env if specific environment file is not found
  dotenv.config();
}

// Export the parsed environment variables
module.exports = result.parsed || {};
