<template>
  <qui-page :data-qui-theme="theme" :header="false"></qui-page>
</template>
<script>
import user from '@/mixin/user';
import forums from '@/mixin/forums';
import appCommonH from '@/utils/commonHelper';
import loginModule from '@/mixin/loginModule';
import { SITE_PAY } from '@/common/const';

export default {
  mixins: [user, forums, appCommonH, loginModule],
  data() {
    return {
      state: true,
    };
  },
  onLoad(params) {
    // #ifdef H5
    this.wxLogin(params);
    // #endif
  },
  methods: {
    wxLogin(data) {
      this.$store
        .dispatch('session/noSenseh5Login', data)
        .then(res => {
          console.log(res, this.forums, '注册');
          if (
            this.forums &&
            this.forums.set_site &&
            this.forums.set_site.open_ext_fields === '1' &&
            res &&
            res.new_user
          ) {
            this.jump2RegisterExtendPage();
            return;
          }
          if (res && res.data && res.data.data && res.data.data.id) {
            this.logind();
            if (
              this.forums &&
              this.forums.set_site &&
              this.forums.set_site.site_mode !== SITE_PAY
            ) {
              uni.getStorage({
                key: 'page',
                success(resData) {
                  uni.redirectTo({
                    url: resData.data,
                  });
                },
              });
              const isBind = uni.getStorageSync('isBind');
              if (isBind) {
                uni.showToast({
                  title: '绑定成功',
                  duration: 2000,
                });
              } else {
                uni.showToast({
                  title: '登录成功',
                  duration: 2000,
                });
              }
            } else if (
              this.forums &&
              this.forums.set_site &&
              this.forums.set_site.site_mode === SITE_PAY &&
              this.user &&
              !this.user.paid
            ) {
              uni.redirectTo({
                url: '/pages/site/info',
              });
              const isBind = uni.getStorageSync('isBind');
              if (isBind) {
                uni.showToast({
                  title: '绑定成功',
                  duration: 2000,
                });
              } else {
                uni.showToast({
                  title: '登录成功',
                  duration: 2000,
                });
              }
            }
            return;
          }
          if (res && res.data && res.data.errors) {
            if (res.data.errors[0].code === 'no_bind_user') {
              const userInfo = {
                headimgurl: res.data.errors[0].user.headimgurl,
                username: res.data.errors[0].user.nickname,
              };
              uni.setStorageSync('token', res.data.errors[0].token);
              uni.setStorageSync('userInfo', userInfo);
              uni.setStorageSync('isBind', true);
              this.jump2RegisterBindPage();
            }
            if (res.data.errors[0].code === 'permission_denied') {
              this.login();
            }
            if (res.data.errors[0].code === 'register_validate') {
              uni.showToast({
                icon: 'none',
                title: this.i18n.t('core.register_validate'),
                duration: 2000,
              });
            }
            if (res.data.errors[0].code === 'validate_reject') {
              uni.showToast({
                icon: 'none',
                title: this.i18n.t('core.validate_reject'),
                duration: 2000,
              });
            }
            if (res.data.errors[0].code === 'register_close') {
              uni.showToast({
                icon: 'none',
                title: this.i18n.t('core.register_close'),
                duration: 2000,
              });
            }
            if (res.data.errors[0].code === 'ban_user') {
              uni.showToast({
                icon: 'none',
                title: this.i18n.t('core.ban_user'),
                duration: 2000,
              });
            }
            if (res.data.errors[0].code === 'account_has_been_bound') {
              uni.getStorage({
                key: 'page',
                success(resData) {
                  uni.redirectTo({
                    url: resData.data,
                  });
                  setTimeout(() => {
                    uni.showToast({
                      icon: 'none',
                      title: '用户或微信已绑定',
                      duration: 2000,
                    });
                  }, 1000);
                },
              });
            }
            if (res.data.errors[0].code === 'rebind_mp_wechat') {
              uni.setStorageSync('token', res.data.errors[0].token);
              uni.redirectTo({
                url: '/pages/user/login-bind',
              });
            }
          }
          // 默认兜底
          uni.redirectTo({
            url: '/',
          });
          setTimeout(() => {
            uni.showToast({
              icon: 'none',
              title: `未知错误${res.data.errors[0].code}`,
              duration: 2000,
            });
          }, 500);
        })
        .catch(err => {
          uni.redirectTo({
            url: '/',
          });
          setTimeout(() => {
            uni.showToast({
              icon: 'none',
              title: err.message,
              duration: 2000,
            });
          }, 500);
        });
    },
  },
};
</script>
