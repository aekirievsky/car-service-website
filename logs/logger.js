const fs = require('fs');
const path = require('path');

// Путь к папке логов
const logsDir = path.join(__dirname, 'log');
// Путь к файлу логов
const logFilePath = path.join(logsDir, 'logs.txt');

// Функция для записи логов
function writeLog(message) {
    // Получаем текущую дату и время
    const now = new Date();

    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // Формируем сообщение для записи
    const logMessage = `${formattedDate}: ${message}\n`;

    // Проверяем существование папки и создаем ее при необходимости
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }

    // Открываем файл для записи
    fs.open(logFilePath, 'a', (err, fd) => {
        if (err) throw err;
        
        // Записываем сообщение в конец файла
        fs.appendFile(fd, logMessage, (err) => {
            if (err) throw err;
            
            // Закрываем файловый дескриптор
            fs.close(fd, (err) => {
                if (err) throw err;
                
                console.log('Лог успешно записан:', message);
            });
        });
    });   
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

module.exports = {
    writeLog
};