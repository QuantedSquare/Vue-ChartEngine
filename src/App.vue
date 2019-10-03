<template>
    <div id="app">
        <!-- <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
</div> -->
        <v-app>
            <v-content>
                <router-view />
            </v-content>
        </v-app>
    </div>
</template>
<style lang="scss">
#app {
    /*font-family: 'Poppins', sans-serif !important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;*/
    text-align: center;
    color: #2c3e50;
}
</style>