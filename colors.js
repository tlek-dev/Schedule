document.addEventListener('DOMContentLoaded', () => {
    // Инициализация colorPicker
    const colorPicker = new iro.ColorPicker("#colorPicker", {
        width: 280,
        color: "#ff0000",
        borderWidth: 2,
        borderColor: "#fff",
        padding: 15,
        layout: [
            {
                component: iro.ui.Wheel,
                options: {
                    wheelLightness: true,
                    wheelAngle: 0,
                    wheelDirection: 'anticlockwise'
                }
            }
        ]
    });

    // Получаем элементы для отображения информации о цвете
    const rgbCode = document.getElementById('rgbCode');
    const hexCode = document.getElementById('hexCode');
    const hslCode = document.getElementById('hslCode');
    const preview = document.querySelector('.color-preview');

    // Создаем элемент для отображения RGB при наведении
    const hoverDisplay = document.createElement('div');
    hoverDisplay.className = 'color-hover-display';
    document.querySelector('.color-picker-wrapper').appendChild(hoverDisplay);

    // Функция обновления отображения цвета
    function updateColorDisplay(color) {
        // Проверяем, что все элементы существуют
        if (!rgbCode || !hexCode || !hslCode || !preview) {
            console.error('Не найдены необходимые элементы для отображения цвета');
            return;
        }

        // Обновляем значения кодов
        rgbCode.textContent = `${Math.round(color.rgb.r)}, ${Math.round(color.rgb.g)}, ${Math.round(color.rgb.b)}`;
        hexCode.textContent = color.hexString.toUpperCase();
        hslCode.textContent = `${Math.round(color.hsl.h)}°, ${Math.round(color.hsl.s * 100)}%, ${Math.round(color.hsl.l * 100)}%`;
        
        // Обновляем цвет превью
        preview.style.backgroundColor = color.hexString;
    }

    // Обработчик изменения цвета
    colorPicker.on(['color:init', 'color:change'], function(color) {
        updateColorDisplay(color);
    });

    // Обработчик наведения на цветовой круг
    const wheelElement = document.querySelector('.IroWheel');
    if (wheelElement) {
        wheelElement.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const radius = rect.width / 2;
            const centerX = radius;
            const centerY = radius;
            
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius) {
                const angle = Math.atan2(dy, dx);
                const hue = ((angle * 180 / Math.PI) + 360) % 360;
                const saturation = (distance / radius) * 100;
                
                // Получаем цвет из точки наведения
                const color = colorPicker.color;
                const hsv = { h: hue, s: saturation, v: color.value };
                
                // Отображаем RGB значения
                hoverDisplay.style.display = 'block';
                hoverDisplay.style.left = (e.pageX + 10) + 'px';
                hoverDisplay.style.top = (e.pageY + 10) + 'px';
                
                // Создаем временный цвет для отображения
                const tempColor = new iro.Color({h: hsv.h, s: hsv.s, v: hsv.v});
                hoverDisplay.textContent = `${Math.round(tempColor.rgb.r)}, ${Math.round(tempColor.rgb.g)}, ${Math.round(tempColor.rgb.b)}`;
            } else {
                hoverDisplay.style.display = 'none';
            }
        });

        // Скрываем display при уходе с круга
        wheelElement.addEventListener('mouseleave', function() {
            hoverDisplay.style.display = 'none';
        });
    }

    // Поддержка тёмной темы
    function updateColorPickerTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        colorPicker.setOptions({
            borderColor: isDark ? '#374151' : '#fff',
        });
    }

    // Отслеживаем изменение темы
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                updateColorPickerTheme();
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true
    });

    // Начальная настройка темы
    updateColorPickerTheme();

    // Инициализация с начальным цветом
    updateColorDisplay(colorPicker.color);
});