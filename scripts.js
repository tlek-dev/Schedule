function showWidget(widgetName) {
  try {
    // Скрываем все виджеты
    document.querySelectorAll('.widget').forEach(widget => {
      widget.classList.remove('active');
    });
    
    // Показываем выбранный виджет
    const targetWidget = document.getElementById(widgetName + '-widget');
    if (targetWidget) {
      targetWidget.classList.add('active');
      
      // Специальная обработка для определенных виджетов
      if (widgetName === 'shift-schedule') {
        initializeShiftProgress();
      } else if (widgetName === 'colors') {
        // Инициализация цветового конвертера
        const colorDisplay = document.getElementById('colorDisplay');
        if (colorDisplay) {
          const defaultColor = '#FFFFFF';
          colorDisplay.style.backgroundColor = defaultColor;
          document.getElementById('hexInput').value = defaultColor;
          const [r, g, b] = [255, 255, 255];
          document.getElementById('redInput').value = r;
          document.getElementById('greenInput').value = g;
          document.getElementById('blueInput').value = b;
        }
      }
    } else {
      console.warn(`Widget with id "${widgetName}-widget" not found`);
      return;
    }
    
    // Обновляем активную вкладку
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Находим и активируем нужную вкладку
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      const onclickAttr = tab.getAttribute('onclick');
      if (onclickAttr && onclickAttr.includes(widgetName)) {
        tab.classList.add('active');
      }
    });
  } catch (error) {
    console.error('Error in showWidget:', error);
  }
}

