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
        // const objectData = 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(this.svg);
        // get ID with fallbck case
        const objectData = this.svg;
        
        // Create the <object> element
        const objectElement = document.createElement('object');
        objectElement.id = 'test-object';
        objectElement.type = 'image/svg+xml';
        objectElement.data = objectData;
        
        // Append the <object> to the container
        this.$refs.objectContainer.appendChild(objectElement);
        await this.waitForElement('#test-object');
        /// const svgElement = container.querySelector('svg');

  //       const testContainer = document.getElementById('test-object');
  //       // testContainer.innerHTML = this.svg;
  //       console.log(testContainer.contentDocument)
  //       const svgElement2 = testContainer.querySelector('svg');
  // // content docuyment always empty

  //       if (svgElement2) {
  //         this.extractAndModifyAnimations(svgElement2);
  //       } else {
  //         console.log('SVG element not found in container.');
  //       }

        //test the animation on it after loaded
        // animate test object
        const element = document.getElementById('test-object');

        //this only applies for the Object itself
        // Modify animations using Web Animations API
        // element.animate([
        //   {
        //     transform: 'translateY(0)',
        //     // backgroundColor: 'red'
        //   },
        //   {
        //     transform: 'translateY(450px)',
        //   }],
        //   {
        //     duration: 1000,
        //     iterations: Infinity,
        //     direction: 'alternate'
        //   }  
        // )


        // Access and log SVG content
        // Create a container to hold the SVG
        const container = document.getElementById('svgContainer');
        container.innerHTML = this.svg;
        const svgElement = container.querySelector('svg');
  // content docuyment always empty

        if (svgElement) {
          this.extractAndModifyAnimations(svgElement);
        } else {
          console.log('SVG element not found in container.');
        }
      },

      waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
          const start = Date.now();
          const checkElement = () => {
            const element = document.querySelector(selector);

            if (element) {
              resolve(element);
            } else if (Date.now() - start > timeout) {
              reject(new Error('Timeout: Element not found'));
            } else {
              requestAnimationFrame(checkElement);
            }
          };
          checkElement();
        });
      },

      extractAndModifyAnimations(svgElement) {
        const animatedElements = svgElement.querySelectorAll('*');
        debugger;
        if (animatedElements.length === 0) {
          console.log('No animated elements found.');
        }
        console.log(animatedElements)
        const svgDoc = svgElement.contentDocument;
        console.log(svgDoc)
        //////// const svgDoc = objectElement.contentDocument; ALWAYS EMPTYH
        const animationsArray = [];
        let height = 450;
        let elementCount = 0;
        animatedElements.forEach(element => {
          const animations = element.getAnimations();
          console.log(animations)
          animations.forEach((animation) => {
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
            height = height - 100;
            elementCount++;
            // console.log('element count:' + elementCount)
            // console.log('element height set for animations:' + height)
            element.animate([
              {
                transform: 'translateY(0)',
                backgroundColor: 'gray'
              },
              {
                transform: 'translateY('+height+'px)',
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