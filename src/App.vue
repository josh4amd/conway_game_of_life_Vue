<template>
  <div id="app">
    <ConwayGrid/>
  </div>
</template>

<script>
import ConwayGrid from './components/ConwayGrid'

export default {
  name: 'App',
  components: {
    ConwayGrid
  }
}
</script>

<style>
@import '../node_modules/bootstrap/dist/css/bootstrap.css';
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
