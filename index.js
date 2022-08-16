const cron = require('node-cron');

const HTTP_PORT = process.env['HTTP_PORT'];
if (HTTP_PORT == null)
    process.env['HTTP_PORT'] = '3000';
const DATABASE_NAME = process.env['DATABASE_NAME'];
if (DATABASE_NAME == null)
    process.env['DATABASE_NAME'] = 'paraulogic';

const production = (process.env['PRODUCTION'] ?? 'false') === 'true';

const {run} = require('./main');
const {routine} = require('./worker');

// Run every 5 minutes at second 0
cron.schedule('*/5 * * * *', () => routine());

// Initialize the app
run(production).catch(console.dir);
