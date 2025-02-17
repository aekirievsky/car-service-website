require('dotenv').config({ path: __dirname + '/.env' });
const logger = require('./logs/logger.js');
const express = require("express");
const app = express();
const routes = require('./routes.js');
const session = require('express-session');
const path = require('path');
const db = require("./db.js");
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

app.use(express.json());  // Для обработки JSON-форматов
app.use(express.urlencoded({ extended: true }));  // Для обработки URL-кодированных данных

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Если используете HTTPS, поставьте true
}));

app.use(express.static(path.join(__dirname, 'public')));
const port = process.env.PORT || 3000;

app.use('/', routes); // Используем созданные маршруты

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html")
});

console.log('Запуск сервера');
app.listen(port, () => {
    console.log(`Сервер запущен на localhost: ${port}`)
    logger.writeLog(`Сервер запущен на localhost: ${port}`);
});
