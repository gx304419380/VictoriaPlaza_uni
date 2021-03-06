<template>
  <qui-page :data-qui-theme="theme" class="profile">
    <view v-if="loaded">
      <view class="scroll-y">
        <view class="profile-info">
          <view class="profile-info__box">
            <view class="profile-info__box__detail">
              <qui-avatar :user="userInfo" :is-real="userInfo.isReal" />
              <qui-cell-item
                :title="userInfo.username || ''"
                slot-right
                :brief="userInfo.groupsName"
                :border="false"
                class="my-info__box__detail-username"
              >
                <view v-if="userId != currentLoginId">
                  <view
                    class="profile-info__box__detail-operate"
                    @tap="chat"
                    v-if="can_create_dialog"
                  >
                    <qui-icon
                      class="text"
                      name="icon-message1"
                      size="24"
                      :color="themeColor"
                    ></qui-icon>
                    <text>{{ i18n.t('profile.privateMessage') }}</text>
                  </view>
                  <!-- follow 关注状态 0：未关注 1：已关注 2：互相关注 -->
                  <view
                    class="profile-info__box__detail-operate"
                    @tap="userInfo.follow == 0 ? addFollow(userInfo) : deleteFollow(userInfo)"
                  >
                    <qui-icon
                      class="text"
                      :name="userInfo.follow == 0 ? 'icon-follow' : 'icon-each-follow'"
                      size="28"
                      :color="
                        userInfo.follow == 0
                          ? '#777'
                          : userInfo.follow == 1
                          ? themeColor
                          : '#ff8888'
                      "
                    ></qui-icon>
                    <text>
                      {{
                        userInfo.follow == 0
                          ? i18n.t('profile.following')
                          : userInfo.follow == 1
                          ? i18n.t('profile.followed')
                          : i18n.t('profile.mutualfollow')
                      }}
                    </text>
                  </view>
                </view>
              </qui-cell-item>
            </view>
          </view>
          <view class="profile-info__introduction" v-if="userInfo.signature">
            {{ userInfo.signature }}
          </view>
        </view>
        <view class="profile-tabs">
          <qui-tabs
            :current="current"
            :values="items"
            @clickItem="onClickItem"
            :brief="true"
          ></qui-tabs>
          <view
            class="profile-tabs__content"
            :style="
              current === 1 &&
              forums.other &&
              forums.other.can_create_thread_question &&
              userInfo &&
              userInfo.canBeAsked
                ? ''
                : 'paddingTop: 30rpx'
            "
          >
            <view
              class="answer"
              @click="handleAnswer(userInfo)"
              v-if="
                current === 1 &&
                  forums.other &&
                  forums.other.can_create_thread_question &&
                  userInfo &&
                  userInfo.canBeAsked
              "
            >
              <img src="/static/myask.svg" class="ask" />
              {{ i18n.t('profile.askHim') }}
            </view>
            <view v-if="current == 0" class="items">
              <topic
                :user-id="userId"
                @changeFollow="changeFollow"
                ref="topic"
                @handleClickShare="handleClickShare"
              ></topic>
            </view>
            <view v-else-if="current == 1" class="items">
              <question
                :user-id="userId"
                @changeFollow="changeFollow"
                ref="question"
                @handleClickShare="handleClickShare"
              ></question>
            </view>
            <view v-else-if="current == 2" class="items">
              <following :user-id="userId" @changeFollow="changeFollow" ref="following"></following>
            </view>
            <view v-else-if="current == 3" class="items">
              <followers :user-id="userId" ref="followers" @changeFollow="changeFollow"></followers>
            </view>
            <view v-else class="items">
              <like
                :user-id="userId"
                @changeFollow="changeFollow"
                ref="like"
                @handleClickShare="handleClickShare"
              ></like>
            </view>
          </view>
        </view>
      </view>
    </view>
    <qui-page-message v-else-if="loaded === false"></qui-page-message>
  </qui-page>
</template>

<script>
import { status } from '@/library/jsonapi-vuex/index';
import forums from '@/mixin/forums';
import loginModule from '@/mixin/loginModule';
import { getCurUrl } from '@/utils/getCurUrl';
import { mapState } from 'vuex';
import topic from './topic';
import following from './following';
import followers from './followers';
import like from './like';
import question from './question';

