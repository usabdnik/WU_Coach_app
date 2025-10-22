# 🚀 Инструкция: Как задеплоить приложение

## Текущая ситуация
✅ Я подготовил всё для деплоя:
- Создал ветку `main` локально
- Все изменения уже в ветке `main`
- GitHub Actions workflow настроен

❌ Но я не могу запушить ветку `main` (403 ошибка - ограничение безопасности)

---

## 📋 Что нужно сделать ТЕБЕ

### Вариант 1: Через командную строку (если есть git)

```bash
# 1. Перейди в папку проекта
cd /path/to/WU_Coach_app

# 2. Убедись что в ветке main
git checkout main

# 3. Запуши ветку main
git push -u origin main
```

### Вариант 2: Через GitHub UI (если нет git на компьютере)

1. Открой репозиторий: https://github.com/usabdnik/WU_Coach_app

2. Нажми на кнопку **"Compare & pull request"** для ветки `claude/code-review-011CUMy7JdsHJNgAR3wyKtJa`

3. В открывшемся окне:
   - **Base**: выбери `main` (если ветки main нет, создай её)
   - **Compare**: `claude/code-review-011CUMy7JdsHJNgAR3wyKtJa`
   - Нажми **"Create pull request"**
   - Затем **"Merge pull request"**

4. Или создай ветку main через GitHub UI:
   - Перейди: https://github.com/usabdnik/WU_Coach_app/tree/claude/code-review-011CUMy7JdsHJNgAR3wyKtJa
   - Кликни на переключатель веток (где написано `claude/code-review-...`)
   - Введи название новой ветки: `main`
   - Нажми "Create branch: main from 'claude/code-review-011CUMy7JdsHJNgAR3wyKtJa'"

---

## ⚙️ После push в main

### Шаг 1: Включи GitHub Pages
**Обязательно!** Без этого деплой не сработает.

1. Открой: https://github.com/usabdnik/WU_Coach_app/settings/pages
2. В разделе **"Build and deployment"**:
   - **Source**: выбери **GitHub Actions**
3. Сохрани

### Шаг 2: Проверь автоматический деплой
После push в `main`, GitHub Actions автоматически запустит деплой.

Проверь статус:
- https://github.com/usabdnik/WU_Coach_app/actions

### Шаг 3: Открой приложение
После успешного деплоя (2-3 минуты), приложение будет доступно:

**https://usabdnik.github.io/WU_Coach_app/**

---

## 📱 Установка PWA на телефон

После открытия приложения:

**iOS (Safari):**
1. Нажми кнопку "Поделиться" (квадрат со стрелкой вверх)
2. Выбери "Добавить на экран Домой"
3. Готово! Приложение появится как обычное приложение

**Android (Chrome):**
1. Открой меню (три точки ⋮)
2. Выбери "Установить приложение" или "Добавить на главный экран"
3. Готово!

---

## 🆘 Если что-то пошло не так

### Ошибка 404 на сайте
- Проверь что GitHub Pages включен (Settings → Pages → Source: GitHub Actions)
- Дождись завершения деплоя в разделе Actions (зеленая галочка ✅)

### Ошибка в Actions
- Проверь что в Settings → Environments → github-pages разрешены деплои
- Проверь что workflow имеет permissions для Pages

### Нужна помощь?
Напиши мне, что видишь в разделе Actions, и я помогу разобраться!
