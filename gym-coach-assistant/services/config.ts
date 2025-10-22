// Google Sheets Apps Script configuration
export const GOOGLE_SHEETS_CONFIG = {
  // URL веб-приложения Apps Script
  WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbym0TPQNfLGjyXaBhonCqs86xHzPBAQxXK7Dw6EpYBt5h6v-1XaMl7HrhMOymvlQjDR/exec',

  // Месяцы учебного года (сентябрь - август)
  MONTHS: ['Сент', 'Окт', 'Нояб', 'Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг'],
};

// Получение текущего учебного сезона
export function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  // Если сентябрь-декабрь => сезон начался в этом году
  // Если январь-август => сезон начался в прошлом году
  const seasonStartYear = month >= 9 ? year : year - 1;
  const seasonEndYear = seasonStartYear + 1;

  return {
    name: `${seasonStartYear}-${seasonEndYear}`,
    startYear: seasonStartYear,
    endYear: seasonEndYear,
    startDate: new Date(seasonStartYear, 8, 1), // 1 сентября
    endDate: new Date(seasonEndYear, 7, 31) // 31 августа
  };
}
