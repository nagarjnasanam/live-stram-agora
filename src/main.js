import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
//bootstrap
import "bootstrap/dist/css/bootstrap.min.css"
import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap"
import "bootstrap-icons/font/bootstrap-icons.css"
//vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
const vuetify = createVuetify({
    components,
    directives,
})
// const appId = "6fa37398a5be49d187db7c4f060d8530";
// const appCertificate = "9c60fefeaf90412c907b4d486706ffac";
createApp(App).use(store).use(router).use(vuetify).mount('#app')