export default {
  components: {
    topic,
    following,
    followers,
    like,
    question,
  },
  mixins: [forums, loginModule],
  props: {
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      items: [
        { title: this.i18n.t('profile.topic'), brief: '0' },
        { title: this.i18n.t('profile.questionAndAnswer'), brief: '0' },
        { title: this.i18n.t('profile.following'), brief: '0' },
        { title: this.i18n.t('profile.followers'), brief: '0' },
        { title: this.i18n.t('profile.likes'), brief: '0' },
      ],
      userId: 0,
      currentLoginId: this.$store.getters['session/get']('userId'),
      current: 0,
      nowThreadId: '',
      userInfo: '',
      can_create_dialog: false,
      dialogId: 0, // 会话id
      loaded: true, // 用户数据是否请求成功
    };
  },
  computed: {
    themeColor() {
      return this.theme === this.$u.light() ? '#333' : '#fff'; // 用于图标色
    },
    ...mapState({
      getCategoryId: state => state.session.categoryId,
      getCategoryIndex: state => state.session.categoryIndex,
      footerIndex: state =>
        state.footerTab.footerIndex ? parseInt(state.footerTab.footerIndex, 10) : 0,
    }),
  },
  onLoad(params) {
    // 区分是自己的主页还是别人的主页
    const { userId, current } = params;
    this.userId = userId || this.currentLoginId;
    this.current = parseInt(current, 10) || 0;
    this.getAuth();
    // #ifdef MP-WEIXIN
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
    // #endif
  },
  onPullDownRefresh() {
    const item = ['topic', 'question', 'following', 'followers', 'like'];
    const { current } = this;
    if (!this.$refs[item[current]]) {
      return;
    }
    this.$refs[item[current]].pullDownRefresh();
  },
  onReachBottom() {
    const { current } = this;
    const item = ['topic', 'question', 'following', 'followers', 'like'];
    this.$refs[item[current]].pullDown();
  },
  // 解决左上角返回数据不刷新情况
  onShow() {
    this.getUserInfo(this.userId);
    if (this.$refs.topic) this.$refs.topic.uploadItem();
    if (this.$refs.like) this.$refs.like.uploadItem();
  },
  // 唤起小程序原声分享（微信）
  onShareAppMessage(res) {
    // 来自页面内分享按钮
    if (res.from === 'button') {
      const threadShare = this.$store.getters['jv/get'](`/threads/${this.nowThreadId}`);
      return {
        title: threadShare.type === 1 ? threadShare.title : threadShare.firstPost.summaryText,
        path: `/topic/index?id=${this.nowThreadId}`,
      };
    }
  },
  // 分享到朋友圈
  onShareTimeline() {
    console.log(`current=${this.current}&userId=${this.userId}`, '9999999');
    console.log(this.loaded, 'loadedloadedloaded');
    return {
      title: this.forums.set_site.site_name,
      query: `current=${this.current}&userId=${this.userId}`,
    };
  },
  methods: {
    onClickItem(e) {
      if (e.currentIndex !== this.current) {
        this.current = e.currentIndex;
      }
    },
    getAuth() {
      // 用户组等改变会改变私信权限
      const params = {
        include: 'users',
      };
      this.$store.dispatch('jv/get', [`forum`, { params }]).then(res => {
        if (res.other && res.other.can_create_dialog) {
          this.can_create_dialog = true;
        } else {
          this.can_create_dialog = false;
        }
      });
    },
    // 获取用户信息
    getUserInfo(userId) {
      const params = {
        include: ['groups', 'dialog'],
      };
      this.$store
        .dispatch('jv/get', [`users/${userId}`, { params }])
        .then(res => {
          if (res.isDeleted) {
            this.$store.dispatch('forum/setError', {
              code: 'user_deleted',
              status: 500,
            });
            this.loaded = false;
          } else {
            this.loaded = true;
            this.dialogId = res.dialog ? res.dialog._jv.id : 0;
            let groups = [];
            if (res.groups && res.groups.length > 0) {
              groups = res.groups.filter(item => item.isDisplay);
            }
            if (groups.length > 0) {
              res.groupsName = groups[0].name;
            } else {
              res.groupsName = '';
            }
            this.setNum(res);
            this.userInfo = res;
            uni.setNavigationBarTitle({
              title: `${res.username}${this.i18n.t('profile.personalhomepage')} - ${
                this.forums.set_site.site_name
              }`,
            });
          }
        })
        .catch(err => {
          this.loaded = false;
          if (err.statusCode === 404) {
            this.$store.dispatch('forum/setError', {
              code: 'user_deleted',
              status: 500,
            });
          }
        });
    },
    // 设置粉丝点赞那些数字
    setNum(res) {
      this.items[0].brief = res.threadCount || 0;
      this.items[1].brief = res.questionCount || 0;
      this.items[2].brief = res.followCount || 0;
      this.items[3].brief = res.fansCount || 0;
      this.items[4].brief = res.likedCount || 0;
    },
    // 添加关注
    addFollow(userInfo) {
      if (!this.$store.getters['session/get']('isLogin')) {
        uni.setStorage({
          key: 'page',
          data: getCurUrl(),
        });
        // #ifdef MP-WEIXIN
        this.mpLoginMode();
        // #endif
        // #ifdef H5
        this.h5LoginMode();
        // #endif
      }
      const params = {
        _jv: {
          type: 'follow',
        },
        type: 'user_follow',
        to_user_id: userInfo.id,
      };
      status
        .run(() => this.$store.dispatch('jv/post', params))
        .then(() => {
          this.getUserInfo(this.userId);
          if (this.$refs.followers) this.$refs.followers.getFollowerList('change');
        });
    },
    // 取消关注
    deleteFollow(userInfo) {
      if (!this.$store.getters['session/get']('isLogin')) {
        uni.setStorage({
          key: 'page',
          data: getCurUrl(),
        });
        // #ifdef MP-WEIXIN
        this.mpLoginMode();
        // #endif
        // #ifdef H5
        this.h5LoginMode();
        // #endif
      }
      this.$store.dispatch('jv/delete', `follow/${userInfo.id}/1`).then(() => {
        this.getUserInfo(this.userId);
        if (this.$refs.followers) this.$refs.followers.getFollowerList('change');
      });
    },
    changeFollow(e) {
      this.getUserInfo(e.userId);
    },
    // 点击分享事件
    handleClickShare(e) {
      this.nowThreadId = e;
    },
    // 点击跳转提问发布页
    handleAnswer(userInfo) {
      console.log(userInfo, 'userInfouserInfo');
      uni.navigateTo({
        url: `/topic/post?type=5&categoryId=${this.getCategoryId}&categoryIndex=${this.getCategoryIndex}`,
      });
      setTimeout(() => {
        if (userInfo) {
          uni.$emit('radioChange', userInfo);
        }
      }, 1000);
    },
    // 私信跳转到聊天页面（传入用户名和会话id）
    chat() {
      uni.navigateTo({
        url: `/pages/notice/msglist?username=${this.userInfo.username}&dialogId=${this.dialogId}`,
      });
    },
  },
  onUnload() {
    this.$store.dispatch('forum/setError', { loading: false });
  },
};
</script>
<style lang="scss">
@import '@/styles/base/variable/global.scss';
@import '@/styles/base/theme/fn.scss';

