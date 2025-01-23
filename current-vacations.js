// Логика для виджета текущих отпусков
document.addEventListener('alpine:init', () => {
    Alpine.data('currentMonthVacations', () => ({
        get currentVacations() {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            
            return vacations.filter(vacation => {
                const startMonth = vacation.startDate.getMonth();
                const startYear = vacation.startDate.getFullYear();
                const endMonth = vacation.endDate.getMonth();
                const endYear = vacation.endDate.getFullYear();
                
                return (
                    (startYear === currentYear && startMonth === currentMonth) ||
                    (endYear === currentYear && endMonth === currentMonth) ||
                    (startYear === currentYear && endYear === currentYear && 
                     startMonth <= currentMonth && endMonth >= currentMonth)
                );
            }).sort((a, b) => a.startDate - b.startDate);
        },

        get hasVacations() {
            return this.currentVacations.length > 0;
        },

        getVacationStatus(vacation) {
            const now = new Date();
            
            if (vacation.endDate < now) {
                return 'past';
            }
            
            if (vacation.startDate <= now && vacation.endDate >= now) {
                return 'current';
            }
            
            return 'upcoming';
        },

        getStatusText(vacation) {
            const status = this.getVacationStatus(vacation);
            switch (status) {
                case 'past':
                    return 'Завершен';
                case 'current':
                    return 'Текущий';
                case 'upcoming':
                    return 'Предстоит';
                default:
                    return '';
            }
        },

        formatDateRange(start, end) {
            const options = { day: 'numeric', month: 'numeric' };
            return `${start.toLocaleDateString('ru-RU', options)} - ${end.toLocaleDateString('ru-RU', options)}`;
        }
    }));
});
