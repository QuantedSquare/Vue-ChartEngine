<template>
  <v-content>
    <header id="header" class="pt-2 pl-2 text-xs-left">
      <div>
        <img style="height:3em;" src="../assets/logo_couleur.png">
      </div>
    </header>
    <div class="chart">
      <ChartAssemblee/>
    </div>
    <v-footer class="text-xs-center footer" height="auto" color="rgba(162, 255, 174, 0.5)">
      <v-card-text class="pt-1">
        Data storytelling réalisé par
        <b>
          <a href="http://quantedsquare.com/" style="color: rgb(12, 162, 249);">Quanted Square</a>
        </b>, 2019.     |    
        <a href="mailto:julien@quantedsquare.com" style="color: rgb(12, 162, 249);">julien@quantedsquare.com</a>,
        <a href="mailto:fabien@quantedsquare.com" style="color: rgb(12, 162, 249);">fabien@quantedsquare.com</a>
        <br>Source
        <a
          href="http://data.assemblee-nationale.fr/autres/le-budget-de-l-assemblee-nationale/le-budget-de-l-assemblee-nationale"
          style="color: rgb(12, 162, 249);"
        >données officiels de l'Assemblée Générale</a>
      </v-card-text>
    </v-footer>
  </v-content>
</template>
<script>
import ChartAssemblee from "@/components/ChartAssemblee.vue";

export default {
  name: "donut",
  components: {
    ChartAssemblee
  }
};
</script>
<style>
.footer {
  /* color: #A2FFAE; */
  background: rgba(162, 255, 174, 0.596);
}
#app {
    font-family: 'Poppins', sans-serif !important;
}
</style>