async function fetchWeather() {
  try {
    const geocodeResponse = await fetch('https://api.openweathermap.org/geo/1.0/direct?q=Astana,KZ&limit=1&appid=90e0d7e79559244cc33afebafbd85ab7');
    const geocodeData = await geocodeResponse.json();
    
    if (geocodeData.length > 0) {
      const { lat, lon } = geocodeData[0];
      
      const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=90e0d7e79559244cc33afebafbd85ab7&units=metric&lang=ru`);
      const weatherData = await weatherResponse.json();

      const weatherInfo = document.getElementById('weather-info');
      
      const recommendations = getWeatherRecommendations(
        weatherData.main.temp,
        weatherData.weather[0].description,
        weatherData.wind.speed
      );
      
      weatherInfo.innerHTML = `
        <div class="weather-header">
          <h3>Погода в Астане</h3>
          <span>${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="weather-main">
          <div>
            <div class="weather-temp">${Math.round(weatherData.main.temp)}°C</div>
            <div class="weather-description">${weatherData.weather[0].description}</div>
          </div>
          <img class="weather-icon" src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" alt="${weatherData.weather[0].description}">
        </div>
        <div class="weather-details">
          <div class="weather-detail-item">
            <i class="ri-temp-hot-line"></i>
            <span>Ощущается как: ${Math.round(weatherData.main.feels_like)}°C</span>
          </div>
          <div class="weather-detail-item">
            <i class="ri-drop-line"></i>
            <span>Влажность: ${weatherData.main.humidity}%</span>
          </div>
          <div class="weather-detail-item">
            <i class="ri-windy-line"></i>
            <span>Ветер: ${Math.round(weatherData.wind.speed)} м/с</span>
          </div>
          <div class="weather-detail-item">
            <i class="ri-cloud-line"></i>
            <span>Облачность: ${weatherData.clouds.all}%</span>
          </div>
        </div>
        <div class="weather-recommendations">
          <div class="weather-recommendation-item">
            <i class="ri-t-shirt-line"></i>
            <span>${recommendations.clothing}</span>
          </div>
          <div class="weather-recommendation-item">
            <i class="ri-car-line"></i>
            <span>${recommendations.car}</span>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Ошибка при получении погоды:', error);
    document.getElementById('weather-info').innerHTML = '<p>Ошибка при загрузке погоды</p>';
  }
}

function getWeatherRecommendations(temp, description, windSpeed) {
  let clothing = '';
  let car = '';
  
  // Рекомендации по одежде
  if (temp <= -20) {
    clothing = 'Наденьте теплую зимнюю куртку, шапку, шарф, теплые перчатки и зимнюю обувь. Желательно многослойная одежда.';
    car = 'Прогрев двигателя 15-20 минут. Проверьте аккумулятор и незамерзайку.';
  } else if (temp <= -10) {
    clothing = 'Наденьте зимнюю куртку, шапку, перчатки и теплую обувь.';
    car = 'Прогрев двигателя 10-15 минут. Держите бак заполненным минимум наполовину.';
  } else if (temp <= 0) {
    clothing = 'Наденьте демисезонную куртку, шапку и перчатки.';
    car = 'Прогрев двигателя 5-10 минут.';
  } else if (temp <= 10) {
    clothing = 'Легкая куртка или пальто будет достаточно.';
    car = 'Достаточно 2-3 минут прогрева.';
  } else if (temp <= 20) {
    clothing = 'Достаточно легкой кофты или ветровки.';
    car = 'Прогрев не требуется.';
  } else {
    clothing = 'Легкая одежда, желательно из натуральных тканей.';
    car = 'Прогрев не требуется. Проверьте систему охлаждения.';
  }

  // Дополнительные рекомендации по погоде
  if (description.includes('дождь')) {
    clothing += ' Возьмите зонт или дождевик.';
    car += ' Включите противотуманные фары, соблюдайте дистанцию.';
  } else if (description.includes('снег')) {
    clothing += ' Наденьте водонепроницаемую обувь.';
    car += ' Будьте осторожны, возможен гололед. Держите дистанцию.';
  }

  if (windSpeed > 15) {
    clothing += ' Наденьте ветрозащитную одежду.';
    car += ' Будьте осторожны при открывании дверей.';
  }

  return { clothing, car };
}

fetchWeather();
setInterval(fetchWeather, 1800000);

const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
const daysContainer = document.getElementById("calendar-days");
const months = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const cycleStart = new Date(2024, 10, 22);
const cycleDays = 4;

const holidays = [
  { date: '01-01', name: "Новый год" },
  { date: '01-02', name: "Новый год" },
  { date: '03-08', name: "Международный женский день" },
  { date: '03-21', name: "Наурыз мейрамы" },
  { date: '03-22', name: "Наурыз мейрамы" },
  { date: '03-23', name: "Наурыз мейрамы" },
  { date: '05-01', name: "Праздник единства народа Казахстана" },
  { date: '05-07', name: "День защитника Отечества" },
  { date: '05-09', name: "День Победы" },
  { date: '06-28', name: "День журналистики" },
  { date: '07-06', name: "День Столицы" },
  { date: '08-30', name: "День Конституции" },
  { date: '12-16', name: "День независимости" },
];

function getHolidayName(date) {
  const formattedDate = `${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}-${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
  const holiday = holidays.find((h) => h.date === formattedDate);
  return holiday ? holiday.name : null;
}

function isShiftDay(date) {
  const diffDays = Math.floor((date - cycleStart) / (1000 * 60 * 60 * 24));
  console.log('Разница в днях:', diffDays);
  console.log('Остаток от деления:', (diffDays % cycleDays + cycleDays) % cycleDays);
  console.log('Рабочий день:', (diffDays % cycleDays + cycleDays) % cycleDays < 2);
  return (diffDays % cycleDays + cycleDays) % cycleDays < 2;
}

function showCalendar(month, year) {
  const firstDay = new Date(year, month).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  daysContainer.innerHTML = "";

  let shiftCount = 0;
  const today = new Date();

  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("calendar-day", "empty");
    daysContainer.appendChild(emptyCell);
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const dayCell = document.createElement("div");
    dayCell.classList.add("calendar-day");
    dayCell.textContent = day;

    const holidayName = getHolidayName(date);
    const isShift = isShiftDay(date);

    // Добавляем соответствующие классы
    if (holidayName) {
        dayCell.classList.add('holiday');
        dayCell.title = holidayName;
    }
    if (isShift) {
        dayCell.classList.add('shift');
        shiftCount++;
    }

    if (date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()) {
        dayCell.classList.add('today');
    }

    daysContainer.appendChild(dayCell);
  }

  document.getElementById("month").textContent = months[month];
  document.getElementById("year").textContent = year;
}

let isYearView = false;

function toggleCalendarView() {
  isYearView = !isYearView;
  const yearView = document.getElementById('year-view');
  const monthView = document.getElementById('month-view');
  const toggleButton = document.querySelector('.calendar-view-toggle button');
  
  if (isYearView) {
    yearView.style.display = 'block';
    monthView.style.display = 'none';
    toggleButton.textContent = 'Показать месяц';
    showYearView(currentYear);
  } else {
    yearView.style.display = 'none';
    monthView.style.display = 'block';
    toggleButton.textContent = 'Показать год';
    showCalendar(currentMonth, currentYear);
  }
}

function showYearView(year) {
    const monthsGrid = document.querySelector('.months-grid');
    const yearTitle = document.getElementById('year-title');
    yearTitle.textContent = year;
    monthsGrid.innerHTML = '';

    for (let month = 0; month < 12; month++) {
        const monthContainer = document.createElement('div');
        monthContainer.className = 'year-calendar-month';
        
        const monthHeader = document.createElement('div');
        monthHeader.className = 'year-calendar-month-header';
        monthHeader.textContent = months[month];
        monthContainer.appendChild(monthHeader);

        const weekdaysContainer = document.createElement('div');
        weekdaysContainer.className = 'year-calendar-weekdays';
        ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach(day => {
            const dayElem = document.createElement('div');
            dayElem.textContent = day;
            weekdaysContainer.appendChild(dayElem);
        });
        monthContainer.appendChild(weekdaysContainer);

        const daysContainer = document.createElement('div');
        daysContainer.className = 'year-calendar-days';
        
        // Получаем первый день месяца и количество дней
        const firstDay = new Date(year, month, 1).getDay() || 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Добавляем пустые ячейки в начале
        for (let i = 1; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'year-calendar-day empty';
            daysContainer.appendChild(emptyDay);
        }

        // Добавляем дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayDiv = document.createElement('div');
            dayDiv.className = 'year-calendar-day';
            dayDiv.textContent = day;

            // Проверяем праздник и смену
            const holidayName = getHolidayName(date);
            const isShift = isShiftDay(date);

            // Добавляем соответствующие классы
            if (holidayName) {
                dayDiv.classList.add('holiday');
                dayDiv.title = holidayName;
            }
            if (isShift) {
                dayDiv.classList.add('shift');
            }

            if (date.getDate() === today.getDate() && 
                date.getMonth() === today.getMonth() && 
                date.getFullYear() === today.getFullYear()) {
                dayDiv.classList.add('today');
            }

            // Добавляем обработчик клика для переключения на месячный вид
            dayDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                currentMonth = month;
                toggleCalendarView();
            });

            daysContainer.appendChild(dayDiv);
        }

        monthContainer.appendChild(daysContainer);
        monthsGrid.appendChild(monthContainer);
    }
}

function updateYear(delta) {
  currentYear += delta;
  if (isYearView) {
    showYearView(currentYear);
  } else {
    showCalendar(currentMonth, currentYear);
  }
}

// Модифицируем функцию updateMonth только для основного календаря
function updateMonth(delta) {
  if (!document.getElementById('calendar-widget').classList.contains('active')) {
    return; // Не обновляем, если не находимся в календаре
  }
  
  currentMonth += delta;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  
  if (isYearView) {
    showYearView(currentYear);
  } else {
    showCalendar(currentMonth, currentYear);
  }
}

// Обновляем инициализацию при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  if (isYearView) {
    showYearView(currentYear);
  } else {
    showCalendar(currentMonth, currentYear);
  }
  updateHomeStats();
  updateCurrentDayStatus();
  showWidget('home');
  
  // Инициализируем прогресс-бары для смен
  initializeShiftProgress();
  
  // Обновляем каждую минуту
  setInterval(updateCurrentDayStatus, 60000);
  setInterval(updateHomeActiveShifts, 60000);
  setInterval(updateShiftProgress, 60000);
});

function updateCurrentDayStatus() {
  const now = new Date();
  const status = getDayStatus(now);
  
  const currentDate = document.getElementById('current-date');
  const statusText = document.getElementById('status-text');
  const statusDescription = document.getElementById('status-description');
  const progressBar = document.getElementById('workdayProgress');
  
  const statusContainer = document.getElementById('current-status');
  const timeIndicator = statusContainer.querySelector('.time-indicator i');
  
  // Обновляем индикатор времени суток
  const hour = now.getHours();
  const isDaytime = hour >= 6 && hour < 20; // День с 6:00 до 20:00
  
  // Обновляем иконку и класс
  timeIndicator.className = isDaytime ? 'ri-sun-line' : 'ri-moon-line';
  statusContainer.classList.remove('daytime', 'nighttime');
  statusContainer.classList.add(isDaytime ? 'daytime' : 'nighttime');
  
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  currentDate.textContent = now.toLocaleDateString('ru-RU', options);
  
  statusContainer.classList.remove('status-working', 'status-off');

  // Получаем следующий рабочий день и обновляем прогресс
  const nextWorkDay = getNextWorkDay(now);
  const daysUntilWork = Math.ceil((nextWorkDay - now) / (1000 * 60 * 60 * 24));
  let progress = 0;
  
  // Логика прогресса:
  // 2 дня до работы - 0%
  // 1 день до работы - 50%
  // Рабочий день - 100%
  if (daysUntilWork === 1) {
    progress = 50;
  } else if (daysUntilWork === 0) {
    progress = 100;
  }
  progressBar.style.width = `${progress}%`;

  if (status.isShift) {
    statusContainer.classList.add('status-working');
    statusText.textContent = `${status.shiftDay}-й день рабочей смены`;
    statusDescription.textContent = 'Рабочий день';
    progressBar.style.width = '100%';
  } else {
    statusContainer.classList.add('status-off');
    if (getHolidayName(now)) {
      statusText.textContent = 'Праздничный день';
      statusDescription.textContent = `${getHolidayName(now)}. Следующая смена начнется ${getNextShiftDate(now)}`;
    } else if (status.offDay > 0) {
      statusText.textContent = `${status.offDay}-й выходной день`;
      statusDescription.textContent = `Следующая смена начнется ${getNextShiftDate(now)}`;
    } else {
      statusText.textContent = 'Выходной день';
      statusDescription.textContent = `Следующая смена начнется ${getNextShiftDate(now)}`;
    }
  }
}

function getNextShiftDate(currentDate) {
  const date = new Date(currentDate);
  let daysToCheck = 10; // Проверяем следующие 10 дней
  
  // Начинаем с завтрашнего дня
  date.setDate(date.getDate() + 1);
  
  while (daysToCheck > 0) {
    if (isShiftDay(date)) {
      const options = { day: 'numeric', month: 'long' };
      console.log(`Следующая смена найдена: ${date.toLocaleDateString('ru-RU', options)}`);
      return date.toLocaleDateString('ru-RU', options);
    }
    date.setDate(date.getDate() + 1);
    daysToCheck--;
  }
  
  console.log('Следующая смена не найдена в ближайшие 10 дней.');
  return "скоро";
}

function updateMonth(delta) {
  currentMonth = currentMonth + delta;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  
  showCalendar(currentMonth, currentYear);
  updateHomeStats();
  updateCurrentDayStatus();
}

const prevButton = document.createElement('span');
prevButton.innerHTML = '&#10094;';
prevButton.classList.add('calendar-nav');
prevButton.onclick = () => updateMonth(-1);

const nextButton = document.createElement('span');
nextButton.innerHTML = '&#10095;';
nextButton.classList.add('calendar-nav');
nextButton.onclick = () => updateMonth(1);

const calendarHeader = document.querySelector('.calendar-header');
calendarHeader.insertBefore(prevButton, calendarHeader.firstChild);
calendarHeader.appendChild(nextButton);

const holidayStyles = document.createElement('style');
holidayStyles.textContent = `
  .holiday-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 12px;
    margin-bottom: 8px;
    transition: all 0.2s ease;
  }

  .holiday-date {
    background: #1abc9c;
    color: white;
    padding: 6px 12px;
    border-radius: 8px;
    font-weight: 500;
    margin-right: 12px;
    white-space: nowrap;
  }

  .holiday-name {
    flex: 1;
    color: #2c3e50;
  }

  .holiday-shift {
    border-left: 3px solid #1abc9c;
  }

  .holiday-shift-icon {
    margin-left: 8px;
    color: #1abc9c;
  }

  @media (max-width: 768px) {
    .holiday-item {
      padding: 10px;
    }

    .holiday-date {
      padding: 4px 8px;
      font-size: 13px;
    }

    .holiday-name {
      font-size: 13px;
    }

    .holiday-shift-icon {
      padding: 3px 6px;
      font-size: 11px;
    }
  }
`;
document.head.appendChild(holidayStyles);

const navigationStyles = document.createElement('style');
navigationStyles.textContent = `
  .calendar-nav {
    cursor: pointer;
    padding: 8px 16px;
    background: rgba(26, 188, 156, 0.1);
    border-radius: 12px;
    color: #1abc9c;
    transition: all 0.2s ease;
  }

  .calendar-nav:hover {
    background: rgba(26, 188, 156, 0.2);
  }

  .widget {
    display: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .widget.active {
    display: block;
    opacity: 1;
  }

  #home-widget {
    padding-bottom: 80px;
  }

  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    padding: 10px 20px;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-around;
    z-index: 1000;
  }

  .nav-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 16px;
    color: #95a5a6;
    text-decoration: none;
    transition: all 0.2s ease;
    border-radius: 12px;
  }

  .nav-tab i {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .nav-tab span {
    font-size: 12px;
  }

  .nav-tab.active {
    color: #1abc9c;
    background: rgba(26, 188, 156, 0.1);
  }

  .nav-tab:hover {
    color: #1abc9c;
  }

  @media (max-width: 768px) {
    .bottom-nav {
      padding: 10px;
    }

    .nav-tab {
      padding: 6px 12px;
    }

    .nav-tab i {
      font-size: 20px;
    }

    .nav-tab span {
      font-size: 11px;
    }
  }
`;
document.head.appendChild(navigationStyles);

document.addEventListener('DOMContentLoaded', () => {
  const defaultTab = document.querySelector('.nav-tab');
  if (defaultTab) {
    defaultTab.click();
  }
});

document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    document.querySelectorAll('.widget').forEach(w => w.classList.remove('active'));
    
    const widgetName = tab.getAttribute('onclick').replace('showWidget(\'', '').replace('\')', '');
    document.getElementById(`${widgetName}-widget`).classList.add('active');
  });
});

function getMonthHours(selectedDate = new Date()) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  
  let regularHours = 0;
  let holidayHours = 0;
  
  // Получаем последний день месяца
  const lastDay = new Date(year, month + 1, 0).getDate();
  
  // Проходим по всем дням месяца
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    
    // Проверяем, является ли день рабочим
    if (isShiftDay(date)) {
      // Проверяем, является ли день праздничным
      const isHoliday = getHolidayName(date) !== null;
      
      if (isHoliday) {
        holidayHours += 11; // Праздничные часы
      } else {
        regularHours += 11; // Обычные часы
      }
    }
  }
  
  return { regularHours, holidayHours };
}

function updateHours() {
  const selectedDate = getSelectedDate();
  const hours = getMonthHours(selectedDate);
  
  document.getElementById('regularHoursDisplay').textContent = hours.regularHours;
  document.getElementById('holidayHoursDisplay').textContent = hours.holidayHours;
}

function getSelectedDate() {
  const month = parseInt(document.getElementById('monthSelect').value);
  const year = parseInt(document.getElementById('yearSelect').value);
  return new Date(year, month, 1);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  const now = new Date();
  
  // Устанавливаем текущий месяц и год
  document.getElementById('monthSelect').value = now.getMonth();
  document.getElementById('yearSelect').value = now.getFullYear();
  
  // Обновляем часы
  updateHours();
  
  // Добавляем обработчики событий
  document.getElementById('monthSelect').addEventListener('change', updateHours);
  document.getElementById('yearSelect').addEventListener('change', updateHours);
});

function calculateSalary() {
  const hourlyRate = parseFloat(document.getElementById('hourlyRate').value) || 0;
  const selectedDate = getSelectedDate();
  const hours = getMonthHours(selectedDate);
  
  // Обновляем отображение часов
  document.getElementById('regularHoursDisplay').textContent = hours.regularHours;
  document.getElementById('holidayHoursDisplay').textContent = hours.holidayHours;
  
  const regularPay = hours.regularHours * hourlyRate;
  const holidayPay = hours.holidayHours * hourlyRate * 1.5;
  const totalPay = regularPay + holidayPay;
  
  const incomeTax = totalPay * 0.10;
  const pensionTax = totalPay * 0.10;
  const unionTax = totalPay * 0.01;
  const medicalInsurance = totalPay * 0.02;
  
  const finalSalary = totalPay - incomeTax - pensionTax - unionTax - medicalInsurance;
  
  document.getElementById('salaryResult').textContent = `${totalPay.toFixed(2)} ₸`;
  document.getElementById('incomeTax').textContent = `${incomeTax.toFixed(2)} ₸`;
  document.getElementById('pensionTax').textContent = `${pensionTax.toFixed(2)} ₸`;
  document.getElementById('unionTax').textContent = `${unionTax.toFixed(2)} ₸`;
  document.getElementById('medicalInsurance').textContent = `${medicalInsurance.toFixed(2)} ₸`;
  document.getElementById('finalSalary').textContent = `${finalSalary.toFixed(2)} ₸`;
  
  document.querySelectorAll('.result-value, .tax-value').forEach(el => {
    el.classList.remove('fade-in');
    void el.offsetWidth; 
    el.classList.add('fade-in');
  });
}

// Обновляем часы при открытии калькулятора
document.addEventListener('DOMContentLoaded', () => {
  const { regularHours, holidayHours } = getMonthHours();
  document.getElementById('regularHoursDisplay').textContent = regularHours;
  document.getElementById('holidayHoursDisplay').textContent = holidayHours;
});

function updateHomeStats() {
  const now = new Date();
  const year = currentYear || now.getFullYear();
  const month = (currentMonth === undefined) ? now.getMonth() : currentMonth;
  
  const workingHours = getWorkingHours(year, month);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let holidays = [];
  let completedShifts = 0;
  let totalShifts = 0;
  const today = new Date();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const holiday = getHolidayName(date);
    
    if (holiday) {
      holidays.push({
        date: date,
        name: holiday,
        isShift: isShiftDay(date)
      });
    }
    
    if (isShiftDay(date)) {
      totalShifts++;
      if (date <= today) {
        completedShifts++;
      }
    }
  }

  document.getElementById('working-hours').textContent = workingHours;
  document.getElementById('holidays-count').textContent = holidays.length;
  document.getElementById('completed-shifts').textContent = totalShifts;

  const holidaysList = document.getElementById('holidays-list');
  if (holidays.length > 0) {
    holidaysList.innerHTML = holidays
      .map(h => {
        const dateOptions = { day: 'numeric', month: 'long' };
        const formattedDate = h.date.toLocaleDateString('ru-RU', dateOptions);
        return `
          <div class="holiday-item${h.isShift ? ' holiday-shift' : ''}">
            <div class="holiday-date">${formattedDate}</div>
            <div class="holiday-name">${h.name}</div>
            ${h.isShift ? '<div class="holiday-shift-icon">смена</div>' : ''}
          </div>
        `;
      })
      .join('');
  } else {
    holidaysList.innerHTML = '<div class="no-holidays">В этом месяце праздников нет</div>';
  }
}

function getWorkingHours(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingHours = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    if (isShiftDay(date)) {
      workingHours += 11;
    }
  }
  
  return workingHours;
}

function getDayStatus(date) {
  const isShift = isShiftDay(date);
  
  let shiftDay = 0;
  let offDay = 0;
  
  if (isShift) {
    const prevDate = new Date(date);
    prevDate.setDate(date.getDate() - 1);
    if (isShiftDay(prevDate)) {
      shiftDay = 2;
    } else {
      shiftDay = 1;
    }
  } else {
    // Определяем номер выходного дня
    const currentDate = new Date(date);
    let dayCount = 0;
    
    // Проверяем предыдущие дни, пока не найдем рабочий день
    while (!isShiftDay(currentDate) && dayCount < 4) {
      dayCount++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    // Если это действительно выходной (а не праздник), устанавливаем номер дня
    if (!getHolidayName(date)) {
      offDay = dayCount;
    }
  }
  
  return {
    isShift: isShift,
    shiftDay: shiftDay,
    offDay: offDay
  };
}

function getNextWorkDay(date) {
  const nextDay = new Date(date);
  nextDay.setHours(0, 0, 0, 0);
  
  // Ищем следующий рабочий день
  while (!isShiftDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
}

// Функция для обновления прогресса смены
function updateShiftProgress() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours + minutes / 60;

  // Массив с информацией о сменах
  const shifts = [
    { id: 1, start: 6, end: 18 },
    { id: 2, start: 9, end: 21 },
    { id: 3, start: 10, end: 22 },
    { id: 4, start: 14, end: 26 } // 26 = 02:00 следующего дня
  ];

  const isWorkingDay = isShiftDay(now);

  shifts.forEach(shift => {
    let progress = 0;
    let adjustedCurrentTime = currentTime;
    const shiftDuration = shift.end - shift.start;

    // Корректировка для смены, переходящей на следующий день
    if (shift.end > 24) {
      if (currentTime < (shift.end - 24)) {
        adjustedCurrentTime += 24;
      }
    }

    // Проверяем, идет ли сейчас смена
    const isShiftTime = adjustedCurrentTime >= shift.start && adjustedCurrentTime < shift.end;
    
    // Рассчитываем прогресс только если это рабочий день
    if (isWorkingDay) {
      if (isShiftTime) {
        progress = (adjustedCurrentTime - shift.start) / shiftDuration;
      } else if (adjustedCurrentTime >= shift.end || (shift.end > 24 && adjustedCurrentTime + 24 >= shift.end)) {
        progress = 1;
      }
    }

    // Обновляем прогресс-бар
    window[`shiftProgressBar${shift.id}`].animate(progress);

    // Обновляем информацию о смене
    const shiftInfo = document.getElementById(`shift-info-${shift.id}`);
    if (shiftInfo) {
      if (!isWorkingDay) {
        shiftInfo.textContent = 'Сегодня выходной';
      } else if (isShiftTime) {
        const remainingHours = Math.floor(shift.end - adjustedCurrentTime);
        const remainingMinutes = Math.floor(((shift.end - adjustedCurrentTime) % 1) * 60);

        const startHour = shift.start % 24;
        const endHour = shift.end % 24 || 24;

        shiftInfo.textContent = `До конца смены: ${remainingHours}ч ${remainingMinutes}мин`;
      } else if (adjustedCurrentTime < shift.start) {
        const startHour = shift.start % 24;
        shiftInfo.textContent = `Смена начнется в ${String(startHour).padStart(2, '0')}:00`;
      } else {
        shiftInfo.textContent = 'Смена закончилась';
      }
    }
  });
}

// Обновляем прогресс каждую минуту
setInterval(updateShiftProgress, 60000);

// Функция для инициализации прогресс-бара
function initializeShiftProgress() {
  const shifts = [
    { id: 1, start: 6, end: 18 },
    { id: 2, start: 9, end: 21 },
    { id: 3, start: 10, end: 22 },
    { id: 4, start: 14, end: 26 } // 26 = 02:00 следующего дня
  ];

  shifts.forEach(shift => {
    const progressElement = document.getElementById(`shift-progress-${shift.id}`);
    if (!window[`shiftProgressBar${shift.id}`] && progressElement) {
      window[`shiftProgressBar${shift.id}`] = new ProgressBar.Line(progressElement, {
        color: '#1abc9c',
        strokeWidth: 4,
        trailWidth: 1,
        duration: 1400,
        text: {
          value: '0%',
          style: {
            position: 'absolute',
            right: '0',
            top: '-25px',
            padding: 0,
            margin: 0,
            transform: null
          }
        },
        step: function(state, line) {
          const value = Math.round(line.value() * 100);
          line.setText(value + '%');
        }
      });
    }
  });
  // Сразу обновляем прогресс после инициализации
  updateShiftProgress();
}

// Инициализируем прогресс-бар, если открыта вкладка графика смен
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('shift-schedule-widget').classList.contains('active')) {
    initializeShiftProgress();
  }
});

// Обновляем прогресс при переключении на вкладку графика смен
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    if (tab.getAttribute('onclick').includes('shift-schedule')) {
      setTimeout(initializeShiftProgress, 100);
    }
  });
});

function showMonthPicker() {
  const picker = document.getElementById('month-picker');
  const content = picker.querySelector('.picker-content');
  const yearPicker = document.getElementById('year-picker');
  
  yearPicker.style.display = 'none';
  
  // Генерируем месяцы
  content.innerHTML = months.map((month, index) => `
    <div class="picker-item ${index === currentMonth ? 'active' : ''}" 
         onclick="selectMonth(${index})">${month}</div>
  `).join('');
  
  picker.style.display = 'block';

  // Добавляем затемнение фона на мобильных
  if (window.innerWidth <= 768) {
    const backdrop = document.querySelector('.picker-backdrop') || document.createElement('div');
    backdrop.className = 'picker-backdrop';
    document.body.appendChild(backdrop);
    setTimeout(() => backdrop.classList.add('show'), 0);
  }
}

function showYearPicker() {
  const picker = document.getElementById('year-picker');
  const content = picker.querySelector('.picker-content');
  const monthPicker = document.getElementById('month-picker');
  
  monthPicker.style.display = 'none';
  
  // Генерируем годы (текущий год ± 5 лет)
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push(`
      <div class="picker-item ${i === currentYear ? 'active' : ''}" 
           onclick="selectYear(${i})">${i}</div>
    `);
  }
  
  content.innerHTML = years.join('');
  picker.style.display = 'block';

  // Добавляем затемнение фона на мобильных
  if (window.innerWidth <= 768) {
    const backdrop = document.querySelector('.picker-backdrop') || document.createElement('div');
    backdrop.className = 'picker-backdrop';
    document.body.appendChild(backdrop);
    setTimeout(() => backdrop.classList.add('show'), 0);
  }
}

function selectMonth(month) {
  currentMonth = month;
  document.getElementById('month-picker').style.display = 'none';
  document.getElementById('month').textContent = months[month];
  showCalendar(currentMonth, currentYear);
  
  // Убираем затемнение фона
  const backdrop = document.querySelector('.picker-backdrop');
  if (backdrop) {
    backdrop.classList.remove('show');
    setTimeout(() => backdrop.remove(), 200);
  }
}

function selectYear(year) {
  currentYear = year;
  document.getElementById('year-picker').style.display = 'none';
  document.getElementById('year').textContent = year;
  showCalendar(currentMonth, currentYear);
  
  // Убираем затемнение фона
  const backdrop = document.querySelector('.picker-backdrop');
  if (backdrop) {
    backdrop.classList.remove('show');
    setTimeout(() => backdrop.remove(), 200);
  }
}

// Закрываем пикеры при клике вне их области
document.addEventListener('click', function(event) {
  const monthPicker = document.getElementById('month-picker');
  const yearPicker = document.getElementById('year-picker');
  const monthTrigger = document.getElementById('month');
  const yearTrigger = document.getElementById('year');
  
  if (!monthPicker.contains(event.target) && event.target !== monthTrigger) {
    monthPicker.style.display = 'none';
  }
  
  if (!yearPicker.contains(event.target) && event.target !== yearTrigger) {
    yearPicker.style.display = 'none';
  }

  // Убираем затемнение фона
  const backdrop = document.querySelector('.picker-backdrop');
  if (backdrop) {
    backdrop.classList.remove('show');
    setTimeout(() => backdrop.remove(), 200);
  }
});

function updateHomeActiveShifts() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours + minutes / 60;

  const shifts = [
    { id: 1, start: 6, end: 18 },
    { id: 2, start: 9, end: 21 },
    { id: 3, start: 10, end: 22 },
    { id: 4, start: 14, end: 26 }
  ];

  const isWorkingDay = isShiftDay(now);
  const activeShiftsContainer = document.getElementById('home-active-shifts');

  if (!activeShiftsContainer) {
    console.error('Контейнер для активных смен не найден!');
    return;
  }

  // Очищаем контейнер
  while (activeShiftsContainer.firstChild) {
    activeShiftsContainer.removeChild(activeShiftsContainer.firstChild);
  }

  if (!isWorkingDay) {
    const dayOffEl = document.createElement('div');
    dayOffEl.className = 'active-shift-item';
    dayOffEl.textContent = 'Сегодня выходной';
    activeShiftsContainer.appendChild(dayOffEl);
    return;
  }

  let hasActiveShifts = false;

  shifts.forEach(shift => {
    let adjustedCurrentTime = currentTime;
    if (shift.end > 24 && currentTime < (shift.end - 24)) {
      adjustedCurrentTime += 24;
    }

    const isShiftTime = adjustedCurrentTime >= shift.start && adjustedCurrentTime < shift.end;
    
    if (isShiftTime) {
      hasActiveShifts = true;
      const progress = (adjustedCurrentTime - shift.start) / (shift.end - shift.start);
      const remainingHours = Math.floor(shift.end - adjustedCurrentTime);
      const remainingMinutes = Math.floor(((shift.end - adjustedCurrentTime) % 1) * 60);

      const startHour = shift.start % 24;
      const endHour = shift.end % 24 || 24;

      const shiftEl = document.createElement('div');
      shiftEl.className = 'active-shift-item';

      // Создаем элементы для времени смены
      const timeEl = document.createElement('div');
      timeEl.className = 'active-shift-time';
      timeEl.textContent = `${String(startHour).padStart(2, '0')}:00 - ${String(endHour).padStart(2, '0')}:00`;
      shiftEl.appendChild(timeEl);

      // Создаем контейнер для прогресс-бара
      const progressEl = document.createElement('div');
      progressEl.className = 'active-shift-progress';
      progressEl.id = `home-shift-progress-${shift.id}`;
      shiftEl.appendChild(progressEl);

      // Создаем элемент для информации о времени
      const infoEl = document.createElement('div');
      infoEl.className = 'active-shift-info';
      infoEl.textContent = `До конца смены: ${remainingHours}ч ${remainingMinutes}мин`;
      shiftEl.appendChild(infoEl);

      activeShiftsContainer.appendChild(shiftEl);

      // Создаем прогресс бар
      new ProgressBar.Line(`#home-shift-progress-${shift.id}`, {
        color: '#1abc9c',
        strokeWidth: 1,
        trailWidth: 0.2,
        duration: 1400,
        text: {
          value: Math.round(progress * 100) + '%',
          style: {
            position: 'absolute',
            right: '-30px',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: 0,
            margin: 0,
            fontSize: '9px',
            fontWeight: '400',
            color: 'var(--text-secondary)',
            minWidth: '25px'
          }
        }
      }).animate(progress);
    }
  });

  if (!hasActiveShifts) {
    const noShiftsEl = document.createElement('div');
    noShiftsEl.className = 'active-shift-item';
    noShiftsEl.textContent = 'Сейчас нет активных смен';
    activeShiftsContainer.appendChild(noShiftsEl);
  }
}

