<template>
  <div id="app">
    <!-- <HelloWorld/> -->
    <ConwayGrid/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld'
import ConwayGrid from './components/ConwayGrid'

export default {
  name: 'App',
  components: {
    HelloWorld,
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
