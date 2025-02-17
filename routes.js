const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); //Для хеширования паролей
const multer = require('multer');
const upload = multer();
const db = require('./db.js');
const logger = require('./logs/logger.js');

router.use(express.urlencoded({ extended: true }));

router.post('/register', upload.none(), async (req, res) => {
    try {
        console.log(req.body);
        const { username, email, password } = req.body;
        const role = 'user';

        //Проверка заполненных полей
        if (!username, !email, !password) {
            console.log(`Поля: username = ${username}, email = ${email}, password = ${password}`);
            return res.status(400).json({ error: 'Не все поля заполнены' });
        }

        //Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        //Добавляем нового пользователя в БД
        db.run(
            'INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role],
            function (err) {
                if (err) {
                    if (err.code === 'SQLITE_CONSTRAINT') {
                        return res.status(409).json({ error: 'Пользователь с таким именем или email уже существует' });
                    }
                    logger.writeLog(`Ошибка при регистрации пользователя: ${err.message}`);
                    return res.status(500).json({ error: 'Произошла ошибка при регистрации' });
                }
                logger.writeLog(`Новый пользователь зарегистрирован: ${user}`);
                return res.status(201).json({ success: true, message: 'Регистрация успешна' });
            }
        );
    } catch (error) {
        logger.writeLog(`Ошибка при регистрации пользователя: ${error.message}`);
        return res.status(500).json({ error: 'Произошла внутренняя ошибка сервера' });
    }
})

router.post('/login', upload.none(), async (req, res) => {
    try {
        console.log('Полученные данные на сервере:', req.body);
        const { email, password } = req.body;

        //Проверка заполненных полей
        if (!email || !password) {
            console.log(`Поля: email = ${email}, password = ${password}`);
            return res.status(400).json({ error: 'Не все поля заполнены' });
        }

        //Находим пользователя по email
        db.get('SELECT * FROM Users WHERE email = ?', [email], (err, user) => {
            console.log('Пользователь найден: ', user);
            if (err) {
                logger.writeLog(`Ошибка при входе в систему: ${err.message}`);
                return res.status(500).json({ error: 'Произошла ошибка при входе в систему' });
            }
            if (!user) {
                return res.status(401).json({ error: 'Неверный email или пароль' });
            }

            //Сравниваем введенный пароль с хэшем
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    logger.writeLog(`Ошибка при сравнении пароля: ${err.message}`);
                    return res.status(500).json({ error: 'Произошла ошибка при входе в систему' });
                }
                if (isMatch) {
                    req.session.user = { user_id: user.id, username: user.username, email: user.email };
                    logger.writeLog(`Пользователь ${user.username} вошел в систему`);
                    return res.status(200).json({ success: true, user: { username: user.username, email: user.email } });
                } else {
                    return res.status(401).json({ error: 'Неверный email или пароль' });
                }
            });
        })

    } catch (error) {
        logger.writeLog(`Ошибка при входе в систему: ${error.message}`);
        return res.status(500).json({ error: 'Произошла внутренняя ошибка сервера' });
    }
});

router.get('/session', (req, res) => {
    if (req.session.user) {
        console.log('Пользовательская сессия: ', req.session.user);
        return res.json({ user: req.session.user,});
    } else {
        return res.json({ user: null });
    }
});

router.post('/logout', async (req, res) => {
    let user = req.session.user ? req.session.user.username : 'неизвестный пользователь';
    req.session.destroy((err) => {
        if (err) {
            logger.writeLog(`Ошибка сервера при вызове /logout ${err.message}`);
            return res.status(500).json({ error: 'Ошибка при выходе' });
        }
        res.clearCookie('connect.sid');
        logger.writeLog(`Пользователь: ${user} успешно вышел`);
        return res.status(200).json({ success: true, message: 'Выход выполнен успешно' });
    })
});

router.post('/sendrecord', upload.none(), async (req, res) => {
    try{
        console.log('Полученные данные на сервер из формы записи:', req.body);
        let {user_id, phone, message} = req.body;

        // Логирование user_id
        console.log('user_id на сервере:', user_id);

        // Преобразуем user_id в число, если нужно
        user_id = parseInt(user_id, 10);

        if (!user_id || !phone){
            return res.status(400).json({error: 'Отсутствуют обязательные поля'});
        }

        //Получаем данные пользователя из БД
        db.get('SELECT username, email FROM Users WHERE id = ?', [user_id], (err, user) => {
            if(err || !user){
                return res.status(500).json({error: 'Ошибка при получении данных пользователя'});
            }

            //Добавляем запись в БД
            db.run('INSERT INTO Records (user_id, username, email, phone, message) VALUES (?, ?, ?, ?, ?)',
                [user_id, user.username, user.email, phone, message],
                function(err){
                    if(err){
                        return res.status(500).json({error: 'Ошибка при создании записи в Records'});
                    }
                    return res.status(201).json({success: true, message: 'Запись успешно создана'});
                }
            )
        });
    } catch (error){
        console.error(error);  // Логируем ошибку для диагностики
        res.status(500).json({error: 'Ошибка сервера'});
    }
});

module.exports = router;