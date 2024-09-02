const listMixin = {
  data() {
    return {
      windowHeight: 0,
      flex_between_height: 200,
      tableHeightAdjust: 0,
      autoHeight: {
        height: "",
      },
      autoList: true,
      // 同步关联autoList请求参数
      refquery: false,
      // 遮罩层
      loading: false,
      // 当有很多查询条件时，默认不显示某些查询条件
      toggleSearchStatus: false,
      // id字段名
      idName: "id",
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 字典表格数据
      tableList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      dateRange2: [],
      queryParams: {},
      // 分页信息
      page: {
        current: 1,
        size: 10,
        orders: [
          {
            asc: false,
            column: "create_time",
          },
        ],
      },
      // 表单参数
      form: {},
      // 选中列表
      selectionList: [],
    };
  },
  created() {
    console.log(456);
    this.windowHeight = parseInt(window.innerHeight);
    window.addEventListener("resize", this.getHeight);
    this.getHeight();
    if (this.autoList) {
      if (this.refquery) {
        this.getRefQuery();
      }
      const invoiceId = this.$route.query && this.$route.query.invoiceId;
      if (invoiceId) {
        this.queryParams.invoiceId = invoiceId;
      }
      this.getList();
    }
  },
  destroyed() {
    window.removeEventListener("resize", this.getHeight);
  },
  methods: {
    getHeight() {
      var h = this.windowHeight - 113;
      this.autoHeight.height = h + "px";
      // var el_flex_body = document.getElementsByClassName("flex_body")[0];
      // if(el_flex_body){
      //   el_flex_body.style.height = this.autoHeight.height;
      // }
      var el = document.getElementsByClassName("flex_between")[0];
      if (el) {
        this.flex_between_height =
          (h > el.clientHeight ? h : el.clientHeight) -
          this.tableHeightAdjust -
          220;
        console.log("getHeight:", h, el.clientHeight, this.flex_between_height);
      }
    },
    dataValue(v, def) {
      if (v == undefined) return def;
      return v;
    },
    // 查询条件显示与隐藏
    handleToggleSearch() {
      this.toggleSearchStatus = !this.toggleSearchStatus;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selectionList = selection;
      this.ids = selection.map((item) => item[this.idName]);
      //console.log(JSON.stringify(this.ids))
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    // 查询功能.........................................
    /** 列表搜索按钮操作 */
    handleQuery() {
      this.page.current = 1;
      this.getList();
      console.log("setTimeout");
      if (this.refquery) {
        this.getRefQuery();
      }
      setTimeout(this.getHeight, 1000);
    },

    /** 列表重置按钮操作 */
    resetQuery() {
      if (this.dateRange && this.dateRange != undefined) {
        this.dateRange = [];
      }
      if (this.dateRange2 && this.dateRange2 != undefined) {
        this.dateRange2 = [];
      }
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 查询 */
    getList() {
      this.loading = true;
      const params = Object.assign({}, { page: this.page }, this.queryParams);
      if (this.dateRange && this.dateRange != undefined) {
        params.beginCreateTime = this.dateRange[0];
        params.endCreateTime = this.dateRange[1];
      }
      if (this.dateRange2 && this.dateRange2 != undefined) {
        params.startTime = this.dateRange2[0];
        params.endTime = this.dateRange2[1];
      }

      this.request(this.reqUrl.list, params, "post")
        .then((response) => {
          if (response.data) {
            this.tableList = response.data.records
              ? response.data.records
              : response.data;
            if (response.data.records) {
              this.tableList = response.data.records;
            } else {
              if (response.data.data && response.data.data.records) {
                this.tableList = response.data.data.records;
              }
            }
            if (response.data.total) {
              this.total = response.data.total;
            } else {
              if (response.data.data && response.data.data.total) {
                this.total = response.data.data.total;
              } else {
                this.total = this.tableList.length;
              }
            }
          }
          this.loading = false;
        })
        .catch((err) => {
          this.total = 0;
          this.loading = false;
        });
    },
  },
};

export default listMixin;
