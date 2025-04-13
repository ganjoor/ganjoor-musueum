import 'material-design-icons-iconfont/dist/material-design-icons.css';
import './assets/fonts/Samim.css';
import Vue from 'vue';
import VueRouter from 'vue-router'
import { routes } from "./routes";
import App from './App.vue';
import vuetify from './plugins/vuetify';
import { config } from './config';
import TrackingPlugin from './plugins/tracking';



const router = new VueRouter({
    mode: 'history',
    routes
})


Vue.use(VueRouter)

Vue.config.productionTip = true;

Vue.prototype.appConfig = config

Vue.use(TrackingPlugin, {
    router, // REQUIRED
    id: "1", // Optional
    status: "",
    debug: true // Keep enabled during development
});

new Vue({
    render: h => h(App),
    vuetify,
    router
}).$mount('#app');
