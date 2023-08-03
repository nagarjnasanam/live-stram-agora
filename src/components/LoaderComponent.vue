
<template>
  <div>
    <div v-if="loader">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else>{{ text }}</div>
  </div>
</template>
<script>
export default {
  name: "LoaderComponent",
  props: {
    loader: Boolean,
    text: String,
  },
  mounted(){
    console.log(this.loader,this.text)
  }
};
</script>