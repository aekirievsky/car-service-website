document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/session');
    const data = await response.json();

    if (data.user) {
        document.getElementById('buttonOut').style.display = 'block';
        document.getElementById('buttonEnter').style.display = 'none';
        document.getElementById('profile').style.display = 'inline-block';
    } else {
        document.getElementById('buttonOut').style.display = 'none';
        document.getElementById('buttonEnter').style.display = 'block';
        document.getElementById('profile').style.display = 'none';
    }
});

// Функция для отображения уведомлений
function showNotification(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.classList.add('alert');
    alert.classList.add(type === 'success' ? 'alert-success' : 'alert-danger');
    alert.setAttribute('role', 'alert');
    alert.textContent = message;

    alertContainer.appendChild(alert);
    alert.classList.add('show'); // Плавное появление уведомления

    setTimeout(() => {
        alert.classList.remove('show'); // Плавное исчезновение уведомления
        setTimeout(() => {
            alertContainer.removeChild(alert); // Убираем уведомление из DOM
        }, 500); // Задержка для завершения анимации
    }, 5000); // Уведомление исчезает через 5 секунд
}

// Обработчик для формы регистрации
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    fetch('/register', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showNotification(data.error, 'danger'); // Показываем ошибку
            } else {
                showNotification('Вы успешно зарегистрировались!', 'success'); // Успех
                // Скрывем модальное окно после регистрации
                const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
                modal.hide();
                document.getElementById('buttonEnter').style.display = 'none';
                document.getElementById('buttonOut').style.display = 'block';
                document.getElementById('profile').style.display = 'inline-block';
            }
        })
        .catch(error => {
            showNotification('Произошла ошибка при регистрации. Попробуйте позже.', 'danger');
            console.error('Ошибка:', error);
        });
});

// Обработчик для формы входа
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const loginData = new URLSearchParams();

    // Преобразуем FormData в формат URL-encoded
    formData.forEach((value, key) => {
        loginData.append(key, value);
    });

    fetch('/login', {
        method: 'POST',
        body: formData,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сервера');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                showNotification(data.error, 'danger'); // Показываем ошибку
            } else {
                showNotification('Вы успешно вошли в систему!', 'success'); // Успех
                // Обновляем интерфейс и скрываем модальное окно
                const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
                modal.hide();
                document.getElementById('buttonEnter').style.display = 'none';
                document.getElementById('buttonOut').style.display = 'block';
                document.getElementById('profile').style.display = 'inline-block';
            }
        })
        .catch(error => {
            showNotification('Произошла ошибка при входе. Попробуйте позже.', 'danger');
            console.error('Ошибка:', error);
        });
});

//Обработка для формы записи
document.getElementById('recordForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Предотвращаем стандартную отправку формы

    const formData = new FormData(this);

    // Если у пользователя есть ID в сессии, добавляем его в форму
    const user = await fetch('/session').then(res => res.json());
    console.log('Данные о сессии с фронта: ', user);

    if (user.user) {
        console.log('user_id из сессии:', user.user.user_id); // Логируем ID
        formData.set('user_id', user.user.user_id); // Устанавливаем user_id
    } else {
        showNotification('Необходимо войти', 'danger');
        return;
    }

    // Логируем данные, которые отправляются на сервер
    console.log('Данные формы перед отправкой:', Array.from(formData.entries()));

    const response = await fetch('/sendrecord', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    if (result.success) {
        showNotification('Запись успешно отправлена', 'success');
        this.reset(); // Очищаем форму
    } else {
        alert('Ошибка: ' + result.error);
    }
});


document.getElementById('buttonOut').addEventListener('click', () => {
    fetch('/logout', { method: 'POST' })
        .then(response => {
            if (response.ok) {
                sessionStorage.removeItem('loggedInUser');
                showNotification('Вы успешно вышли из системы', 'success');

                document.getElementById('buttonOut').style.display = 'none';
                document.getElementById('buttonEnter').style.display = 'block';
                document.getElementById('profile').style.display = 'inline-block';
            } else {
                return response.json().then(data => {
                    console.error('Ошибка при выходе:', data.error);
                });
            }
        })
        .catch(error => console.error('Ошибка при выходе:', error));
});

//Сброс введенных данных на формах
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        this.reset();
    });
});
