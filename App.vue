<script>
/* eslint-disable */
import '@/common/stat';
import { SITE_PAY, STORGE_GET_USER_TIME } from '@/common/const';
import Vue from 'vue';

const themeListeners = [];
// 不需要检验付费的页面，避免付费模式直接跳到付费页面
const pageItem = [
  'pages/site/partner-invite',
  'pages/user/login',
  'pages/user/register',
  'pages/user/phone-login-register',
];

export default {
  data() {
    return {
      statisticsCode: '', // 统计代码
    };
  },
  globalData: {
    // #ifdef H5
    appLoadedStatus: false,
    // #endif
    themeChanged(theme) {
      Vue.prototype.$u.currentTheme = theme;
      themeListeners.forEach(listener => {
        listener(theme);
      });
      uni.setStorage({
        key: 'theme',
        data: theme,
      });
    },
    watchThemeChange(listener) {
      if (themeListeners.indexOf(listener) < 0) {
        themeListeners.push(listener);
      }
    },
    unWatchThemeChange(listener) {
      const index = themeListeners.indexOf(listener);
      if (index > -1) {
        themeListeners.splice(index, 1);
      }
    },
	
	formatDate(date) {
	  let now = new Date();
	  let m = date.getMonth();
	  let d = date.getDate();
	  let h = date.getHours();
	  let M = date.getMinutes();
	
	  if (m === now.getMonth() && d === now.getDate()) {
	    return "今天 " + h + "点" + M + "分";
	  }
	
	  now.setDate(now.getDate() + 1);
	
	  if (m === now.getMonth() && d === now.getDate()) {
	    return "明天 " + h + "点" + M + "分";
	  }
	
	  return m + 1 + "月" + d + "日 " + h + "点" + M + "分";
	},
	getDate(date, plusDay) {
	  if (!date) {
	    date = new Date();
	  }
	
	  if (plusDay) {
	    date.setDate(date.getDate() + plusDay);
	  }
	
	  let month = date.getMonth() + 1;
	  let strDate = date.getDate();
	
	  if (month >= 1 && month <= 9) {
	    month = "0" + month;
	  }
	
	  if (strDate >= 0 && strDate <= 9) {
	    strDate = "0" + strDate;
	  }
	
	  return date.getFullYear() + '-' + month + '-' + strDate;
	},
	getTime(date) {
	  if (!date) {
	    date = new Date();
	  }
	
	  let hour = date.getHours();
	  let minute = date.getMinutes();
	  hour = hour < 10 ? '0' + hour : hour;
	  minute = minute < 10 ? '0' + minute : minute;
	  return hour + ":" + minute;
	},
	clearCarCache() {
		uni.removeStorageSync("人叫车");
		uni.removeStorageSync("车叫人");
		uni.removeStorageSync("沟通历史");
		uni.removeStorageSync("我发布的");
		uni.removeStorageSync("人叫车_page");
		uni.removeStorageSync("车叫人_page");
		uni.removeStorageSync("沟通历史_page");
		uni.removeStorageSync("我发布的_page");
		uni.removeStorageSync("人叫车_hasMore");
		uni.removeStorageSync("车叫人_hasMore");
		uni.removeStorageSync("沟通历史_hasMore");
		uni.removeStorageSync("我发布的_hasMore");
	}
  },
  async onLaunch() {
    const init = async () => {
      const forums = await this.$store.dispatch('jv/get', [
        'forum',
        {
          params: {
            include: 'users',
          },
        },
      ]);
      const userId = this.$store.getters['session/get']('userId');
      let user = {};
      if (userId) {
        const params = {
          include: 'groups,wechat',
        };
        user = await this.$store.dispatch('jv/get', [`users/${userId}`, { params }]);
        uni.setStorageSync(STORGE_GET_USER_TIME, new Date().getTime());
      }
      this.statisticsCode = forums.set_site.site_stat;
      uni.$emit('stat', {
        statisticsCode: this.statisticsCode,
      });
      let currentPage = {};
      const pages = getCurrentPages();
      if (pages.length > 0) {
        currentPage = pages[pages.length - 1];
      }
      if (forums.set_site.site_mode === SITE_PAY) {
        // #ifndef H5
        const res = uni.getSystemInfoSync();
        if (res.platform === 'ios') {
          this.$store.dispatch('forum/setError', { loading: false, code: 'dataerro' });
          return;
        }
        // #endif
        if (pages.length > 0) {
          currentPage = pages[pages.length - 1];
          if (currentPage.route === 'pages/user/pc-login') {
            uni.redirectTo({
              url: currentPage.__page__.fullPath,
            });
            return;
          }
          if (currentPage.route === 'pages/user/pc-relation') {
            uni.redirectTo({
              url: currentPage.__page__.fullPath,
            });
            return;
          }
          if (
            !user.paid &&
            currentPage.route !== 'pages/site/info' &&
            pageItem.indexOf(currentPage.route) === -1
          ) {
            uni.redirectTo({
              url: '/pages/site/info',
            });
          }
          // 站点付费
        } else if (!user.paid) {
          // 在这里会导致一个问题，当进入user/wechat中的时候，会因为这里先执行了跳转，导致进入了user/wechat后，因为这里产生了跳转，导致user/wechat无法正常执行onload，导致无法验证用户的登录状态。
          if (uni.getStorageSync('oauth_wechat') !== 1 && uni.getStorageSync('h5_wechat_login') !== 1) {
            uni.redirectTo({
              url: '/pages/site/info',
            });
          }
        }
      }
      // #ifdef H5
      this.globalData.appLoadedStatus = true;
      uni.$emit('apploaded');
      // #endif
      if (!this.$store.state.forum.error.code) {
        this.$store.dispatch('forum/setError', { loading: false });
      }
    };
    try {
      await init();
    } catch (errs) {
      if (errs && errs.data && errs.data.errors) {
        if (errs.data.errors[0].code === 'access_denied') {
          this.$store.dispatch('session/logout').then(init);
        } else {
          this.$store.dispatch('forum/setError', {
            loading: false,
            ...errs.data.errors[0],
          });
        }
      }
    }
  },

  onShow(options) {
    // 解决各类回调的兼容问题,验证码捕获captchaResult
    // #ifdef MP-WEIXIN
    if (!this.captchaTicketExpire) this.captchaTicketExpire = {};
    if (options.scene === 1038 && options.referrerInfo.appId === 'wx5a3a7366fd07e119') {
      const result = options.referrerInfo.extraData;
      if (result && result.ret === 0) {
        const theTicket = result.ticket;
        if (!this.captchaTicketExpire[theTicket]) {
          this.captchaTicketExpire[theTicket] = true;
          this.$u.event.$emit('captchaResult', result);
        }
      } else {
        this.$u.event.$emit('closeChaReault', result);
        // 用户关闭了验证码
      }
    }
    // #endif
  },
  onHide() {},
  onPageNotFound(e) {
    let url = '/pages/common/error';
    if (/^\/thread\/\d+$/i.test(e.path)) {
      const matchs = e.path.match(/^\/thread\/(\d+)$/i);
      url = `/topic/index?id=${matchs[1]}`;
    } else if (/^\/user\/\d+$/i.test(e.path)) {
      const matchs = e.path.match(/^\/user\/(\d+)$/i);
      url = `/pages/profile/index?userId=${matchs[1]}`;
    } else if (e.path === '/site/partner-invite' && e.query.code) {
      url = `/pages/site/partner-invite?code=${e.query.code}`;
    } else if (/^\/category\/\d+$/i.test(e.path)) {
      const matchs = e.path.match(/^\/category\/(\d+)$/i);
      url = `/?categoryId=${matchs[1]}`;
    } else if (/^\/topic\/\d+$/i.test(e.path)) {
      const matchs = e.path.match(/^\/topic\/(\d+)$/i);
      url = `/pages/topic/content?id=${matchs[1]}`;
    }

    uni.redirectTo({ url });
  },
};
</script>

<style lang="scss">
/* 每个页面公共css */
@import '@/styles/base/reset.scss';
</style>
