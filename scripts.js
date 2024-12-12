
function showWidget(widgetName) {
  // Скрываем все виджеты
  document.querySelectorAll('.widget').forEach(widget => {
    widget.classList.remove('active');
  });
  
  // Показываем выбранный виджет
  document.getElementById(widgetName + '-widget').classList.add('active');
  
  // Обновляем активную вкладку
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Находим и активируем нужную вкладку
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    if (tab.getAttribute('onclick').includes(widgetName)) {
      tab.classList.add('active');
    }
  });

  // Инициализируем прогресс бар при открытии вкладки графика смен
  if (widgetName === 'shift-schedule') {
    initializeShiftProgress();
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
    if (holidayName) {
      dayCell.setAttribute("data-holiday", holidayName);
    }

    if (isShiftDay(date)) {
      dayCell.classList.add("shift");
      shiftCount++;
    }

    if (holidayName) {
      dayCell.classList.add("holiday");
    }

    // Проверяем, является ли день текущим
    if (date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()) {
      dayCell.classList.add("today");
    }

    daysContainer.appendChild(dayCell);
  }

  document.getElementById("month").textContent = months[month];
  document.getElementById("year").textContent = year;
}

document.addEventListener("DOMContentLoaded", () => {
  showCalendar(currentMonth, currentYear);
  updateHomeStats();
  updateCurrentDayStatus();
  updateHomeActiveShifts();

  showWidget('home');

  setInterval(updateCurrentDayStatus, 60000);
  setInterval(updateHomeActiveShifts, 60000);
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

function calculateSalary() {
  const hourlyRate = parseFloat(document.getElementById('hourlyRate').value) || 0;
  const regularHours = parseFloat(document.getElementById('regularHours').value) || 0;
  const holidayHours = parseFloat(document.getElementById('holidayHours').value) || 0;
  
  const regularPay = regularHours * hourlyRate;
  const holidayPay = holidayHours * hourlyRate * 1.5;
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

// Функционал темной темы
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Проверяем сохраненную тему
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  body.classList.add(savedTheme);
  themeToggle.checked = savedTheme === 'dark-theme';
}

// Обработчик переключения темы
themeToggle.addEventListener('change', function() {
  if (this.checked) {
    body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark-theme');
  } else {
    body.classList.remove('dark-theme');
    localStorage.setItem('theme', '');
  }
});

// Функция для автоматического переключения темы
function autoThemeSwitch() {
  const hour = new Date().getHours();
  const isDayTime = hour >= 6 && hour < 20; // День с 6:00 до 20:00
  
  const themeSwitch = document.getElementById('theme-toggle');
  if (isDayTime && document.body.classList.contains('dark-theme')) {
    document.body.classList.remove('dark-theme');
    themeSwitch.checked = false;
    localStorage.setItem('theme', 'light');
  } else if (!isDayTime && !document.body.classList.contains('dark-theme')) {
    document.body.classList.add('dark-theme');
    themeSwitch.checked = true;
    localStorage.setItem('theme', 'dark');
  }
}

// Проверяем тему при загрузке
document.addEventListener('DOMContentLoaded', function() {
  // Проверяем сохраненную тему
  const savedTheme = localStorage.getItem('theme');
  const themeSwitch = document.getElementById('theme-toggle');
  
  if (savedTheme) {
    // Если есть сохраненная тема, используем её
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      themeSwitch.checked = true;
    }
  } else {
    // Если нет сохраненной темы, используем автоматическое определение
    autoThemeSwitch();
  }

  // Запускаем проверку каждый час
  setInterval(autoThemeSwitch, 3600000); // 3600000 мс = 1 час
});

// Обработчик переключателя темы
document.getElementById('themeSwitch').addEventListener('change', function() {
  document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', this.checked ? 'dark' : 'light');
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

// Функция для обновления активных смен на главной
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
  activeShiftsContainer.innerHTML = '';

  if (!isWorkingDay) {
    activeShiftsContainer.innerHTML = '<div class="active-shift-item">Сегодня выходной</div>';
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
      shiftEl.innerHTML = `
        <div class="active-shift-time">${String(startHour).padStart(2, '0')}:00 - ${String(endHour).padStart(2, '0')}:00</div>
        <div class="active-shift-progress" id="home-shift-progress-${shift.id}"></div>
        <div class="active-shift-info">До конца смены: ${remainingHours}ч ${remainingMinutes}мин</div>
      `;
      activeShiftsContainer.appendChild(shiftEl);

      // Создаем прогресс бар для смены
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
    activeShiftsContainer.innerHTML = '<div class="active-shift-item">Сейчас нет активных смен</div>';
  }
}

// Обновляем активные смены при загрузке и каждую минуту
document.addEventListener('DOMContentLoaded', updateHomeActiveShifts);
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