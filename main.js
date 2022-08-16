const {MongoClient} = require("mongodb");
const express = require("express");
const {endOfDay, startOfDay} = require('date-fns');

const {MONGO_URI, DATABASE_NAME, HTTP_PORT} = require('./consts');

const DATE_REGEX = /^\d{4}-((0[1-9])|(1[0-2]))-((0[1-9])|(1\d)|(3[0-1]))$/g;

module.exports = {
    run: async (production) => {
        const db = new MongoClient(MONGO_URI);

        // Check that the database is well configured
        try {
            await db.connect();

            const dbo = db.db(DATABASE_NAME);
            await dbo.command({ping: 1});
        } finally {
            await db.close();
        }

        // Call routine once to keep database updated
        await require('./worker').routine();

        const app = express();

        app.get('/', (req, res) => res.redirect('https://paraulogic.cat'));

        app.get('/v1/game_info', async (req, res) => {
            const query = req.query;

            const dateValue = query.date;
            let date = new Date();
            if (dateValue != null && dateValue.length > 0) {
                const dateValid = DATE_REGEX.test(dateValue);
                if (!dateValid)
                    return res.status(400).json({success: false, data: {}});
                date = new Date(dateValue);
            }

            try {
                await db.connect();
                const result = await db
                    .db(DATABASE_NAME)
                    .collection('game_info')
                    .findOne({
                        timestamp: {
                            $gte: startOfDay(date),
                            $lte: endOfDay(date),
                        }
                    });
                if (result == null)
                    return res.status(404).json({success: false, data: {}});

                res.status(200).json({success: true, data: {result}});
            } catch (e) {
                console.error(e);
                res.status(500).json({success: false, error: production ? null : e});
            } finally {
                await db.close();
            }
        });

        app.listen(HTTP_PORT, () => console.log(`Started listening on *:${HTTP_PORT}`));
    }
}