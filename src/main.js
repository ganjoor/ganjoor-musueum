import 'material-design-icons-iconfont/dist/material-design-icons.css';
import './assets/fonts/Samim.css';
import Vue from 'vue';
// import VueRouter from 'vue-router'
import router from './routes';
import App from './App.vue';
// import vuetify from './plugins/vuetify';
import { config } from './config';
import VueAnalytics from 'vue-analytics';
import './index.css';




// const router = new VueRouter({
//     mode: 'history',
//     routes    
// })


// Vue.use(VueRouter)

Vue.use(VueAnalytics, {
    id: 'UA-63626-15',
    router
})

Vue.config.productionTip = true;

Vue.prototype.appConfig = config

new Vue({
    router,
    render: h => h(App),
}).$mount('#app');
