const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

async function test() {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    try {
        console.log('Connecting with raw driver...');
        await client.connect();
        console.log('RAW_SUCCESS: Connected.');
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('RAW_FAILURE:');
        console.error(err);
        process.exit(1);
    }
}

test();