.profile {
  /deep/ .qui-tabs__item__brief {
    font-weight: bold;
  }
}
.profile-info {
  padding: 40rpx;
  padding-top: 30rpx;
  font-size: $fg-f4;
  background: --color(--qui-BG-2);
}
.profile-info__box {
  display: flex;
  justify-content: space-between;
}
.profile-info__introduction {
  margin-top: 40rpx;
  color: --color(--qui-FC-333);
  word-break: break-all;
  transition: $switch-theme-time;
}
.profile-info__box__detail {
  position: relative;
  display: flex;
  flex-direction: row;
  width: 100%;
  font-size: $fg-f4;
  box-sizing: border-box;
}
.my-info__box__detail-username {
  width: 100%;
  padding-left: 20rpx;
}
.profile-info__box__detail /deep/ .cell-item__body {
  height: auto;
  align-items: flex-start;
}
.profile-info__box__detail /deep/ .cell-item__body__content-title {
  font-weight: bold;
}
.profile-info__box__detail-operate {
  display: inline-block;
  margin-left: 42rpx;
  color: --color(--qui-FC-333);
  .qui-icon {
    margin-right: 12rpx;
  }
}
.profile-tabs__content {
  // padding-top: 30rpx;
  .items {
    background: --color(--qui-BG-1);
  }
  .answer {
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    width: 710rpx;
    height: 80rpx;
    margin: 30rpx 20rpx 31rpx;
    font-size: $fg-f3;
    font-weight: 800;
    line-height: 80rpx;
    background: --color(--qui-FC-FFF);
    border-radius: 6rpx;
    box-shadow: 0rpx 4rpx 8rpx rgba(0, 0, 0, 0.05);
  }
  .ask {
    width: 37rpx;
    height: 37rpx;
    padding-right: 19rpx;
  }
}
/deep/ .qui-tabs {
  background: --color(--qui-BG-2);
}
.scroll-y {
  max-height: 100vh;
}
</style>
