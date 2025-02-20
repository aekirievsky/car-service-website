document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Загружаем данные сессии
        const sessionResponse = await fetch("/session");
        const sessionData = await sessionResponse.json();

        // Если пользователь авторизован, заполняем данные профиля
        if (sessionData.user) {
            document.getElementById("userName").innerText = sessionData.user.username || 'Аноним';
            document.getElementById("userEmail").innerText = sessionData.user.email || 'Не указан';

            // Загружаем записи пользователя
            const recordsResponse = await fetch("/profile/records");
            const recordsData = await recordsResponse.json();

            // Выводим записи на страницу
            const recordsContainer = document.querySelector(".records-container");
            recordsContainer.innerHTML = ""; // Очищаем контейнер перед добавлением новых записей

            if (recordsData.length > 0) {
                recordsData.forEach(record => {
                    const messageEl = document.createElement("p");
                    messageEl.textContent = record;
                    recordsContainer.appendChild(messageEl);
                });
            } else {
                recordsContainer.textContent = "Нет записей.";
            }
        } else {
            // Если пользователь не авторизован, редирект на главную страницу
            window.location.href = "../index.html";
        }
    } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
    }
    finally{
        loadingMessage.style.displey = "none";
    }
});

document.getElementById("buttonOut").addEventListener("click", async () => {
    await fetch("/logout", { method: "POST" });
    window.location.href = "../index.html";
});

document.addEventListener("DOMContentLoaded", ()=>{
    document.getElementById('editProfile').style.display = 'none'; //TODO In progress
});