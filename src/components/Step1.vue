<template>
  <h1>Please upload a SVG file to start</h1>
  <div>
    <input
      type="file"
      @change="onFileChanged($event)"
      accept="image/svg+xml"
      capture
    />
    <div ref="imageContainer"></div>
  </div>
  
</template>

<script>
const MIME_TYPES = ['image/svg+xml'];
import { ref } from 'vue';
import DOMPurify from 'dompurify';
export default {
    data() {
        return {
            fileName: '',
            file: '',
            svgContent : ref(''),
            fileContent: ''
        }
    },
    methods: {
      onFileChanged( event ) {
         this.file = event.target.files[0];
         if(this.file) {
          if (!MIME_TYPES.includes(this.file?.type)) {
            alert('Please upload an image file.');
            return;
         }
         //web animation API get computed style
          const reader = new FileReader();
          reader.onload = (e) => {
            this.svgContent = DOMPurify.sanitize(e.target.result, { USE_PROFILES: { svg: true, svgFilters: true } });
            this.changeStep(this.svgContent)
          };
          let svgFile = reader.readAsText(this.file);
         } else {
            alert('No file');
            return;
         }
         
      },
      changeStep(svg){
        this.$emit("nextStep", ["Step2", svg]);
      },
    },
    mounted() {
        console.log('Application mounted');
    },
}
</script>
