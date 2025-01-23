// // Массив отпусков (добавляйте новые отпуска здесь)
// const vacations = [
//     {
//         employee: "Вася",
//         startDate: new Date("2025-01-09"),
//         endDate: new Date("2025-01-18")
//     },
 
// ];

// // Названия месяцев
// const monthNames = [
//     'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
//     'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
// ];

// // Форматирование даты
// function formatDate(date) {
//     return date.toLocaleDateString('ru-RU', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric'
//     });
// }

// // Получение отпусков для конкретного месяца и года
// function getVacationsForMonth(month, year) {
//     return vacations.filter(vacation => {
//         const startMonth = vacation.startDate.getMonth();
//         const startYear = vacation.startDate.getFullYear();
//         const endMonth = vacation.endDate.getMonth();
//         const endYear = vacation.endDate.getFullYear();

//         return (
//             (startYear === year && startMonth === month) ||
//             (endYear === year && endMonth === month) ||
//             (startYear === year && endYear === year && startMonth <= month && endMonth >= month) ||
//             (startYear < year && endYear > year) ||
//             (startYear < year && endYear === year && endMonth >= month) ||
//             (startYear === year && endYear > year && startMonth <= month)
//         );
//     });
// }

// // Функция для правильного склонения слова "отпуск"
// function getVacationWord(count) {
//     if (count === 1) return 'отпуск';
//     if (count >= 2 && count <= 4) return 'отпуска';
//     return 'отпусков';
// }

// // Создание карточки месяца
// function createMonthCard(month, year) {
//     const vacationsInMonth = getVacationsForMonth(month, year);
//     const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;
//     const hasVacations = vacationsInMonth.length > 0;
    
//     return `
//         <div class="month-card ${isCurrentMonth ? 'current-month' : ''}" data-month="${month}" data-year="${year}">
//             <div class="month-header" onclick="toggleMonthVacations(${month}, ${year})">
//                 <div class="month-name">
//                     <i class="ri-calendar-line"></i>
//                     ${monthNames[month]}
//                 </div>
//                 ${hasVacations ? `
//                     <div class="month-info">
//                         <span class="vacation-count">${vacationsInMonth.length}</span>
//                         <i class="ri-arrow-down-s-line toggle-icon"></i>
//                     </div>
//                 ` : ''}
//             </div>
//             ${hasVacations ? `
//                 <div class="month-content">
//                     ${vacationsInMonth.map(vacation => `
//                         <div class="vacation-item">
//                             <div class="vacation-employee">
//                                 <i class="ri-user-line"></i>
//                                 ${vacation.employee}
//                             </div>
//                             <div class="vacation-dates">
//                                 ${formatDate(vacation.startDate)} - ${formatDate(vacation.endDate)}
//                             </div>
//                         </div>
//                     `).join('')}
//                 </div>
//             ` : ''}
//         </div>
//     `;
// }

// // Переключение отображения отпусков для месяца
// function toggleMonthVacations(month, year) {
//     const monthCard = document.querySelector(`.month-card[data-month="${month}"][data-year="${year}"]`);
//     if (!monthCard) return;

//     const content = monthCard.querySelector('.month-content');
//     const toggleIcon = monthCard.querySelector('.toggle-icon');
//     if (!content || !toggleIcon) return;

//     // Закрываем все остальные открытые месяцы
//     const allContents = document.querySelectorAll('.month-content');
//     const allIcons = document.querySelectorAll('.toggle-icon');
//     const allCards = document.querySelectorAll('.month-card');
    
//     allContents.forEach(c => {
//         if (c !== content) {
//             c.style.maxHeight = '0px';
//         }
//     });
    
//     allIcons.forEach(i => {
//         if (i !== toggleIcon) {
//             i.style.transform = 'rotate(0deg)';
//         }
//     });
    
//     allCards.forEach(card => {
//         if (card !== monthCard) {
//             card.classList.remove('expanded');
//         }
//     });

//     // Переключаем текущий месяц
//     const isExpanded = monthCard.classList.contains('expanded');
//     if (!isExpanded) {
//         content.style.maxHeight = content.scrollHeight + 'px';
//         toggleIcon.style.transform = 'rotate(180deg)';
//         monthCard.classList.add('expanded');
//     } else {
//         content.style.maxHeight = '0px';
//         toggleIcon.style.transform = 'rotate(0deg)';
//         monthCard.classList.remove('expanded');
//     }
// }

// // Отображение всех месяцев
// function renderVacations(year) {
//     const container = document.querySelector('.vacation-months');
//     if (!container) return;

//     let content = '';
//     for (let month = 0; month < 12; month++) {
//         content += createMonthCard(month, year);
//     }

//     container.innerHTML = content;

//     // Инициализация состояния контента
//     document.querySelectorAll('.month-content').forEach(content => {
//         content.style.maxHeight = '0px';
//     });
// }

// // Инициализация при загрузке страницы
// document.addEventListener('DOMContentLoaded', () => {
//     // Наблюдаем за изменениями года в Alpine.js
//     const observer = new MutationObserver((mutations) => {
//         mutations.forEach((mutation) => {
//             if (mutation.type === 'characterData' || mutation.type === 'childList') {
//                 const yearElement = document.querySelector('#vacation-widget [x-text="selectedYear"]');
//                 if (yearElement) {
//                     const year = parseInt(yearElement.textContent);
//                     renderVacations(year);
//                 }
//             }
//         });
//     });

//     const yearElement = document.querySelector('#vacation-widget [x-text="selectedYear"]');
//     if (yearElement) {
//         observer.observe(yearElement, { 
//             characterData: true, 
//             childList: true,
//             subtree: true 
//         });
        
//         // Начальный рендер
//         renderVacations(new Date().getFullYear());
//     }

//     // Инициализация AOS
//     AOS.init({
//         duration: 800,
//         easing: 'ease-in-out',
//         once: true
//     });
// });
