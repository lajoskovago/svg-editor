<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>
<style>
/* Test if css is overwritten*/ 
text, circle, rect, path, g, line, polyline, polygon, ellipse {
  fill: #000;
  stroke: #0F0;
  stroke-width: 2px;
}
</style>