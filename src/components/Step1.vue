<template>
  <h1>Please upload a SVG file to start</h1>
  <div>
    <input
      type="file"
      @change="onFileChanged($event)"
      accept="image/svg+xml"
      capture
    />
    <div class="svgContainerStyle">
      <object 
        id="objectSVG"
        ref="svgObject"
        v-if="svgFile"
        v-bind:data="svgFile"
      ></object>
    </div>
    
    <div v-show="hasSvgAnimationJson">
      <div class="jsonContainer">
        <div class="jsonHeader" >Animation JSON</div><small class="download" @click="downloadJSON">DOWNLOAD</small>
      </div>
      <div id="animationJson">{{ svgAnimationJson }}</div>
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
  </div>
</template>

<script>
import { checkIfValidJSON } from '../utils/functions.js'
const MIME_TYPES = ['image/svg+xml'];
export default {
    data() {
        return {
            svgFile: false,
            hasSvgAnimationJson: false,
            svgAnimationJson: '',
            handleSvgLoad: {},
        }
    },
    methods: {
      onFileChanged( event ) {
        this.hasSvgAnimationJson = false;
        // update the object with the content
        this.svgFile = URL.createObjectURL(event.target.files[0]);
        // wait for object to be loaded
        this.$nextTick(() => {
          const svgObject = this.$refs.svgObject;

          // Attach event listener to the object element
          if (svgObject) {
            //if we have the object we append an event listener
            // Bind the context of 'this' to ensure correct reference
            this.handleSvgLoad = this.onSvgLoaded.bind(this);

            // Add the event listener
            svgObject.addEventListener('load', this.handleSvgLoad);
          }
        });

      },
      onSvgLoaded() {
        // now that the element is loaded, we can remove the event lsitener as it is not needed anymore
        const svgObject = this.$refs.svgObject;
        if (svgObject) {
          // Remove the event listener if available
          if (this.handleSvgLoad) {
              svgObject.removeEventListener('load', this.handleSvgLoad);
          }
          // extract animations
          this.extractAnimationsToJson(svgObject)
        } else {
          console.error('Failed to load SVG content');
        }
      },
      extractAnimationsToJson(svgObject) {
        // extract animations
        const animations = svgObject.contentWindow.document.getAnimations({subtree: true});
        const animationsJsonObject = animations.reduce((accumulator, animation) => {
          // set a key to be easier to identify
          const key = animation.effect.target.tagName + '-' + animation.effect.target.textContent;
          // get also keyframes
          const keyFrames = animation.effect.getKeyframes();

          // build the object for aniamtions
          const animationObject = {
              id: animation.id || key,
              type: animation.constructor.name,
              playbackRate: animation.playbackRate,
              keyFrames: keyFrames
          };

          // keep the keys to be easier to match
          accumulator[key] = animationObject;
          
          return accumulator;
        }, {});
        this.displayJson(animationsJsonObject)
      },

      displayJson(animationsObject) {
        this.hasSvgAnimationJson = true;
        // stringify to be easier to output in user friendly json on export
        this.svgAnimationJson = JSON.stringify(animationsObject, null, 2);
        
      },

      downloadJSON() {
        const blob = new Blob([this.svgAnimationJson], { type: 'application/json' });
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
                  // we parse the original json from object to json
                  const valid = checkIfValidJSON(this.newJson, JSON.parse(this.svgAnimationJson));
                  if(valid) {
                    this.applyNewAnimation()
                  } else {
                    alert('Json does not have the same keys')
                  }
              } catch (error) {
                  alert('Error parsing JSON file');
              }
          };
          reader.readAsText(file);
        } else {
            alert('Please upload a valid JSON file');
        }
      },

      applyNewAnimation() {
        //we the svg object
        const svgObject = this.$refs.svgObject;
        //because could not find any id for any of the items from wavy, we iterate trough each to find them and change its animation
        const animations = svgObject.contentWindow.document.getAnimations({subtree: true});
        
        animations.forEach(animation => {
          // we find the new aniamtion that will be required
          const key = animation.effect.target.tagName + '-' + animation.effect.target.textContent;
          // get element so we can change the aniamtion
          const element = animation.effect.target;
          console.log(this.newJson[key]);
          try {
            element.animate(this.newJson[key]['keyFrames'], {
              duration: 1000, // Set duration or use animationData's duration
              playbackRate: this.newJson[key]['playbackRate'],
              iterations: this.newJson[key]['iterations'] || Infinity,  // Infinite loop
          });
          } catch(error) {
            console.log(error)
          }
          return;          
        });
      }
    },
}
</script>
<style scoped>
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