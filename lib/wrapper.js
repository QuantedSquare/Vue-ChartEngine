// Import vue component
import ChartBars from '../src/components/Charts/ChartBars.vue'
import ChartLines from '../src/components/Charts/ChartLines.vue'
import ChartNumber from '../src/components/Charts/ChartNumber.vue'
import ChartPie from '../src/components/Charts/ChartPie.vue'

// Declare install function executed by Vue.use()
export function install(Vue) {
    if (install.installed) return;
    install.installed = true;

    // Charts
    Vue.component('chart-bars', ChartBars);
    Vue.component('chart-lines', ChartLines);
    Vue.component('chart-number', ChartNumber);
    Vue.component('chart-pie', ChartPie);
}

// Create module definition for Vue.use()
const plugin = {
    install,
};

// Auto-install when vue is found (eg. in browser via <script> tag)
let GlobalVue = null;
if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue;
}
if (GlobalVue) {
    GlobalVue.use(plugin);
}

// To allow use as module(npm / webpack / etc.) export component
export default {
    install,
    ChartBars,
    ChartLines,
    ChartPie
};