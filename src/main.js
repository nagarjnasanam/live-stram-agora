import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
//bootstrap
import "bootstrap/dist/css/bootstrap.min.css"
import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap"
import "bootstrap-icons/font/bootstrap-icons.css"
// const appId = "6fa37398a5be49d187db7c4f060d8530";
// const appCertificate = "9c60fefeaf90412c907b4d486706ffac";
createApp(App).use(store).use(router).mount('#app')