// Обновляем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  updateHomeActiveShifts();
});

// Обновляем каждую минуту
setInterval(updateHomeActiveShifts, 60000);

document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('.widget-container');
  const hammer = new Hammer(container);
  
  hammer.get('swipe').set({
    direction: Hammer.DIRECTION_HORIZONTAL
  });

  const widgetOrder = ['home', 'calendar', 'weather', 'calculator', 'chat', 'shift-schedule'];

  hammer.on('swipeleft swiperight', function(ev) {
    const currentWidget = document.querySelector('.widget.active');
    if (!currentWidget) {
      showWidget('home');
      return;
    }

    const currentId = currentWidget.id.replace('-widget', '');
    console.log('Текущий виджет:', currentId); // Логирование текущего виджета

    let currentIndex = widgetOrder.indexOf(currentId);
    
    if (currentIndex === -1) {
      console.warn('Виджет не найден в порядке:', currentId);
      currentIndex = 0;
    }

    if (ev.type === 'swipeleft') {
      currentIndex = (currentIndex + 1) % widgetOrder.length;
    } else {
      currentIndex = (currentIndex - 1 + widgetOrder.length) % widgetOrder.length;
    }

    const nextWidgetId = widgetOrder[currentIndex];
    console.log('Следующий виджет:', nextWidgetId); // Логирование следующего виджета
    
    // Проверка существования виджета перед переключением
    const nextWidget = document.getElementById(nextWidgetId + '-widget');
    if (!nextWidget) {
      console.error('Виджет не найден:', nextWidgetId);
      showWidget('home');
      return;
    }

    // Принудительное переключение виджета
    try {
      showWidget(nextWidgetId);
      
      // Обновляем навигацию
      document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('onclick').includes(nextWidgetId)) {
          tab.classList.add('active');
        }
      });

      // Инициализируем прогресс-бар для графика смен
      if (nextWidgetId === 'shift-schedule') {
        initializeShiftProgress();
      }
    } catch (error) {
      console.error('Ошибка переключения виджета:', error);
      showWidget('home');
    }
  });
});

