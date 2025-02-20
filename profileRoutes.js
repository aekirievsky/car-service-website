const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const upload = multer();
const db = require('./db.js');
const logger = require('./logs/logger.js');

router.use(express.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/profile/profile.html'));
})

router.get('/records', async (req, res) => {
    console.log('Запрос на /profile/records');
    try {
        // Проверяем наличие пользователя в сессии
        if (!req.session.user) {
            logger.writeLog("Ошибка 401 в /records");
            console.log("Ошибка 401 в /records");
            return res.status(401).json({ error: 'Неавторизованный доступ' });
        }

        const userId = req.session.user.user_id;

        db.all('SELECT r.message FROM Records r WHERE r.user_id = ?', [userId], (err, rows) => {
            if (err) {
                logger.writeLog(`Ошибка базы данных: ${err}`);
                console.log(`Ошибка базы данных: ${err}`);
                return res.status(500).json({ error: 'Ошибка базы данных' });
            }

            // Возвращаем массив сообщений
            console.log('Полученный массив в /records', rows.map(row => row.message));
            return res.json(rows.map(row => row.message));
        });
    } catch (error) {
        logger.writeLog(`Ошибка сервера: ${error}`);
        console.log(`Ошибка сервера: ${error}`);
        return res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.get('/test', (req, res) => res.send('Test'))

module.exports = router;