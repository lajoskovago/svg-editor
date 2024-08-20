<template>
  <div class="container">
    <h1 class="download" @click="changeStep">Home</h1>
    <h1 id="topText">SVG File Uploaded</h1>
    <div class="svgContainerStyle" ref="objectContainer" id="tst"></div>
    <div id="svgContainer"></div>
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
          imageSrc: '',
          blob: '',
        }
    },
    methods: {
      async loadSVG() {
            // SVG data as a data URI
            const objectData = 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(this.svg);

            // Create the <object> element
            const objectElement = document.createElement('object');
            objectElement.id = 'test-object';
            objectElement.type = 'image/svg+xml';
            objectElement.data = objectData;
            
            // Append the <object> to the container
            this.$refs.objectContainer.appendChild(objectElement);
            // objectElement.onload = function() {
            //   const SVGObject = document.getElementById('test-object')
            //   const SVGDocument = SVGObject.contentDocument;
            //   console.log(SVGDocument)
            //   console.log('beeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
            // }

            objectElement.addEventListener('load', function() {
                // Access the SVG document within the object
                const svgDoc = objectElement.contentDocument;
                console.log(svgDoc)
                // Access an element inside the SVG (for example, a rectangle)
            });
            


            const element = document.getElementById('test-object');
            // Modify animations using Web Animations API
            element.animate([
              {
                transform: 'translateY(0)',
                backgroundColor: 'red'
              },
              {
                transform: 'translateY(450px)',
                backgroundColor: 'blue'
              }],
              {
                duration: 1000,
                iterations: Infinity,
                direction: 'alternate'
              }  
            )


      // Access and log SVG content
      // Create a container to hold the SVG
      const container = document.getElementById('svgContainer');
      container.innerHTML = this.svg;
      const svgElement = container.querySelector('svg');
// content docuyment always empty


                  document.getAnimations().forEach((animation) => {
  // animation.playbackRate *= 100;
});
      if (svgElement) {
        this.extractAndModifyAnimations(svgElement);
      } else {
        console.log('SVG element not found in container.');
      }
      },

      extractAndModifyAnimations(svgElement) {
        // const svgElement = document.getElementById('SVGElement');
        const animatedElements = svgElement.querySelectorAll('*');
        if (animatedElements.length === 0) {
          console.log('No animated elements found.');
        }
        //////// const svgDoc = objectElement.contentDocument; ALWAYS EMPTYH
        const animationsArray = [];

        animatedElements.forEach(element => {
          const animations = element.getAnimations();
          animations.forEach(animation => {
            animationsArray.push({
              element: element.tagName,
              animation: {
                animationName: animation.animationName,
                duration: animation.effect.duration,
                delay: animation.effect.delay,
                iterationCount: animation.effect.iterationCount,
                direction: animation.effect.direction,
                fillMode: animation.effect.fillMode,
                easing: animation.effect.easing,
                playbackRate: animation.playbackRate,
                startTime: animation.startTime,
                currentTime: animation.currentTime
              }
            });
            element.animate([
              {
                transform: 'translateY(0)',
                backgroundColor: 'red'
              },
              {
                transform: 'translateY(450px)',
                backgroundColor: 'blue'
              }],
              {
                duration: 1000,
                iterations: Infinity,
                direction: 'alternate'
              }  
            )
            
          });
        });
        console.log(svgElement)
        
        this.svgJson = JSON.stringify(animationsArray, null, 2);
      },

       downloadJSON() {
          const blob = new Blob([this.svgJson], { type: 'application/json' });
          const link = document.createElement('a');

          link.href = URL.createObjectURL(blob);
          link.download = 'svg.json';
          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
       },

       modifySVGAnimations() {
          // Access all text elements
          const textElements = this.svg.querySelectorAll('text');
          textElements.forEach(textElement => {
              // Get animations for each text element
              const animations = textElement.getAnimations();
              
              // Log animations
              console.log(`Animations for <text> element:`, animations);
              
              // Modify animation properties if needed
              animations.forEach(animation => {
                  // Example: Update the duration of each animation
                  animation.updatePlaybackRate(0.5); // Change playback rate as an example
                  // You can also modify other properties like animation delay or direction if needed
              });
          });
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