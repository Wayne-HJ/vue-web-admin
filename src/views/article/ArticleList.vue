<template>
  <el-card class="main-card">
    <div class="title">{{ this.$route.name }}</div>
    <!-- 文章状态 -->
    <div class="article-status-menu">
      <span>{{$t("ArticleList.state")}}</span>
      <span @click="changeStatus('all')" :class="isActive('all')">{{$t("ArticleList.all")}}</span>
      <span @click="changeStatus('public')" :class="isActive('public')">
        {{$t("PublishArticles.public")}}
      </span>
      <span @click="changeStatus('secret')" :class="isActive('secret')">
        {{$t("PublishArticles.private")}}
      </span>
      <span @click="changeStatus('draft')" :class="isActive('draft')">
        {{$t("ArticleList.draftBox")}}
      </span>
      <span @click="changeStatus('delete')" :class="isActive('delete')">
        {{$t("ArticleList.bin")}}
      </span>
    </div>
    <!-- 表格操作 -->
    <div class="operation-container">
      <el-button
        v-if="isDelete == 0"
        type="danger"
        size="small"
        icon="el-icon-delete"
        :disabled="articleIdList.length == 0"
        @click="updateIsDelete = true"
      >
      {{$t("ArticleList.delete")}}
      </el-button>
      <el-button
        v-else
        type="danger"
        size="small"
        icon="el-icon-delete"
        :disabled="articleIdList.length == 0"
        @click="remove = true"
      >
      {{$t("ArticleList.delete")}}
      </el-button>
      <el-button
        type="success"
        size="small"
        icon="el-icon-download"
        :disabled="articleIdList.length == 0"
        style="margin-right:1rem"
        @click="isExport = true"
      >
      {{$t("ArticleList.batchExport")}}
      </el-button>
      <el-dropdown>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-upload"
          style="margin-right:1rem"
        >
        {{$t("ArticleList.BatchImport")}}
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <el-upload
              action="/api/admin/articles/import"
              multiple
              :limit="9"
              :show-file-list="false"
              :on-success="uploadArticle"
            >
            {{$t("ArticleList.generalArticle")}}
            </el-upload>
          </el-dropdown-item>
          <el-dropdown-item
            ><el-upload
              action="/api/admin/articles/import?type=hexo"
              multiple
              :limit="9"
              :show-file-list="false"
              :on-success="uploadArticle"
            >
            {{$t("ArticleList.hexo")}}
            </el-upload></el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
      <!-- 条件筛选 -->
      <div style="margin-left:auto">
        <!-- 文章类型 -->
        <el-select
          clearable
          v-model="type"
          :placeholder="$t('ArticleList.hintSelect')"
          size="small"
          style="margin-right:1rem;width: 150px;"
        >
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <!-- 分类 -->
        <el-select
          clearable
          size="small"
          v-model="categoryId"
          filterable
          :placeholder="$t('ArticleList.hintSelect1')"
          style="margin-right:1rem;width: 150px;"
        >
          <el-option
            v-for="item in categoryList"
            :key="item.id"
            :label="item.categoryName"
            :value="item.id"
          />
        </el-select>
        <!-- 标签 -->
        <el-select
          clearable
          size="small"
          v-model="tagId"
          filterable
          :placeholder="$t('ArticleList.hintInput')"
          style="margin-right:1rem;width: 150px;"
        >
          <el-option
            v-for="item in tagList"
            :key="item.id"
            :label="item.tagName"
            :value="item.id"
          />
        </el-select>
        <!-- 文章名 -->
        <el-input
          clearable
          v-model="keywords"
          prefix-icon="el-icon-search"
          size="small"
          :placeholder="$t('ArticleList.hintInput1')"
          style="width:200px"
          @keyup.enter.native="searchArticles"
        />
        <el-button
          type="primary"
          size="small"
          icon="el-icon-search"
          style="margin-left:1rem"
          @click="searchArticles"
        >
        {{$t("ArticleList.search")}}
        </el-button>
      </div>
    </div>
    <!-- 表格展示 -->
    <el-table
      border
      :data="articleList"
      @selection-change="selectionChange"
      v-loading="loading"
    >
      <!-- 表格列 -->
      <el-table-column type="selection" width="55" />
      <!-- 文章封面-->
      <el-table-column
        prop="articleCover"
        :label="$t('ArticleList.cover')"
        width="150"
        align="center"
      >
        <template slot-scope="scope">
          <el-image
            class="article-cover"
            :src="
              scope.row.articleCover
                ? scope.row.articleCover
                : 'https://cdn.jsdelivr.net/gh/Haitao45/pictures@main/img/Photo%20by%20jisu%20lee%20(JLE7S5iTouU).jpg'
            "
          />
          <i
            v-if="scope.row.status == 1"
            class="iconfont el-icon-mygongkai article-status-icon"
          />
          <i
            v-if="scope.row.status == 2"
            class="iconfont el-icon-mymima article-status-icon"
          />
          <i
            v-if="scope.row.status == 3"
            class="iconfont el-icon-mycaogaoxiang article-status-icon"
          />
        </template>
      </el-table-column>
      <!-- 文章标题 -->
      <el-table-column prop="articleTitle" :label="$t('ArticleList.title')" align="center" width="150"/>
      <!-- 文章分类 -->
      <el-table-column
        prop="categoryName"
        :label="$t('PublishArticles.classify')"
        width="90"
        align="center"
      />
      <!-- 文章标签 -->
      <el-table-column
        prop="tagDTOList"
        :label="$t('PublishArticles.tag')"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag
            v-for="item of scope.row.tagDTOList"
            :key="item.tagId"
            style="margin-right:0.2rem;margin-top:0.2rem"
          >
            {{ item.tagName }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 文章浏览量 -->
      <el-table-column
        prop="viewsCount"
        :label="$t('Home.text1')"
        width="70"
        align="center"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.viewsCount">
            {{ scope.row.viewsCount }}
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <!-- 文章点赞量 -->
      <el-table-column
        prop="likeCount"
        :label="$t('ArticleList.likes')"
        width="70"
        align="center"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.likeCount">
            {{ scope.row.likeCount }}
          </span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <!-- 文章类型 -->
      <el-table-column prop="type" :label="$t('PublishArticles.articleType')" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="articleType(scope.row.type).tagType">
            {{ articleType(scope.row.type).name }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 文章发表时间 -->
      <el-table-column
        prop="createTime"
        :label="$t('ArticleList.issuingTime')"
        width="130"
        align="center"
      >
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right:5px" />
          {{ scope.row.createTime | date }}
        </template>
      </el-table-column>
      <!-- 文章置顶 -->
      <el-table-column prop="isTop" :label="$t('PublishArticles.top')"  align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isTop"
            active-color="#13ce66"
            inactive-color="#F4F4F5"
            :disabled="scope.row.isDelete == 1"
            :active-value="1"
            :inactive-value="0"
            @change="changeTop(scope.row)"
          />
        </template>
      </el-table-column>
      <!-- 列操作 -->
      <el-table-column :label="$t('ArticleList.operate')" align="center" width="180">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="editArticle(scope.row.id)"
            v-if="scope.row.isDelete == 0"
          >
          {{$t("ArticleList.edit")}}
          </el-button>
          <el-popconfirm
            :title="$t('ArticleList.hintdelete2')"
            style="margin-left:10px"
            @confirm="updateArticleDelete(scope.row.id)"
            v-if="scope.row.isDelete == 0"
          >
            <el-button size="mini" type="danger" slot="reference">
              {{$t("ArticleList.delete")}}
            </el-button>
          </el-popconfirm>
          <el-popconfirm
            :title="$t('ArticleList.hintrecover')"
            v-if="scope.row.isDelete == 1"
            @confirm="updateArticleDelete(scope.row.id)"
          >
            <el-button size="mini" type="success" slot="reference">
              {{$t("ArticleList.recover")}}
            </el-button>
          </el-popconfirm>
          <el-popconfirm
            style="margin-left:10px"
            v-if="scope.row.isDelete == 1"
            :title="$t('ArticleList.hintdelete3')"
            @confirm="deleteArticles(scope.row.id)"
          >
            <el-button size="mini" type="danger" slot="reference">
              {{$t("ArticleList.delete")}}
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
    <!-- 批量逻辑删除对话框 -->
    <el-dialog :visible.sync="updateIsDelete" width="30%">
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning" style="color:#ff9900" />{{$t("ArticleList.hint")}}
      </div>
      <div style="font-size:1rem">{{$t("ArticleList.hintdelete")}}</div>
      <div slot="footer">
        <el-button @click="updateIsDelete = false">{{$t("PublishArticles.cancel")}}</el-button>
        <el-button type="primary" @click="updateArticleDelete(null)">
          {{$t("ArticleList.confirm")}}
        </el-button>
      </div>
    </el-dialog>
    <!-- 批量彻底删除对话框 -->
    <el-dialog :visible.sync="remove" width="30%">
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning" style="color:#ff9900" />{{$t("ArticleList.hint")}}
      </div>
      <div style="font-size:1rem">{{$t("ArticleList.hintdelete1")}}</div>
      <div slot="footer">
        <el-button @click="remove = false">{{$t("PublishArticles.cancel")}}</el-button>
        <el-button type="primary" @click="deleteArticles(null)">
          {{$t("ArticleList.confirm")}}
        </el-button>
      </div>
    </el-dialog>
    <!-- 批量导出对话框 -->
    <el-dialog :visible.sync="isExport" width="30%">
      <div class="dialog-title-container" slot="title">
        <i class="el-icon-warning" style="color:#ff9900" />{{$t("ArticleList.hint")}}
      </div>
      <div style="font-size:1rem">{{$t("ArticleList.hintExport")}}</div>
      <div slot="footer">
        <el-button @click="isExport = false">{{$t("PublishArticles.cancel")}}</el-button>
        <el-button type="primary" @click="exportArticles(null)">
          {{$t("ArticleList.confirm")}}
        </el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  created() {
    this.listArticles();
    this.listCategories();
    this.listTags();
  },
  data: function() {
    return {
      loading: true,
      updateIsDelete: false,
      remove: false,
      typeList: [
        {
          value: 1,
          label: this.$t("PublishArticles.original")
        },
        {
          value: 2,
          label: this.$t("PublishArticles.reprint")
        },
        {
          value: 3,
          label: this.$t("PublishArticles.translate")
        }
      ],
      activeStatus: "all",
      articleList: [],
      articleIdList: [],
      categoryList: [],
      tagList: [],
      keywords: null,
      type: null,
      categoryId: null,
      tagId: null,
      isDelete: 0,
      isExport: false,
      status: null,
      current: 1,
      size: 10,
      count: 0
    };
  },
  methods: {
    selectionChange(articleList) {
      this.articleIdList = [];
      articleList.forEach(item => {
        this.articleIdList.push(item.id);
      });
    },
    searchArticles() {
      this.current = 1;
      this.listArticles();
    },
    editArticle(id) {
      this.$router.push({ path: "/articles/" + id });
    },
    updateArticleDelete(id) {
      let param = {};
      if (id != null) {
        param.idList = [id];
      } else {
        param.idList = this.articleIdList;
      }
      param.isDelete = this.isDelete == 0 ? 1 : 0;
      this.axios.put("/api/admin/articles", param).then(({ data }) => {
        if (data.flag) {
          this.$notify.success({
            title: this.$t("PublishArticles.success"),
            message: data.message
          });
          this.listArticles();
        } else {
          this.$notify.error({
            title: this.$t("PublishArticles.fail"),
            message: data.message
          });
        }
        this.updateIsDelete = false;
      });
    },
    deleteArticles(id) {
      var param = {};
      if (id == null) {
        param = { data: this.articleIdList };
      } else {
        param = { data: [id] };
      }
      this.axios.delete("/api/admin/articles", param).then(({ data }) => {
        if (data.flag) {
          this.$notify.success({
            title: this.$t("PublishArticles.success"),
            message: data.message
          });
          this.listArticles();
        } else {
          this.$notify.error({
            title: this.$t("PublishArticles.fail"),
            message: data.message
          });
        }
        this.remove = false;
      });
    },
    exportArticles(id) {
      var param = {};
      if (id == null) {
        param = this.articleIdList;
      } else {
        param = [id];
      }
      console.log(param);
      this.axios.post("/api/admin/articles/export", param).then(({ data }) => {
        if (data.flag) {
          this.$notify.success({
            title: this.$t("PublishArticles.success"),
            message: data.message
          });
          data.data.forEach(item => {
            this.downloadFile(item);
          });
          this.listArticles();
        } else {
          this.$notify.error({
            title: this.$t("PublishArticles.fail"),
            message: data.message
          });
        }
        this.isExport = false;
      });
    },
    downloadFile(url) {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none"; // 防止影响页面
      iframe.style.height = 0; // 防止影响页面
      iframe.src = url;
      document.body.appendChild(iframe);
      setTimeout(() => {
        iframe.remove();
      }, 5 * 60 * 1000);
    },
    uploadArticle(data) {
      if (data.flag) {
        this.$notify.success({
          title: this.$t("PublishArticles.success"),
          message: this.$t("ArticleList.importSuccess")
        });
        this.listArticles();
      } else {
        this.$notify.error({
          title: this.$t("PublishArticles.fail"),
          message: data.message
        });
      }
    },
    sizeChange(size) {
      this.size = size;
      this.listArticles();
    },
    currentChange(current) {
      this.current = current;
      this.listArticles();
    },
    changeStatus(status) {
      switch (status) {
        case "all":
          this.isDelete = 0;
          this.status = null;
          break;
        case "public":
          this.isDelete = 0;
          this.status = 1;
          break;
        case "secret":
          this.isDelete = 0;
          this.status = 2;
          break;
        case "draft":
          this.isDelete = 0;
          this.status = 3;
          break;
        case "delete":
          this.isDelete = 1;
          this.status = null;
          break;
      }
      this.current = 1;
      this.activeStatus = status;
    },
    changeTop(article) {
      this.axios
        .put("/api/admin/articles/top", {
          id: article.id,
          isTop: article.isTop
        })
        .then(({ data }) => {
          if (data.flag) {
            this.$notify.success({
              title: this.$t("PublishArticles.success"),
              message: this.$t("ArticleList.topSuccess")
            });
          } else {
            this.$notify.error({
              title: this.$t("PublishArticles.fail"),
              message: data.message
            });
          }
          this.remove = false;
        });
    },
    listArticles() {
      this.axios
        .get("/api/admin/articles", {
          params: {
            current: this.current,
            size: this.size,
            keywords: this.keywords,
            categoryId: this.categoryId,
            status: this.status,
            tagId: this.tagId,
            type: this.type,
            isDelete: this.isDelete
          }
        })
        .then(({ data }) => {
          this.articleList = data.data.recordList;
          this.count = data.data.count;
          this.loading = false;
        });
    },
    listCategories() {
      this.axios.get("/api/admin/categories/search").then(({ data }) => {
        this.categoryList = data.data;
      });
    },
    listTags() {
      this.axios.get("/api/admin/tags/search").then(({ data }) => {
        this.tagList = data.data;
      });
    }
  },
  watch: {
    type() {
      this.current = 1;
      this.listArticles();
    },
    categoryId() {
      this.current = 1;
      this.listArticles();
    },
    tagId() {
      this.current = 1;
      this.listArticles();
    },
    status() {
      this.current = 1;
      this.listArticles();
    },
    isDelete() {
      this.current = 1;
      this.listArticles();
    }
  },
  computed: {
    articleType() {
      return function(type) {
        var tagType = "";
        var name = "";
        switch (type) {
          case 1:
            tagType = "danger";
            name = this.$t("PublishArticles.original");
            break;
          case 2:
            tagType = "success";
            name = this.$t("PublishArticles.reprint");
            break;
          case 3:
            tagType = "primary";
            name = this.$t("PublishArticles.translate");
            break;
        }
        return {
          tagType: tagType,
          name: name
        };
      };
    },
    isActive() {
      return function(status) {
        return this.activeStatus == status ? "active-status" : "status";
      };
    }
  }
};
</script>

<style scoped>
.operation-container {
  margin-top: 1.5rem;
}
.article-status-menu {
  font-size: 14px;
  margin-top: 40px;
  color: #999;
}
.article-status-menu span {
  margin-right: 24px;
}
.status {
  cursor: pointer;
}
.active-status {
  cursor: pointer;
  color: #333;
  font-weight: bold;
}
.article-cover {
  position: relative;
  width: 100%;
  height: 90px;
  border-radius: 4px;
}
.article-cover::after {
  content: "";
  background: rgba(0, 0, 0, 0.3);
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.article-status-icon {
  color: #fff;
  font-size: 1.5rem;
  position: absolute;
  right: 1rem;
  bottom: 1.4rem;
}
</style>
