import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faUserSecret ,faCommentAlt,faCog} from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faUserSecret,faCommentAlt,faCog)
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
createApp(App).use(store).component('font-awesome-icon', FontAwesomeIcon).use(router).use(vuetify).mount('#app')
