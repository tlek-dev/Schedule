document.addEventListener('DOMContentLoaded', () => {
    // Initialize countries data
    fetchCountries();

    // Add search functionality
    const searchInput = document.getElementById('countrySearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterCountries(searchTerm);
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('countryModal');
        if (e.target === modal) {
            closeCountryModal();
        }
    });
});

let allCountries = [];

async function fetchCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();
        // Sort countries alphabetically
        allCountries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        displayCountries(allCountries);
    } catch (error) {
        console.error('Error fetching countries:', error);
        document.getElementById('countriesList').innerHTML = `
            <div class="col-span-full text-center text-red-500">
                Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.
            </div>
        `;
    }
}

function displayCountries(countries) {
    const countriesList = document.getElementById('countriesList');
    if (!countriesList) return;

    countriesList.innerHTML = countries.map(country => `
        <div class="country-card" onclick="showCountryDetails(${JSON.stringify(country).replace(/"/g, '&quot;')})">
            <img src="${country.flags.png}" alt="${country.flags.alt || country.name.common + ' flag'}" class="country-flag">
            <div class="country-name">${country.name.common}</div>
        </div>
    `).join('');
}

function filterCountries(searchTerm) {
    const filteredCountries = allCountries.filter(country => {
        return (
            country.name.common.toLowerCase().includes(searchTerm) ||
            country.region.toLowerCase().includes(searchTerm) ||
            (country.capital?.[0]?.toLowerCase() || '').includes(searchTerm)
        );
    });
    displayCountries(filteredCountries);
}

function showCountryDetails(country) {
    const modal = document.getElementById('countryModal');
    const modalName = document.getElementById('modalCountryName');
    const modalFlag = document.getElementById('modalFlag');
    const modalInfo = document.querySelector('.modal-info');

    modalName.textContent = country.name.common;
    modalFlag.src = country.flags.png;
    modalFlag.alt = country.flags.alt || `${country.name.common} flag`;

    const currencies = country.currencies ? 
        Object.values(country.currencies).map(curr => `${curr.name} (${curr.symbol})`).join(', ') : 
        'Н/Д';

    const languages = country.languages ? 
        Object.values(country.languages).join(', ') : 
        'Н/Д';

    const info = [
        { label: 'Столица', value: country.capital?.[0] || 'Н/Д' },
        { label: 'Регион', value: country.region },
        { label: 'Субрегион', value: country.subregion || 'Н/Д' },
        { label: 'Население', value: formatPopulation(country.population) },
        { label: 'Языки', value: languages },
        { label: 'Валюты', value: currencies },
        { label: 'Площадь', value: formatArea(country.area) },
        { label: 'Телефонный код', value: country.idd?.root + (country.idd?.suffixes?.[0] || '') || 'Н/Д' }
    ];

    modalInfo.innerHTML = info.map(item => `
        <div class="info-item">
            <div class="info-label">${item.label}</div>
            <div class="info-value">${item.value}</div>
        </div>
    `).join('');

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCountryModal() {
    const modal = document.getElementById('countryModal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function formatPopulation(population) {
    return new Intl.NumberFormat('ru-RU').format(population);
}

function formatArea(area) {
    if (!area) return 'Н/Д';
    return new Intl.NumberFormat('ru-RU').format(area) + ' км²';
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCountryModal();
    }
});
