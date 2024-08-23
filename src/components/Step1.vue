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
        id="object"
        ref="svgObject"
        v-if="svgFile"
        v-bind:data="svgFile"
        @load="onSvgLoaded"
      ></object>
    </div>
    <pre id="animationJson"></pre>
  </div>
  
</template>

<script>
const MIME_TYPES = ['image/svg+xml'];
export default {
    data() {
        return {
            svgFile: false,
        }
    },
    methods: {
      onFileChanged( event ) {
        // update the object with the content
         this.svgFile = URL.createObjectURL(event.target.files[0]);
      },
      onSvgLoaded() {
        const svgObject = this.$refs.svgObject;
        const contentDocument = svgObject.contentDocument;
        // .getAnimations({subtree: true});
        if (contentDocument) {
          console.log('SVG contentDocument:', contentDocument);
          this.extractAnimationsToJson(contentDocument)
        } else {
          console.error('Failed to load SVG content');
        }
      },
      extractAnimationsToJson(contentDocument) {
        const svgElement = contentDocument.querySelector('svg');
        const animations = svgElement.getAnimations();  // Get all animations associated with the SVG element

        const animationsJson = animations.map(animation => {
            const effect = animation.effect.getTiming();
            return {
                id: animation.id || null,
                type: animation.constructor.name,  // "CSSAnimation" or "Animation"
                delay: effect.delay,
                duration: effect.duration,
                endDelay: effect.endDelay,
                iterations: effect.iterations,
                iterationStart: effect.iterationStart,
                direction: effect.direction,
                fill: effect.fill,
                easing: effect.easing,
                startTime: animation.startTime,
                currentTime: animation.currentTime,
                playbackRate: animation.playbackRate,
                timeline: animation.timeline ? animation.timeline.constructor.name : null,
            };
        });
        this.displayJson(animationsJson)
        return animationsJson;
      },

      displayJson(animationsJson) {
        const jsonContainer = document.getElementById('animationJson');
        jsonContainer.textContent = JSON.stringify(animationsJson, null, 2);
        console.log(JSON.stringify(animationsJson, null, 2))
      }
    },
}
</script>
<style scoped>
.svgContainerStyle {
  height: 500px;
  width: 500px;
}
</style>