<template>
  <div class="wrap">
    <div
      v-for="(item, index) in data"
      :key="index"
      :class="[current == index ? 'item item-current' : 'item']"
      @click="handleClick(index)"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<script type="text/babel">
export default {
  name: "XyTabs",

  props: {
    data: {
      required: false,
      type: Array,
      default: () => [
        {
          id: 0,
          name: "概况",
        },
        {
          id: 1,
          name: "榜单",
        },
      ],
    },
  },

  data() {
    return {
      current: 0,
    };
  },

  methods: {
    handleClick(e) {
      this.current = e;
    },
  },
};
</script>

<style lang="scss" scoped>
.wrap {
  display: flex;
  .item {
    text-align: center;
    line-height: 37px;
    padding: 0 37px;
    color: #555;
    font-size: 16px;
    background: #f5f5f5;
    border-radius: 2px;
    cursor: pointer;
    &:not(:last-child) {
      margin-right: 9px;
    }
    &.item-current {
      color: #4877e7;
      background-color: #d6e2ff;
    }
  }
}
</style>
