#!/usr/bin/env node

/**
 * Автоматический тест локального приложения
 */

const http = require('http');

console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
console.log('║              АВТОМАТИЧЕСКОЕ ТЕСТИРОВАНИЕ ПРИЛОЖЕНИЯ                   ║');
console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

// Проверка что сервер запущен
function checkServer() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Проверка локального сервера...');

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/WU_Coach_app/',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Сервер запущен и отвечает (status 200)');

          // Проверяем что это HTML
          if (data.includes('<!DOCTYPE html') || data.includes('<!doctype html')) {
            console.log('✅ Сервер возвращает HTML');
            resolve({ status: 'ok', html: data });
          } else {
            console.log('❌ Сервер не возвращает HTML');
            reject(new Error('Not HTML response'));
          }
        } else {
          console.log(`❌ Сервер вернул статус ${res.statusCode}`);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (e) => {
      console.log('❌ Ошибка подключения к серверу:', e.message);
      reject(e);
    });

    req.on('timeout', () => {
      console.log('❌ Timeout подключения к серверу');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Проверка что в HTML загружается правильный JS файл
function checkJSFile(html) {
  console.log('\n🔍 Проверка подключенных JS файлов...');

  const jsMatch = html.match(/src="\/WU_Coach_app\/assets\/(index-[^"]+\.js)"/);

  if (jsMatch) {
    const jsFile = jsMatch[1];
    console.log('✅ Найден JS файл:', jsFile);
    return jsFile;
  } else {
    console.log('❌ JS файл не найден в HTML');
    return null;
  }
}

// Проверка содержимого JS файла
function checkJSContent(jsFile) {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Проверка содержимого JS файла...');

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/WU_Coach_app/assets/${jsFile}`,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ JS файл загружен');

          // Проверяем наличие goalData в правильном формате
          const hasGoalData = data.includes('goalData');
          const hasCorrectFormat = /params:\{goalData:\{id:/.test(data);
          const hasOldFormat = /params:\{goalId:/.test(data);

          console.log('\n📊 РЕЗУЛЬТАТЫ ПРОВЕРКИ:');
          console.log('─────────────────────────────────────────');

          if (hasGoalData) {
            console.log('✅ goalData найден в коде');
          } else {
            console.log('❌ goalData НЕ найден в коде');
          }

          if (hasCorrectFormat) {
            console.log('✅ ПРАВИЛЬНЫЙ формат: params:{goalData:{id:...');
          } else {
            console.log('❌ Правильный формат НЕ найден');
          }

          if (hasOldFormat) {
            console.log('❌ НАЙДЕН СТАРЫЙ формат: params:{goalId:...');
          } else {
            console.log('✅ Старый формат не найден');
          }

          console.log('─────────────────────────────────────────\n');

          if (hasCorrectFormat && !hasOldFormat) {
            console.log('🎉 УСПЕХ! Код содержит ПРАВИЛЬНЫЙ формат!');
            console.log('\n✅ Обновление статуса целей БУДЕТ РАБОТАТЬ!\n');
            resolve(true);
          } else {
            console.log('❌ ОШИБКА! Код содержит неправильный формат');
            reject(new Error('Wrong format'));
          }
        } else {
          console.log(`❌ JS файл вернул статус ${res.statusCode}`);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (e) => {
      console.log('❌ Ошибка загрузки JS файла:', e.message);
      reject(e);
    });

    req.on('timeout', () => {
      console.log('❌ Timeout загрузки JS файла');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Основная функция
async function runTests() {
  try {
    // Шаг 1: Проверка сервера
    const { html } = await checkServer();

    // Шаг 2: Найти JS файл
    const jsFile = checkJSFile(html);
    if (!jsFile) {
      throw new Error('JS file not found');
    }

    // Шаг 3: Проверить содержимое JS
    await checkJSContent(jsFile);

    console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
    console.log('║                    ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!                        ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
    console.log('║                         ТЕСТЫ ПРОВАЛЕНЫ!                              ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');
    console.error('Ошибка:', error.message);
    process.exit(1);
  }
}

// Запуск
runTests();
