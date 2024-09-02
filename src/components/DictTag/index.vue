<template>
  <div>
    <template v-for="(item, index) in options">
      <!-- <template v-if="values.includes(item.value)">
            <span v-if="item.raw.listClass == 'default' || item.raw.listClass == ''" :key="item.value" :index="index"
              :style="{ color: item.raw.cssClass }">{{ item.label }}</span>
            <el-tooltip v-else class="item" effect="dark" :content="item.label" placement="top-start">
              <el-tag class="tag" :disable-transitions="true" :key="item.value" :index="index"
                :type="item.raw.listClass == 'primary' ? '' : item.raw.listClass">
                {{ item.label }}
              </el-tag>
            </el-tooltip>
          </template> -->
      <template v-if="values.includes(item.value)">
        <el-tooltip class="item" :style="stylel" effect="dark" :content="item.label" placement="top-start">
          <el-tag class="tag"   :disable-transitions="true" :key="item.value" :index="index"
            :type="item.raw.listClass == 'primary' ? '' : item.raw.listClass">
            {{ item.label }}
          </el-tag>
        </el-tooltip>
      </template>
    </template>
</div>
</template>

<script>


export default {
  name: "DictTag",
  props: {
    options: {
      type: Array,
      default: null,
    },
    stylel:{
      type: Object,
      default: null,
      require:false
    },
    value: [Number, String, Array, Boolean],
  },
  computed: {
    values () {
      if (this.value !== null && typeof this.value !== 'undefined') {
        return Array.isArray(this.value) ? this.value : [String(this.value)];
      } else {
        return [];
      }
    },
  },
};
</script>
<style scoped>
.el-tag {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-tag+.el-tag {
  margin-left: 10px;
}
</style>
