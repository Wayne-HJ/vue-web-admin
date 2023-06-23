<template>
  <el-card class="main-card">
    <div class="title">{{ this.$route.name }}</div>
    <!-- 表格操作 -->
    <div class="operation-container">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="openModel(null)"
      >
        {{$t("Public.add")}}
      </el-button>
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        :disabled="this.categoryIdList.length == 0"
        @click="isDelete = true"
      >
      {{$t("Public.delete")}}
      </el-button>
      <div style="margin-left:auto">
        <el-input
          v-model="keywords"
          prefix-icon="el-icon-search"
          size="small"
          :placeholder="$t('CatAndTag.hintCat')"
          style="width:200px"
          @keyup.enter.native="searchCategories"
        />
        <el-button
          type="primary"
          size="small"
          icon="el-icon-search"
          style="margin-left:1rem"
          @click="searchCategories"
        >
        {{$t("Public.search")}}
        </el-button>
      </div>
    </div>
    <!-- 表格展示 -->
    <el-table
      border
      :data="categoryList"
      @selection-change="selectionChange"
      v-loading="loading"
    >
      <!-- 表格列 -->
      <el-table-column type="selection" width="55" />
      <!-- 分类名 -->
      <el-table-column prop="categoryName" :label="$t('CatAndTag.catName')" align="center" />
      <!-- 文章量 -->
      <el-table-column prop="articleCount" :label="$t('CatAndTag.articles')" align="center" />
      <!-- 分类创建时间 -->
      <el-table-column prop="createTime" :label="$t('CatAndTag.createTime')" align="center">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right:5px" />
          {{ scope.row.createTime | date }}
        </template>
      </el-table-column>
      <!-- 列操作 -->
      <el-table-column :label="操作" width="160" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="openModel(scope.row)">
            {{$t("Public.edit")}}
          </el-button>
          <el-popconfirm
            :title="$t('CatAndTag.hintDelete')"
            style="margin-left:1rem"
            @confirm="deleteCategory(scope.row.id)"
          >
            <el-button size="mini" type="danger" slot="reference">
              {{$t("Public.delete")}}
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      class="pagination-container"
      background
      @size-change="sizeChange"
      @current-change="currentChange"
      :current-page="current"
      :page-size="size"
      :total="count"
      :page-sizes="[10, 20]"
      layout="total, sizes, prev, pager, next, jumper"
    />
    <!-- 批量删除对话框 -->
    <el-dialog :visible.sync="isDelete" width="30%">
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning" style="color:#ff9900" />{{$t("CatAndTag.hint")}}
      </div>
      <div style="font-size:1rem">{{$t("CatAndTag.hintDelete")}}</div>
      <div slot="footer">
        <el-button @click="isDelete = false">{{$t("Public.cancel")}}</el-button>
        <el-button type="primary" @click="deleteCategory(null)">
          {{$t("Public.confirm")}}
        </el-button>
      </div>
    </el-dialog>
    <!-- 添加编辑对话框 -->
    <el-dialog :visible.sync="addOrEdit" width="30%">
      <div class="dialog-title-container" slot="title" ref="categoryTitle" />
      <el-form label-width="80px" size="medium" :model="categoryForm">
        <el-form-item :label="$t('CatAndTag.name')">
          <el-input v-model="categoryForm.categoryName" style="width:220px" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addOrEdit = false">{{$t("Public.cancel")}}</el-button>
        <el-button type="primary" @click="addOrEditCategory">
          {{$t("Public.confirm")}}
        </el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  created() {
    this.listCategories();
  },
  data: function() {
    return {
      isDelete: false,
      loading: true,
      addOrEdit: false,
      keywords: null,
      categoryIdList: [],
      categoryList: [],
      categoryForm: {
        id: null,
        categoryName: ""
      },
      current: 1,
      size: 10,
      count: 0
    };
  },
  methods: {
    selectionChange(categoryList) {
      this.categoryIdList = [];
      categoryList.forEach(item => {
        this.categoryIdList.push(item.id);
      });
    },
    searchCategories() {
      this.current = 1;
      this.listCategories();
    },
    sizeChange(size) {
      this.size = size;
      this.listCategories();
    },
    currentChange(current) {
      this.current = current;
      this.listCategories();
    },
    deleteCategory(id) {
      var param = {};
      if (id == null) {
        param = { data: this.categoryIdList };
      } else {
        param = { data: [id] };
      }
      this.axios.delete("/api/admin/categories", param).then(({ data }) => {
        if (data.flag) {
          this.$notify.success({
            title: "成功",
            message: data.message
          });
          this.listCategories();
        } else {
          this.$notify.error({
            title: "失败",
            message: data.message
          });
        }
        this.isDelete = false;
      });
    },
    listCategories() {
      this.axios
        .get("/api/admin/categories", {
          params: {
            current: this.current,
            size: this.size,
            keywords: this.keywords
          }
        })
        .then(({ data }) => {
          this.categoryList = data.data.recordList;
          this.count = data.data.count;
          this.loading = false;
        });
    },
    openModel(category) {
      if (category != null) {
        this.categoryForm = JSON.parse(JSON.stringify(category));
        this.$refs.categoryTitle.innerHTML = this.$t("CatAndTag.editCat");
      } else {
        this.categoryForm.id = null;
        this.categoryForm.categoryName = "";
        this.$refs.categoryTitle.innerHTML = this.$t("CatAndTag.addCat");
      }
      this.addOrEdit = true;
    },
    addOrEditCategory() {
      if (this.categoryForm.categoryName.trim() == "") {
        this.$message.error(this.$t("CatAndTag.hintCatErro"));
        return false;
      }
      this.axios
        .post("/api/admin/categories", this.categoryForm)
        .then(({ data }) => {
          if (data.flag) {
            this.$notify.success({
              title: "成功",
              message: data.message
            });
            this.listCategories();
          } else {
            this.$notify.error({
              title: "失败",
              message: data.message
            });
          }
          this.addOrEdit = false;
        });
    }
  }
};
</script>
