document.addEventListener('DOMContentLoaded', function() {
    const modal = document.createElement('div');
    modal.className = 'welcome-overlay';
    
    const modalContent = `
        <div class="welcome-modal">
            <div class="welcome-header">
                <h2>Добро пожаловать!</h2>
            </div>
            
            <!-- Добавляем виджет статуса -->
            <div class="current-status welcome-status" id="welcome-current-status">
                <div class="time-indicator">
                    <i class="ri-sun-line"></i>
                </div>
                <div class="current-date" id="welcome-current-date">-</div>
                <div class="status-text" id="welcome-status-text">-</div>
                <div class="status-description" id="welcome-status-description">-</div>
                <div class="progress-container">
                    <div id="welcome-workdayProgress" class="progress-fill" style="width: 0%"></div>
                </div>
            </div>

            <div class="feature-list">
                <div class="feature-item" data-aos="fade-up" data-aos-delay="100">
                    <i class="ri-calendar-check-line"></i>
                    <h3>График работы</h3>
                    <p>Просматривайте свой график смен и планируйте время</p>
                </div>
                <div class="feature-item" data-aos="fade-up" data-aos-delay="200">
                    <i class="ri-calendar-event-line"></i>
                    <h3>Отпуска</h3>
                    <p>Планируйте отпуск и отслеживайте дни отдыха</p>
                </div>
            </div>
            <div id="welcome-weather-info"></div>
            <button class="welcome-button" id="welcome-close-btn">Вперед</button>
        </div>
    `;
    
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);

    // Показываем модальное окно с анимацией
    setTimeout(() => {
        modal.classList.add('show');
        initializeWelcomeStatus();
    }, 100);

    // Обработчик закрытия
    document.getElementById('welcome-close-btn').addEventListener('click', function() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 500);
    });
});

// Функция инициализации статуса для модального окна
function initializeWelcomeStatus() {
    const now = new Date();
    const status = getDayStatus(now);
    
    const welcomeCurrentDate = document.getElementById('welcome-current-date');
    const welcomeStatusText = document.getElementById('welcome-status-text');
    const welcomeStatusDescription = document.getElementById('welcome-status-description');
    const welcomeWorkdayProgress = document.getElementById('welcome-workdayProgress');
    const welcomeStatusContainer = document.getElementById('welcome-current-status');
    const welcomeTimeIndicator = welcomeStatusContainer.querySelector('.time-indicator i');
    
    // Обновляем индикатор времени суток
    const hour = now.getHours();
    const isDaytime = hour >= 6 && hour < 20; // День с 6:00 до 20:00
    
    // Обновляем иконку и класс
    welcomeTimeIndicator.className = isDaytime ? 'ri-sun-line' : 'ri-moon-line';
    welcomeStatusContainer.classList.remove('daytime', 'nighttime');
    welcomeStatusContainer.classList.add(isDaytime ? 'daytime' : 'nighttime');
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    welcomeCurrentDate.textContent = now.toLocaleDateString('ru-RU', options);
    
    welcomeStatusContainer.classList.remove('status-working', 'status-off');

    // Получаем следующий рабочий день и обновляем прогресс
    const nextWorkDay = getNextWorkDay(now);
    const daysUntilWork = Math.ceil((nextWorkDay - now) / (1000 * 60 * 60 * 24));
    let progress = 0;
    
    if (daysUntilWork === 1) {
        progress = 50;
    } else if (daysUntilWork === 0) {
        progress = 100;
    }
    welcomeWorkdayProgress.style.width = `${progress}%`;

    if (status.isShift) {
        welcomeStatusContainer.classList.add('status-working');
        welcomeStatusText.textContent = `${status.shiftDay}-й день рабочей смены`;
        welcomeStatusDescription.textContent = 'Рабочий день';
        welcomeWorkdayProgress.style.width = '100%';
    } else {
        welcomeStatusContainer.classList.add('status-off');
        if (getHolidayName(now)) {
            welcomeStatusText.textContent = 'Праздничный день';
            welcomeStatusDescription.textContent = `${getHolidayName(now)}. Следующая смена начнется ${getNextShiftDate(now)}`;
        } else if (status.offDay > 0) {
            welcomeStatusText.textContent = `${status.offDay}-й выходной день`;
            welcomeStatusDescription.textContent = `Следующая смена начнется ${getNextShiftDate(now)}`;
        } else {
            welcomeStatusText.textContent = 'Выходной день';
            welcomeStatusDescription.textContent = `Следующая смена начнется ${getNextShiftDate(now)}`;
        }
    }

    // Инициализируем погоду
    initializeWelcomeWeather();
}

// Функция инициализации погоды для модального окна
async function initializeWelcomeWeather() {
    try {
        const geocodeResponse = await fetch('https://api.openweathermap.org/geo/1.0/direct?q=Astana,KZ&limit=1&appid=90e0d7e79559244cc33afebafbd85ab7');
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.length > 0) {
            const { lat, lon } = geocodeData[0];
            
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=90e0d7e79559244cc33afebafbd85ab7&units=metric&lang=ru`);
            const weatherData = await weatherResponse.json();

            const weatherInfo = document.getElementById('welcome-weather-info');
            
            weatherInfo.innerHTML = `
                <div class="time-indicator">
                    <i class="ri-cloud-line"></i>
                </div>
                <div class="current-date weather-header">
                    <h3>Погода в Астане</h3>
                    <span class="weather-time">${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div class="status-text weather-main">
                    <div class="weather-temp">${Math.round(weatherData.main.temp)}°C</div>
                    <div class="weather-description">${weatherData.weather[0].description}</div>
                </div>
                <div class="weather-details">
                    <div class="weather-detail-item">
                        <i class="ri-temp-hot-line"></i>
                        <span>Ощущается как: ${Math.round(weatherData.main.feels_like)}°C</span>
                    </div>
                    <div class="weather-detail-item">
                        <i class="ri-windy-line"></i>
                        <span>Ветер: ${Math.round(weatherData.wind.speed)} м/с</span>
                    </div>
                </div>
                <div class="progress-container">
                    <div class="progress-fill" style="width: 100%"></div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Ошибка при получении погоды:', error);
        document.getElementById('welcome-weather-info').innerHTML = '<p class="weather-error">Ошибка при загрузке погоды</p>';
    }
}
