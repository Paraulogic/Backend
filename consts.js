
const DATABASE_NAME = process.env['DATABASE_NAME'];
const HTTP_PORT = process.env['HTTP_PORT'];

const MONGO_URI = `mongodb://db:27017/${DATABASE_NAME}`;

module.exports = { DATABASE_NAME, HTTP_PORT, MONGO_URI };
