
const {MongoClient} = require("mongodb");
const {startOfDay, endOfDay} = require("date-fns");

const {fetchSource, decodeSource} = require("./loader");
const {MONGO_URI, DATABASE_NAME} = require("./consts");

const makeDataRequest = async () => {
    console.info("Downloading data from Paraulògic...");
    const source = await fetchSource();
    console.info("Parsing data...")
    return decodeSource(source);
};

module.exports = {
    routine: async () => {
        const db = new MongoClient(MONGO_URI);
        try {
            await db.connect();
            const dbo = db.db(DATABASE_NAME);
            const collection = dbo.collection('game_info');

            let now = new Date();
            const result = await collection
                .findOne({
                    timestamp: {
                        $gte: startOfDay(now),
                        $lte: endOfDay(now),
                    }
                });

            if (result != null)
                return console.log('Won\'t load data since already present for today.');

            console.log('Requesting data to Paraulogic\'s servers...');
            const data = await makeDataRequest();

            // Check if the new data is not present
            const existing = await collection.findOne({ gameInfo: data });
            if (existing != null)
                return console.log('The data loaded already exists. Will try again later.');

            await collection
                .insertOne({timestamp: now, game_info: data});
        } finally {
            await db.close();
        }
    }
};
