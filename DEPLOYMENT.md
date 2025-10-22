# Деплой на GitHub Pages

Этот проект настроен для автоматического деплоя на GitHub Pages.

## 🚀 Автоматический деплой

После настройки GitHub Pages, приложение будет автоматически деплоиться при каждом push в ветку `main`.

## 📋 Шаги для первоначальной настройки

### 1. Включить GitHub Pages в репозитории

1. Перейдите в настройки репозитория: `Settings` → `Pages`
2. В разделе **Build and deployment**:
   - Source: выберите **GitHub Actions**
3. Сохраните изменения

### 2. Запустить деплой

**Автоматически** (при каждом push в main):
```bash
git push origin main
```

**Вручную** (через GitHub UI):
1. Перейдите в `Actions` → `Deploy to GitHub Pages`
2. Нажмите `Run workflow` → выберите ветку `main` → `Run workflow`

## 🌐 URL приложения

После успешного деплоя, приложение будет доступно по адресу:

**https://usabdnik.github.io/WU_Coach_app/**

## 📱 Установка как PWA

После открытия приложения на телефоне:

1. **iOS Safari**: Нажмите кнопку "Поделиться" → "Добавить на домашний экран"
2. **Android Chrome**: Нажмите меню (⋮) → "Установить приложение" или "Добавить на главный экран"

## 🔧 Локальная разработка

```bash
cd gym-coach-assistant
npm install
npm run dev
```

Приложение откроется на `http://localhost:3000`

## 📦 Локальный билд

```bash
cd gym-coach-assistant
npm run build
npm run preview
```

## 🛠️ Технические детали

- **Платформа**: GitHub Pages
- **CI/CD**: GitHub Actions
- **Build tool**: Vite
- **Framework**: React + TypeScript
- **Styling**: TailwindCSS
- **Charts**: Recharts

---

**Примечание**: Для работы GitHub Actions необходимы права на запись в Pages. Убедитесь, что в настройках репозитория включены правильные permissions для Workflows.
