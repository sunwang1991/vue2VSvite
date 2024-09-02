<template>
  <div class="wrapper">
    <h1 data-heading="vue2">vue2+vite</h1>
  </div>
</template>

<script>
export default {
  name: "Index",
  data() {
    return {
      // 版本号
      version: "3.8.4",
    };
  },
};
</script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  font-family: "Source Code Pro", monospace;
  margin: 0 auto;
  height: 100%;

  h1 {
    text-transform: uppercase;
    transform: translate(-50%, -50%) skew(10deg);
    font-size: 7vw;
    top: 50%;
    left: 50%;
    margin: 0;
    position: absolute;
    text-rendering: optimizeLegibility;
    font-weight: 900;
    color: rgba(skyblue, 0.5);
    text-shadow: 1px 4px 6px #e6e2df, 0 0 0 #66303a, 1px 4px 6px #e6e2df;
    white-space: nowrap;
  }
}
</style>
