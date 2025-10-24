/**
 * Тестовый скрипт для проверки синхронизации с Google Sheets Apps Script
 * Запуск: node test-google-sheets-api.js
 */

const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbym0TPQNfLGjyXaBhonCqs86xHzPBAQxXK7Dw6EpYBt5h6v-1XaMl7HrhMOymvlQjDR/exec';

// Функция для выполнения запроса
async function testRequest(description, url, options = {}) {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 Тест:', description);
  console.log('='.repeat(80));

  try {
    console.log('📤 URL:', url);
    if (options.body) {
      console.log('📤 Request body:', JSON.stringify(JSON.parse(options.body), null, 2));
    }

    const response = await fetch(url, options);
    const data = await response.json();

    console.log('📥 Status:', response.status);
    console.log('📥 Response:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ Успешно!');
    } else {
      console.log('❌ Ошибка:', data.error || 'Unknown error');
    }

    return data;
  } catch (error) {
    console.error('❌ Исключение:', error.message);
    return null;
  }
}

// Основная функция тестирования
async function runTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║       ТЕСТИРОВАНИЕ ИНТЕГРАЦИИ С GOOGLE SHEETS APPS SCRIPT             ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝');

  // Тест 1: Получить всех студентов
  const studentsData = await testRequest(
    'Получение списка студентов',
    `${WEBAPP_URL}?action=getAllStudents`
  );

  // Тест 2: Получить упражнения
  const exercisesData = await testRequest(
    'Получение списка упражнений',
    `${WEBAPP_URL}?action=getExercises`
  );

  // Тест 3: Получить цели
  const goalsData = await testRequest(
    'Получение списка целей',
    `${WEBAPP_URL}?action=getGoals`
  );

  // Анализируем полученные цели
  if (goalsData && goalsData.success && goalsData.data && goalsData.data.goals) {
    const goals = goalsData.data.goals;
    console.log('\n📊 Анализ целей:');
    console.log('   Всего целей:', goals.length);
    if (goals.length > 0) {
      console.log('   Первая цель:', JSON.stringify(goals[0], null, 2));

      const firstGoal = goals[0];
      const goalId = firstGoal.id;

      // Тест 4: Обновить статус цели (вариант 1 - updateGoal)
      console.log('\n🔄 Пробуем обновить цель (вариант 1: updateGoal)...');
      await testRequest(
        'Обновление цели - вариант updateGoal',
        WEBAPP_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'updateGoal',
            params: {
              goalData: {
                id: goalId,
                dateCompleted: new Date().toISOString()
              }
            }
          })
        }
      );

      // Тест 5: Обновить статус цели (вариант 2 - updateGoalStatus)
      console.log('\n🔄 Пробуем обновить цель (вариант 2: updateGoalStatus)...');
      await testRequest(
        'Обновление цели - вариант updateGoalStatus',
        WEBAPP_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'updateGoalStatus',
            params: {
              goalId: goalId,
              dateCompleted: new Date().toISOString(),
              isComplete: true
            }
          })
        }
      );

      // Тест 6: Обновить статус цели (вариант 3 - completeGoal)
      console.log('\n🔄 Пробуем обновить цель (вариант 3: completeGoal)...');
      await testRequest(
        'Обновление цели - вариант completeGoal',
        WEBAPP_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'completeGoal',
            params: {
              goalId: goalId,
              dateCompleted: new Date().toISOString()
            }
          })
        }
      );

      // Тест 7: Обновить статус цели (вариант 4 - setGoalComplete)
      console.log('\n🔄 Пробуем обновить цель (вариант 4: setGoalComplete)...');
      await testRequest(
        'Обновление цели - вариант setGoalComplete',
        WEBAPP_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'setGoalComplete',
            params: {
              id: goalId,
              completed: true,
              completionDate: new Date().toISOString()
            }
          })
        }
      );
    }
  }

  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║                         ТЕСТИРОВАНИЕ ЗАВЕРШЕНО                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

// Запуск тестов
runTests().catch(console.error);
