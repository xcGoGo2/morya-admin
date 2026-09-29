import { createApp } from 'vue'
import App from './App.vue'
import { vAuth } from './directives/auth'
import { router } from './router'
import 'morya-ui/styles.css'
import './style.css'
import 'virtual:uno.css'

createApp(App).directive('auth', vAuth).use(router).mount('#app')
