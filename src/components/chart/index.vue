<template>
  <div>
    <div ref="chart" :style="{ width: '100%', height: height + 'px' }"></div>
  </div>
</template>

<script>
import { debounce } from "@/utils";
export default {
  props: {
    height: {
      type: Number,
      default: () => "100",
    },
    chartData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      chart: null,
      timer: null,
    };
  },
  watch: {
    chartData: {
      handler(newVal, oldVal) {
        if (this.chart) {
          this.chart.setOption(newVal, true);
        } else {
          this.initChart();
        }
      },
      deep: true, // 对象内部属性的监听，关键。
    },
  },
  created() {},
  mounted() {
    this.initChart();
    this.__resizeHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize();
      }
    }, 600);
    window.addEventListener("resize", this.__resizeHandler);
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    window.removeEventListener("resize", this.__resizeHandler);
    this.chart.dispose();
    this.chart = null;

    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    initChart() {
      let _this = this;
      _this.chart = _this.echarts.init(this.$refs.chart);
      _this.chart.setOption(_this.chartData, true);
    },
  },
};
</script>
