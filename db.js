const path = require('path');
const sqlite = require('sqlite3').verbose();
const logger = require('./logs/logger.js');

const dbPath = path.join(__dirname, 'users.db');

let db = new sqlite.Database(dbPath, (err) => {
    if (err) {
        logger.writeLog(`Ошибка в подключении в БД ${err.message}`);
        return console.error(err.message);
    }
    console.log('Успешно установлено соединение с БД');
    logger.writeLog("Успешно установлено соединение с БД");

    //Создаем таблицу users
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL)`,
        (err) => {
            if (err) {
                logger.writeLog(`Ошибка при создании таблицы Users: ${err.message}`);
                return console.error(err.message);
            }
            logger.writeLog(`Таблица Users успешно создана или уже существует`);
        });

        //Создаем таблицу записей
        db.run(`
            CREATE TABLE IF NOT EXISTS Records(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            message TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE)`,
            (err) => {
                if (err) {
                    logger.writeLog(`Ошибка при создании таблицы Records: ${err.message}`);
                    return console.error(err.message);
                }
                logger.writeLog(`Таблица Records успешно создана или уже существует`);
            });
});

module.exports = db;