// Инициализация всех обновлений при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  console.log('Страница загружена');
  
  // Обновляем активные смены
  console.log('Обновляем активные смены');
  updateHomeActiveShifts();
  
  // Запускаем периодическое обновление
  console.log('Запускаем периодическое обновление');
  setInterval(updateHomeActiveShifts, 60000);
  
  // Обновляем статистику
  updateHomeStats();
});

// Функция для переключения темной темы
function toggleDarkTheme() {
  document.body.classList.toggle('dark-theme');
  const isDarkTheme = document.body.classList.contains('dark-theme');
  localStorage.setItem('darkTheme', isDarkTheme);
}

// Проверяем сохраненную тему при загрузке
document.addEventListener('DOMContentLoaded', () => {
  // Если тема еще не выбрана, устанавливаем темную по умолчанию
  const isDarkTheme = localStorage.getItem('darkTheme');
  if (isDarkTheme === null) {
    localStorage.setItem('darkTheme', 'true');
    document.body.classList.add('dark-theme');
  } else if (isDarkTheme === 'true') {
    document.body.classList.add('dark-theme');
  }
});

// Добавляем обработчик для переключателя темы
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  
  // Устанавливаем начальное состояние переключателя
  const isDarkTheme = localStorage.getItem('darkTheme');
  if (isDarkTheme === 'true') {
    themeToggle.checked = true;
  }

  // Добавляем обработчик события change
  themeToggle.addEventListener('change', () => {
    toggleDarkTheme();
  });
});

function calculateVacationProgress(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    // Если отпуск еще не начался
    if (today < start) {
        return 0;
    }
    
    // Если отпуск уже закончился
    if (today > end) {
        return 100;
    }

    // Вычисляем прогресс
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const daysGone = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    const progress = (daysGone / totalDays) * 100;

    return Math.min(Math.max(progress, 0), 100);
}

function getVacationStatus(vacation) {
    const today = new Date();
    const start = new Date(vacation.startDate);
    const end = new Date(vacation.endDate);

    if (today > end) {
        return 'completed';
    } else if (today >= start && today <= end) {
        return 'active';
    } else {
        return 'upcoming';
    }
}

function getVacationStatusText(vacation) {
    const status = getVacationStatus(vacation);
    switch (status) {
        case 'completed':
            return 'Отпуск завершен';
        case 'active':
            return 'В отпуске';
        case 'upcoming':
            return 'Ожидается';
        default:
            return '';
    }
}