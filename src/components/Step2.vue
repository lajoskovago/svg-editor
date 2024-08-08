<template>
  <div class="container">
    <h1 class="download" @click="changeStep">Home</h1>
    <h1>SVG File Uploaded</h1>
    <div class="svgContainerStyle" ref="imageContainer"></div>
    <img v-if="imageSrc" :src="imageSrc" ref="imageTag" alt="SVG Image" />
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
import { checkIfValidJSON, encodeToBase64, decodeBase64 } from '../utils/functions.js'
export default {
    props: ['svg'],
    data() {
        return {
          svgJson: [],
          newJson: [],
          svgJsonText: '',
          initialStyles: [],
          imageSrc: '',
          blob: '',
        }
    },
    methods: {
      async loadSVG() {
        //
         try {
          //add svg as image to prevent css overwriting
          //first type with image blob
          this.blob = new Blob([this.svg], {
            type: 'image/svg+xml'
          });
          let url = URL.createObjectURL(this.blob);
          let image = document.createElement('img');
          image.src = url;
          const imgElement = document.createElement('img');
          imgElement.src = image.src;
          imgElement.alt = 'Uploaded SVG';
          //extract styles from BLOB
          this.fetchAndExtractStylesFromBlobUrl(url);;

          // Append the image to the container
          this.$refs.imageContainer.appendChild(imgElement);
          image.addEventListener('load', () => URL.revokeObjectURL(url), {once: true});


          //second type with base 64 encoding
          this.imageSrc = `data:image/svg+xml;base64,${btoa(this.svg)}`;
          // extract styles from abse 64
          this.extractStylesFromSVGBase64();

          //getting computed styles from IMG tag but it returns plain styles not from IMG URL
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

       //getting computed styles, but we only get plain data, not from URL
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

       // we decode the base 64 image.... and get the inline styles from it
       extractStylesFromSVGBase64() {
        
        // Decode base64 to SVG string
        const base64Svg = this.imageSrc.split(',')[1]; // Remove the data URL prefix
        const svgString = decodeBase64(base64Svg);
        // Modify the SVG content
        const modifiedSvg = this.modifySvgContent(svgString);

        // Re-encode to base64 and update image source
        const newBase64Svg = encodeToBase64(modifiedSvg);
        this.imageSrc = `data:image/svg+xml;base64,${newBase64Svg}`;
        
      },

      //extracting the styles from BLOB
      async fetchAndExtractStylesFromBlobUrl(svgUrl) {
        try {
          // Fetch the SVG content
          const response = await fetch(svgUrl);
          const svgText = await response.text();
          
          // Extract styles from the SVG string
          this.extractStylesFromSvgString(svgText);
        } catch (error) {
          console.error('Error fetching SVG:', error);
        }
      },

      //extracting styles from string
      extractStylesFromSvgString(svgString) {
        // Create a temporary DOM element to hold the SVG string
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
        
        // Find all <style> elements within the SVG
        const styleElements = svgDoc.querySelectorAll('style');
        
        // Extract and parse CSS rules
        const cssJson = {};
        
        styleElements.forEach(style => {
          const cssText = style.textContent;
          const rules = this.parseCss(cssText);
          
          // Combine all rules into a single JSON object
          Object.assign(cssJson, rules);
        });
        
        console.log('CSS Rules as JSON:', cssJson);
      },

      //parsing CSS String.... but it has errors
      parseCss(cssText) {
        const cssRules = {};
  
        // Split CSS text into rules
        const ruleBlocks = cssText.split('}').filter(rule => rule.trim());
        
        ruleBlocks.forEach(ruleBlock => {
          const [selectors, rules] = ruleBlock.split('{').map(part => part.trim());
          
          if (selectors && rules) {
            const selectorList = selectors.split(',').map(sel => sel.trim());
            const ruleList = rules.split(';').filter(rule => rule.trim());
            
            ruleList.forEach(rule => {
              const [property, value] = rule.split(':').map(part => part.trim());
              
              if (property && value) {
                selectorList.forEach(selector => {
                  if (!cssRules[selector]) {
                    cssRules[selector] = {};
                  }
                  cssRules[selector][property] = value;
                });
              }
            });
          }
        });
        
        return cssRules;
      },

      //trying to modify parameters, temporarly for backup
       modifySvgContent(svgString) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;
        const test = window.getComputedStyle(svgElement);
        const styleEntries = {};
        for (let i = 0; i < test.length; i++) {
          const key = this.initialStyles[i];
          styleEntries[key] = this.initialStyles.getPropertyValue(key);
        }
        console.log(styleEntries);
        // Modify SVG elements
        const circle = svgElement.querySelector('style');
        if (circle) {
          circle.setAttribute('fill', 'blue'); // Change fill color to blue
        }

        // Serialize the modified SVG
        const serializer = new XMLSerializer();
        return serializer.serializeToString(svgElement);
      },

      //old function kept for backup @TODO: remove
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

      //upload JSON
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