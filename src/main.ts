import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import 'morya-ui/styles.css'
import './style.css'

createApp(App).use(router).mount('#app')
