/**
 * 项目中定义的常量
 * 开发|测试：.env.development
 * 正式：.env.producment
 */

export const VERSION = '2.2.210107';

export const DISCUZ_TITLE = "维湾广场";

let host = "https://114.215.191.135/";

// #ifdef H5
if(process.env.NODE_ENV !== 'development'){
    host = `${window.location.origin}/`;
}
// #endif

export const DISCUZ_REQUEST_HOST = host;

/**
 * cookie 相关
 */
// 存储到 cookie 中的当前语言 key 值
export const COOKIE_CURRENT_LANGUAGE = '__discuzq_lang';
export const STORGE_GET_USER_TIME = '__discuzq_getusertime';

/**
 * 主题
 */
export const THEME_DEFAULT = 'light';
export const THEME_DARK = 'dark';

/**
 * 语言
 */
export const LANG_ZH = 'zh';
export const LANG_EN = 'en';

export const SITE_PAY = 'pay';
