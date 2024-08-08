<template>
  <main>
    <Step1 @nextStep="changeStep" v-if="selectedComponent == 'Step1'"/>
    <Step2 @nextStep="changeStep" v-if="selectedComponent == 'Step2'" :svg="svgContent"/>
  </main>
</template>

<script lang="ts">
import Step1 from '@/components/Step1.vue';
import Step2 from '@/components/Step2.vue';

export default {
    name: "SVGImporter",
    components: {
        Step1, Step2
    },
    data() {
        return {
            selectedComponent: "Step1",
            svgContent: '',
        }
    }, 
    methods: {
        changeStep(data) {
            this.selectedComponent = data[0];
            if(this.selectedComponent == 'Step2') {
              this.svgContent = data[1];
            }
        }
    }, 
}

</script>