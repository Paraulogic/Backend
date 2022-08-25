const {MongoClient} = require("mongodb");
const express = require("express");
const {endOfDay, startOfDay} = require('date-fns');

const {MONGO_URI, DATABASE_NAME, HTTP_PORT} = require('./consts');

const DATE_REGEX = /^\d{4}-((0[1-9])|(1[0-2]))-((0[1-9])|(1\d)|(3[0-1]))$/g;

/**
 * @interface GameInfo
 * @type {{id:string,timestamp:string,game_info:{letters:string[],centerLetter:string,words:{}}}}
 */

/**
 * @type {{GameInfo}}
 */
let cache = {};

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

        // Expose the terms
        app.use('/terms', express.static('terms'))

        app.get('/', (req, res) => res.redirect('https://paraulogic.cat'));

        app.get('/github', (req, res) => res.redirect('https://github.com/Paraulogic/Android'));

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
            /**
             * @type {Date}
             */
            const dateStart = startOfDay(date);

            try {
                const cacheKey = dateStart.toLocaleDateString("en-US");
                if (!cache.hasOwnProperty(cacheKey)) {
                    await db.connect();
                    cache[cacheKey] = await db
                        .db(DATABASE_NAME)
                        .collection('game_info')
                        .findOne({
                            timestamp: {
                                $gte: dateStart,
                                $lte: endOfDay(date),
                            }
                        });
                }

                /**
                 * @type {GameInfo|null}
                 */
                const result = cache[cacheKey];
                if (result == null)
                    return res.status(404).json({success: false, data: {}});

                res.status(200).json({
                    success: true,
                    data: {
                        timestamp: result.timestamp,
                        game_info: {
                            letters: result.game_info.letters,
                            center_letter: result.game_info.centerLetter,
                            words: result.game_info.words,
                        },
                    },
                });
            } catch (e) {
                console.error(e);
                res.status(500).json({success: false, error: production ? null : e});
            } finally {
                await db.close();
            }
        });
        app.get('/v1/history', async (req, res) => {
            try {
                await db.connect();
                /**
                 * @type {GameInfo[]|null}
                 */
                const result = await db
                    .db(DATABASE_NAME)
                    .collection('game_info')
                    .find()
                    .toArray();
                if (result == null)
                    return res.status(404).json({success: false, data: {}});

                res.status(200).json({
                    success: true,
                    data: result.map((e) => {
                        return {
                            timestamp: e.timestamp,
                            game_info: {
                                letters: e.game_info.letters,
                                center_letter: e.game_info.centerLetter,
                                words: e.game_info.words,
                            },
                        };
                    })
                });
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
