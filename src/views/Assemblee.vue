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
  <v-footer class="indigo accent-4 white--text text-xs-center" dark height="auto">
      <!-- <v-card class="indigo lighten-1 white--text text-xs-center"> -->
        <v-card-text class="white--text pt-1">
          Data storytelling réalisé par
          <b>
            <a href="http://quantedsquare.com/" style="color: rgb(40, 234, 141);">Quanted Square</a>
          </b>, 2019.
          <br>
          <a href="mailto:julien@quantedsquare.com" style="color: rgb(40, 234, 141);">julien@quantedsquare.com</a>, <a href="mailto:fabien@quantedsquare.com" style="color: rgb(40, 234, 141);">fabien@quantedsquare.com</a>
          <br>
          <br>
          <v-divider></v-divider>
          Source
          <a
            href="http://data.assemblee-nationale.fr/autres/le-budget-de-l-assemblee-nationale/le-budget-de-l-assemblee-nationale"
            style="color: rgb(40, 234, 141);"
          >données officiels de l'Assemblée Générale</a>
        </v-card-text>
<!-- 
        <v-divider></v-divider>

        <v-card-text class="white--text">
          
        </v-card-text> -->
      <!-- </v-card> -->
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