// Import vue component
import ChartBars from '../src/components/Charts/ChartBars.vue'
import ChartGauges from '../src/components/Charts/ChartGauges.vue'
import ChartLines from '../src/components/Charts/ChartLines.vue'
import ChartNumber from '../src/components/Charts/ChartNumber.vue'
import ChartPie from '../src/components/Charts/ChartPie.vue'
import ChartPointCloud from '../src/components/Charts/ChartPointCloud.vue'

import utilities from '../src/modules/utilities'

// Declare install function executed by Vue.use()
export function install(Vue) {
    if (install.installed) return;
    install.installed = true;

    // Charts
    Vue.component('chart-bars', ChartBars);
    Vue.component('chart-gauges', ChartGauges);
    Vue.component('chart-lines', ChartLines);
    Vue.component('chart-number', ChartNumber);
    Vue.component('chart-pie', ChartPie);
    Vue.component('chart-pointcloud', ChartPointCloud);
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
    utilities,
    ChartBars,
    ChartGauges,
    ChartLines,
    ChartPie,
    ChartPointCloud
};