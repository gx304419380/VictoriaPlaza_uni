<template>
  <view class="question">
    <qui-thread-item
      v-for="(item, index) in data"
      :key="index"
      :currentindex="index"
      :thread="item"
      @toTopic="toTopic"
      @greatCallBack="greatCallBack"
      @handleClickShare="handleClickShare"
    ></qui-thread-item>
    <qui-load-more :status="loadingType" :show-icon="false" v-if="loadingType"></qui-load-more>
  </view>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index';

export default {
  props: {
    userId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      loadingType: '',
      data: [],
      pageSize: 20,
      pageNum: 1, // 当前页数
      editThreadId: '',
      currentLoginId: this.$store.getters['session/get']('userId'),
    };
  },
  created() {
    // 详情页删除主题时
    this.$u.event.$on('deleteThread', data => {
      this.data.forEach((item, index) => {
        if (item._jv.id === data) {
          this.data.splice(index, 1);
        }
      });
    });
  },
  mounted() {
    this.loadThreads();
  },
  destroyed() {
    this.$u.event.$off('deleteThread');
  },
  methods: {
    handleClickShare(id) {
      this.$emit('handleClickShare', id);
    },
    pullDownRefresh() {
      this.pageNum = 1;
      this.data = [];
      this.loadThreads('pullDownRefresh');
    },
    // 加载当前主题数据
    loadThreads(type) {
      this.loadingType = 'loading';
      const params = {
        'filter[isDeleted]': 'no',
        include: [
          'user',
          'user.groups',
          'firstPost',
          'firstPost.images',
          'category',
          'threadVideo',
          'question',
          'question.beUser',
          'question.beUser.groups',
        ],
        'page[number]': this.pageNum,
        'page[limit]': this.pageSize,
        'filter[isApproved]': 1,
        'filter[userId]': this.userId,
        'filter[type]': 5,
        'filter[answer]': 'yes',
      };
      status
        .run(() => this.$store.dispatch('jv/get', ['threads', { params }]))
        .then(res => {
          if (res._jv) {
            delete res._jv;
          }
          this.loadingType = res.length === this.pageSize ? 'more' : 'nomore';
          this.data = [...this.data, ...res];
          if (type && type === 'pullDownRefresh') {
            uni.stopPullDownRefresh();
          }
        });
    },
    toTopic(id) {
      this.editThreadId = id;
    },
    greatCallBack() {
      if (this.currentLoginId === this.userId) {
        this.$emit('changeFollow', { userId: this.userId });
      }
    },
    // 下拉加载
    pullDown() {
      if (this.loadingType !== 'more') {
        return;
      }
      this.pageNum += 1;
      this.loadThreads();
    },
    uploadItem() {
      if (!this.editThreadId) {
        return;
      }
      const item = this.$store.getters['jv/get'](`threads/${this.editThreadId}`);
      this.data.forEach((data, index) => {
        if (data._jv.id === this.editThreadId) {
          this.editThreadId = '';
          this.$set(this.data, index, item);
        }
      });
    },
  },
};
</script>
<style lang="scss">
.question {
  margin-top: -20rpx;
}
</style>
