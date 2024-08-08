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
         //web animation API get computed stylerd
         this.blobToSvg(this.file, (svgElement) => {
          this.getSvgStyles(svgElement);
        });
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
      getSvgStyles(svgElement) {
          document.body.appendChild(svgElement);
          console.log(svgElement)
          const computedStyles = window.getComputedStyle(svgElement);

          const fill = computedStyles.getPropertyValue('fill');
          const stroke = computedStyles.getPropertyValue('stroke');
          const transform = computedStyles.getPropertyValue('transform');

          console.log('Fill:', fill);
          console.log('Stroke:', stroke);
          console.log('Transform:', transform);

          document.body.removeChild(svgElement);
        },

       blobToSvg(blob, callback) {
        const reader = new FileReader();

        reader.onload = function(event) {
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(event.target.result, 'image/svg+xml');
          const svgElement = svgDoc.documentElement;

          callback(svgElement);
        };

        reader.readAsText(blob);
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
