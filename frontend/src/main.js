import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './styles.css'

import en from './i18n/en';
import de from './i18n/de';

const i18n = createI18n({
  locale: navigator.language,
  fallbackLocale: 'en',
  messages: { en, de }
});

const app = createApp(App);

app.use(router);
app.use(i18n);
app.mount('#app');
