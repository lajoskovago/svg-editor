<template>
  <div class="container">
    <h1 class="download" @click="changeStep">Home</h1>
    <h1>SVG File Uploaded</h1>
    <div class="svgContainerStyle" ref="imageContainer"></div>
    <img v-if="imageSrc" :src="imageSrc" alt="SVG Image" />
    <div class="jsonContainer">
      <div class="jsonHeader">Style JSON</div><small class="download" @click="downloadJSON">DOWNLOAD</small>
    </div>
    <div class="jsonContainer">{{svgJson}}</div>
    <div class="jsonContainer">
      <div class="jsonHeader">Upload new JSON</div>
    </div>
    <input
      type="file"
      @change="jsonUpload($event)"
      accept="application/json"
      capture
    />
  </div>
</template>

<script>
import { checkIfValidJSON } from '../utils/functions.js'
export default {
    props: ['svg'],
    data() {
        return {
          svgJson: [],
          newJson: [],
          svgJsonText: '',
          initialStyles: [],
          imageSrc: ''
        }
    },
    methods: {
      async loadSVG() {
        //
         try {
          //add svg as image to prevent css overwriting
          var blob = new Blob([this.svg], {
            type: 'image/svg+xml'
          });
          this.imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(this.svg)}`;
          let url = URL.createObjectURL(blob);
          let image = document.createElement('img');
          image.src = url;
          const imgElement = document.createElement('img');
          imgElement.src = image.src;
          imgElement.alt = 'Uploaded SVG';
          // Append the image to the container
          this.$refs.imageContainer.appendChild(imgElement);
          image.addEventListener('load', () => URL.revokeObjectURL(url), {once: true});
          this.extractStylesFromSVG();
         } catch (error) {
           console.log('Error loading SVG');
         }
       },

       downloadJSON() {
          const blob = new Blob([this.svgJsonText], { type: 'application/json' });
          const link = document.createElement('a');

          link.href = URL.createObjectURL(blob);
          link.download = 'svg.json';
          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
       },
       extractStylesFromSVG() {
        const svgElement = this.$refs.imageContainer;
        
        this.initialStyles = window.getComputedStyle(svgElement);
        const styleEntries = {};
        for (let i = 0; i < this.initialStyles.length; i++) {
          const key = this.initialStyles[i];
          styleEntries[key] = this.initialStyles.getPropertyValue(key);
        }
        this.svgJson = styleEntries;
        this.svgJsonText = JSON.stringify(computedStyles);
        
       },

      applyNewCSS() {
        const imageContainer = this.$refs.imageContainer;
        for (let i = 0; i < this.initialStyles.length; i++) {
          const key = this.initialStyles[i];          
          imageContainer.style.setProperty(key, this.newJson[key]);
        }
        // imageContainer.style.setProperty('fill', 'rgb(89, 50, 59)');
        // imageContainer.offsetHeight;
        // requestAnimationFrame(() => {
        //   let computedStyles = window.getComputedStyle(imageContainer);
        //   let variable = computedStyles.getPropertyValue('animation-delay');
        //   console.log(variable);
        // });
      },

      jsonUpload(event) {
        const file = event.target.files[0];
        
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    // Parse JSON data
                    const data = JSON.parse(e.target.result);
                    this.newJson = data;
                    const valid = checkIfValidJSON(this.newJson, this.svgJson);
                    if(valid) {
                      console.log('apply new css');
                      this.applyNewCSS();
                    } else {
                      alert('Json does not have the same keys')
                    }
                    this.processItem(this.newJson)
                } catch (error) {
                    //alert('Error parsing JSON file');
                }
            };

            reader.readAsText(file);
        } else {
            alert('Please upload a valid JSON file');
        }
      },
      changeStep(){
        this.$emit("nextStep", ["Step1", '']);
      },
    },
    mounted() {
        this.loadSVG();
    },
    ready()
    {
      
    }
}
</script>
<style>
.svgContainerStyle {
  height: 500px;
  width: 500px;
}

.jsonContainer {
      display: flex;
      gap: 10px;
    }

.download {
  cursor: pointer;
}
.jsonHeader {
  font-size: 2em;
}
</style>