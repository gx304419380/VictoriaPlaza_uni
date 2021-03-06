<template>
  <qui-page ref="quiPage" :data-qui-theme="theme" @pageLoaded="handlePageLoaded" :header="false">
    <view class="content">
      <view class="view-content">
        <view class="tabBar">
          <qui-footer
            ref="footer-bar"
            @click="cut_index"
            :bottom="detectionModel() ? 20 : 0"
          ></qui-footer>
        </view>
        <!-- #ifdef H5 -->
        <qui-page-home-h5
          v-if="showHome"
          ref="home"
          :show-home="showHome"
          :footer-bar-height="footerBarHeight"
          :home-category-id="categoryId"
          :nav-theme="theme"
          :style="{ display: show_index === 0 ? 'block' : 'none' }"
          @handleClickShare="handleClickShare"
        ></qui-page-home-h5>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <qui-page-home
          v-if="showHome"
          ref="home"
          :nav-theme="theme"
          :home-category-id="categoryId"
          :style="{ display: show_index === 0 ? 'block' : 'none' }"
          @handleClickShare="handleClickShare"
        ></qui-page-home>
        <!-- #endif -->
        <qui-page-find
          ref="quifind"
          :nav-theme="theme"
          :style="{ display: show_index === 1 ? 'block' : 'none' }"
        ></qui-page-find>
        <qui-page-notice
          :nav-theme="theme"
          ref="quinotice"
          :style="{ display: show_index === 2 ? 'block' : 'none' }"
        ></qui-page-notice>
        <qui-page-my
          ref="quimy"
          :style="{ display: show_index === 3 ? 'block' : 'none' }"
        ></qui-page-my>
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <uni-popup ref="auth" type="bottom">
      <qui-auth @login="login" @close="close"></qui-auth>
    </uni-popup>
    <!-- #endif -->
  </qui-page>
</template>

<script>
import forums from '@/mixin/forums';
import user from '@/mixin/user';
import { mapState, mapMutations } from 'vuex';
import detectionModel from '@/mixin/detectionModel';
import loginModule from '@/mixin/loginModule';

