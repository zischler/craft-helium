# Craft Helium

## Frontend
### Frameworks and Tools (Node modules)
- [webpack](https://webpack.js.org)
- [TypeScript](https://www.typescriptlang.org)
- [Vue.js Ecosystem](https://vuejs.org)
- [lodash](https://lodash.com)
- [cssnext](http://cssnext.io)
- [localForage](https://localforage.github.io/localForage/)

### Components
- Custom Form
- Cookie Banner
- Text-Image
- Image/Video (with Youtube and Vimeo integration)

### Helpers
- Scroll Into Viewport
- Vertical State

### Plugins
- Vue Scroll Into Viewport
- VueX Session Storage

### CSS
- Shell Bootstrap:
    - Reset + Default configuration
    - Accessibility
    - Layout System
    - Flexbox-based System
    - Responsive System
    - Form
    - Images
    - Scroll
    - Text

### Polyfills
- ES6/7/8 support
- Fetch API
- Intersection Observer API
- matchMedia
- CSS object-fit
- MouseEvent

## Setup

- clone repository
- install MAMP or XAMPP to run MySQL and Apache Server on machine
- setup .env file in /craft
  - setup database name for mysql server
  - MySQL Settings:
    - user: root
    - pw: root
    - port: 8889
- create database with your database name on MySQL server
- Any more questions? Read this: https://docs.craftcms.com/v3/installation.html

## Run Frontend

- go to /frontend
- "npm run watch" (for local frontend building)
- "npm run build" (for deployment or production testing)

## CI/CD
### Necessary Steps
- composer install (for example: composer install -d craft --no-interaction --prefer-dist)
- npm ci
- npm run build

### Optional
- Automatically load Project.yaml changes: ./craft project-config/apply
- If you change some Craft Admin Central stuff with an own plugin: composer dump-autoload
- Clear Craft Caches: ./craft clear-caches/all