export default {
  mixins: [forums, user, detectionModel, loginModule],
  data() {
    return {
      nowThreadId: 0, // 点击主题ID
      showHome: false,
      tagId: 0, // 标签ID
      categoryId: '',
      currentTab: 'home',
      footerBarHeight: 50,
    };
  },
  computed: {
    ...mapState({
      forumError: state => state.forum.error,
      footerIndex: state =>
        state.footerTab.footerIndex ? parseInt(state.footerTab.footerIndex, 10) : 0,
    }),
    loading() {
      return this.forumError.loading;
    },
    show_index: {
      get() {
        const index = this.$store.state.footerTab.footerIndex;
        return index;
      },
      set(index) {
        if (this.forums.set_site) {
          const title = [
            `${this.forums.set_site.site_name} - ${this.forums.set_site.site_title}`,
            this.i18n.t('home.find'),
            this.i18n.t('notice.notice'),
            this.i18n.t('profile.mine'),
          ];
          uni.setNavigationBarTitle({
            title: title[index],
          });
        }
      },
    },
  },
  mounted() {
    if (this.footerBarHeight !== (this.$refs['footer-bar']?.$el?.firstChild?.offsetHeight || 50)) {
      this.footerBarHeight = this.$refs['footer-bar']?.$el?.firstChild?.offsetHeight || 50;
      this.footerBarHeight = this.footerBarHeight ? this.footerBarHeight : 50;
    }
    // #ifdef MP-WEIXIN
    if (
      !this.$store.getters['session/get']('isLogin') &&
      this.forums &&
      this.forums.set_reg &&
      this.forums.set_reg.register_type === 2
    ) {
      uni.setStorageSync('isSend', true);
      uni.setStorageSync('register', 1);
      this.$refs.auth.open();
    }
    // #endif
  },
  onLoad(params) {
    this.categoryId = params.categoryId;
    // #ifdef MP-WEIXIN
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
    // #endif
    if (!this.loading && !this.showHome) {
      this.handlePageLoaded();
    }

    uni.$on('notiRead', () => {
      this.getUserInfo(true);
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (this.show_index === 0) {
      // uni.$emit('onpullDownRefresh');
      this.$refs.home.threads = [];
      this.$refs.home.isResetList = true;
      this.$refs.home.pageNum = 1;
      // #ifdef H5
      setTimeout(() => {
        this.$refs.home.clearScrollerData();
        this.$refs.home.loadThreadsSticky();
        this.$refs.home.loadThreads();
      }, 100);
      // #endif
      // #ifdef MP-WEIXIN
      this.$refs.home.loadThreadsSticky();
      this.$refs.home.loadThreads();
      // #endif
    }
    if (this.show_index === 1) {
      this.$refs.quinotice.dialogList = [];
      this.$refs.quinotice.pageNum = 1;
      this.$refs.quinotice.ontrueGetList();
    }
    if (this.show_index === 2) {
      this.$refs.quimy.refreshNum();
    }

    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 0);
  },
  // 监听页面滚动
  onPageScroll(event) {
    // h5不再由uni监听滚动
    // #ifndef H5
    this.$refs.home.scroll(event);
    // #endif
  },
  // 上拉加载
  onReachBottom() {
    // h5的到底加载不由uni控制
    // #ifndef H5
    this.$refs.home.pullDown();
    // #endif
  },
  // 唤起小程序原声分享
  onShareAppMessage(res) {
    // 来自页面内分享按钮
    if (res.from === 'button' && res.target.id !== 'top') {
      const threadShare = this.$store.getters['jv/get'](`/threads/${this.nowThreadId}`);
      return {
        title: threadShare.type === 1 ? threadShare.title : threadShare.firstPost.summaryText,
        path: `/topic/index?id=${this.nowThreadId}`,
      };
    }
    return {
      title: this.forums.set_site.site_name,
    };
  },
  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: this.forums.set_site.site_name,
      query: '',
    };
  },
  onShow() {
    // #ifdef H5
    this.restoreScrollPosition();
    // eslint-disable-next-line no-unused-expressions
    this.$refs.home && this.$refs.home.workFrolazyLoadThreads();
    // #endif
    // #ifdef MP-WEIXIN
    if (this.$refs.quiPage) {
      this.$store.dispatch('session/setAuth', this.$refs.quiPage.$refs.auth);
      // this.$refs.quiPage.open();
    }
    // #endif
    if (
      !this.$store.getters['session/get']('isLogin') &&
      ['quifind', 'quinotice', 'quimy'].indexOf(this.currentTab) >= 0
    ) {
      // uni.navigateTo({
      //   url: 'pages/home/index',
      // });
      return;
    }

    if (this.currentTab === 'quinotice' && this.$refs[this.currentTab]) {
      this.$nextTick(() => {
        this.$refs[this.currentTab].getUnreadNoticeNum();
      });
    }
    if (this.currentTab === 'quimy' && this.$refs[this.currentTab]) {
      this.$nextTick(() => {
        this.$refs[this.currentTab].refreshNum();
      });
    }
    // 其他页面返回
    if (this.forums.set_site) {
      const title = [
        `${this.forums.set_site.site_name} - ${this.forums.set_site.site_title}`,
        this.i18n.t('home.find'),
        this.i18n.t('notice.notice'),
        this.i18n.t('profile.mine'),
      ];
      uni.setNavigationBarTitle({
        title: title[this.show_index],
      });
    }
  },
  methods: {
    ...mapMutations({
      setFooterIndex: 'footerTab/SET_FOOTERINDEX',
    }),
    // 恢复虚拟滚动位置
    restoreScrollPosition() {
      const position = window.sessionStorage.getItem('virtual_scroll_top');
      if (position && this.$refs.home?.setScrollerTop) {
        this.$refs.home.setScrollerTop(position);
      }
    },
    // #ifdef MP-WEIXIN
    close() {
      this.$refs.auth.close();
    },
    login() {
      this.$refs.auth.close();
    },
    // #endif
    // 切换组件
    cut_index(e, type, isTabBar) {
      const tabs = ['home', 'quifind', 'quinotice', 'quimy'];
      uni.setStorage({
        key: 'page',
        data: '/pages/home/index',
      });
      if (type === 1) {
        this.setFooterIndex(1);
      }
      if (type === 0) {
        this.setFooterIndex(0);
        // #ifdef H5
        this.$nextTick(() => {
          this.restoreScrollPosition();
        });
        // #endif
      }
      this.currentTab = tabs[type];
	  
      if (
        !this.$store.getters['session/get']('isLogin') &&
        ['home', 'quinotice', 'quimy'].indexOf(this.currentTab) >= 0
      ) {
        // #ifdef MP-WEIXIN
        this.mpLoginMode();
        // #endif
        // #ifdef H5
        this.h5LoginMode();
        // #endif
        // this.currentTab = 'home';
        // this.setFooterIndex(0);
      }

      this.show_index = type;
      if (isTabBar.indexOf(type) === -1) {
        this.$refs[this.currentTab].ontrueGetList();
        isTabBar.push(type);
      }
    },
    // 点击分享事件
    handleClickShare(e) {
      this.nowThreadId = e;
    },
    handlePageLoaded() {
      this.showHome = true;
    },
  },
  onUnload() {
    uni.$off('notiRead');
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/base/variable/global.scss';
@import '@/styles/base/theme/fn.scss';
.view-content {
  width: 100%;
  height: calc(100vh - 120rpx);
}
.ioschoice {
  width: 100%;
  height: 100vh;
  padding-top: 240rpx;
}
.ioschoice-img {
  width: 140rpx;
  height: 140rpx;
  margin: 0 auto;
}
.ioschoice-img-icon {
  width: 100%;
  height: 100%;
}
.ioschoice-title {
  margin: 60rpx 0 20rpx;
  font-size: 34rpx;
  font-weight: bold;
  line-height: 45rpx;
  color: rgba(51, 51, 51, 1);
  text-align: center;
}
.ioschoice-content {
  font-size: 28rpx;
  font-weight: 400;
  line-height: 37rpx;
  color: rgba(170, 170, 170, 1);
  text-align: center;
}
.close-btn {
  width: 510rpx;
  height: 90rpx;
  margin: 50rpx auto 0;
  font-size: 28rpx;
  font-weight: 400;
  line-height: 90rpx;
  color: rgba(255, 255, 255, 1);
  text-align: center;
  background: rgba(24, 120, 243, 1);
  border: 2rpx solid 2px rgba(237, 237, 237, 1);
}
// my页面和notice页面样式渗透不进去的问题
/deep/ .my .cell-item,
/deep/ .notice-box .cell-item {
  padding-right: 40rpx;
}
/deep/ .no-border .cell-item {
  border: 0;
}
/deep/ .my-info__box__detail .cell-item__body {
  height: auto;
  align-items: flex-start;
}
/deep/ .my-tabs .qui-tabs__item--active:after {
  width: 0;
  height: 0;
}
/deep/ .my .qui-tabs__item__title {
  font-weight: normal;
  color: --color(--qui-FC-AAA);
}
/deep/ .my .qui-tabs__item__brief {
  font-weight: bold;
}
/deep/ .my-info__box__detail .cell-item__body__content-title {
  font-weight: bold;
}
</style>
