<!--**
 * forked from：https://github.com/F-loat/mpvue-wxParse
 *
 * github地址: https://github.com/dcloudio/uParse
 *
 * for: uni-app框架下 富文本解析
 *
 * 优化 by zhiqiang.feng@qq.com
 */-->
<!--eslint-disable -->
<template>
  <!--基础元素-->
  <view class="wxParse" :class="className" :style="'user-select:' + userSelect">
    <block v-for="(node, index) of nodes" :key="index" v-if="!loading">
      <wxParseTemplate :node="node" />
    </block>
  </view>
</template>

<script>
import HtmlToJson from './libs/html2json';
import wxParseTemplate from './components/wxParseTemplate0';

export default {
  /* eslint-disable */
  name: 'wxParse',
  props: {
    // user-select:none;
    userSelect: {
      type: String,
      default: 'text', //none |text| all | element
    },
    imgOptions: {
      type: [Object, Boolean],
      default: function () {
        return {
          loop: false,
          indicator: 'number',
          longPressActions: false,
          // longPressActions: {
          // 	 itemList: ['发送给朋友', '保存图片', '收藏'],
          // 		success: function (res) {
          // 			console.log('选中了第' + (res.tapIndex + 1) + '个按钮');
          // 		},
          // 		fail: function (res) {
          // 			console.log(res.errMsg);
          // 		}
          // 	}
          // }
        };
      },
    },
    loading: {
      type: Boolean,
      default: false,
    },
    className: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    contentParse: {
      type: Object,
      default: null,
    },
    noData: {
      type: String,
      default: '',
    },
    startHandler: {
      type: Function,
      default() {
        return (node) => {
          node.attr.class = null;
          node.attr.style = null;
        };
      },
    },
    endHandler: {
      type: Function,
      default() {
        return (node) => {
          node = node;
        };
      },
    },
    charsHandler: {
      type: Function,
      default() {
        return (node) => {
          node = node;
        };
      },
    },
    imageProp: {
      type: Object,
      default() {
        return {
          mode: 'aspectFit',
          padding: 0,
          lazyLoad: false,
          domain: '',
        };
      },
    },
  },
  components: {
    wxParseTemplate,
  },
  data() {
    return {
      nodes: [],
      imageUrls: [],
      wxParseWidth: {
        value: 0,
      },
    };
  },
  computed: {},
  mounted() {
    this.setHtml();
  },
  methods: {
    setHtml() {
      this.getWidth().then((data) => {
        this.wxParseWidth.value = data;
      });
      let {
        contentParse,
        content,
        noData,
        imageProp,
        startHandler,
        endHandler,
        charsHandler,
      } = this;
      // 之前已经对内容进行解析，直接使用
      if (contentParse) {
        this.imageUrls = contentParse.imageUrls;
        this.nodes = contentParse.nodes;
      } else {
        let parseData = content || noData;
        let customHandler = {
          start: startHandler,
          end: endHandler,
          chars: charsHandler,
        };
        let results = HtmlToJson(parseData, customHandler, imageProp, this);
        this.imageUrls = results.imageUrls;

        this.nodes = [];
        results.nodes.forEach((item) => {
          // setTimeout(() => {
          if (item.node) {
            this.nodes.push(item);
          }
          // }, 0);
        });
      }
    },
    getWidth() {
      return new Promise((res, rej) => {
        // #ifndef MP-ALIPAY || MP-BAIDU
        uni
          .createSelectorQuery()
          .in(this)
          .select('.wxParse')
          .fields(
            {
              size: true,
              scrollOffset: true,
            },
            (data) => {
              res(data.width);
            },
          )
          .exec();
        // #endif
        // #ifdef MP-BAIDU
        const query = swan.createSelectorQuery();
        query.select('.wxParse').boundingClientRect();
        query.exec((obj) => {
          const rect = obj[0];
          if (rect) {
            res(rect.width);
          }
        });
        // #endif
        // #ifdef MP-ALIPAY
        my.createSelectorQuery()
          .select('.wxParse')
          .boundingClientRect()
          .exec((ret) => {
            res(ret[0].width);
          });
        // #endif
      });
    },
    navigate(href, $event, attr) {
      this.$emit('navigate', href, $event);
    },

    tmlDecodeByRegExp: function (str) {
      let s = '';

      if (str.length == 0) return '';

      s = str.replace(/&amp;/g, '&');

      s = s.replace(/&lt;/g, '<');

      s = s.replace(/&gt;/g, '>');

      s = s.replace(/&nbsp;/g, ' ');

      s = s.replace(/'/g, "'");

      s = s.replace(/"/g, '"');

      return s;
    },
    
    preview(src, $event) {
      let current = 0;
      const imageUrls = this.imageUrls.map((img, index) => {
        if (this.tmlDecodeByRegExp(img.src) === src) {
          current = index;
        }
        return img.imgUrl;
      });
      if (!this.imageUrls.length || typeof this.imgOptions === 'boolean') {
      } else {
        uni.previewImage({
          current,
          urls: imageUrls,
          loop: this.imgOptions.loop,
          indicator: this.imgOptions.indicator,
          longPressActions: this.imgOptions.longPressActions,
        });
      }
      this.$emit('preview', src, $event);
    },
    removeImageUrl(src) {
      let current = 0;
      this.imageUrls.forEach((img, index) => {
        if (img.src === src) {
          current = index;
        }
      });

      this.imageUrls.splice(current, 1);
    },
  },
  // 父组件中提供
  provide() {
    return {
      parseWidth: this.wxParseWidth,
      parseSelect: this.userSelect,
      // 提示：provide 和 inject 绑定并不是可响应的。这是刻意为之的。然而，如果你传入了一个可监听的对象，那么其对象的属性还是可响应的。
    };
  },
  watch: {
    content(val) {
      this.setHtml();
    },
    // content: {
    // 	handler: function(newVal, oldVal) {
    // 		if (newVal !== oldVal) {
    //
    // 		}
    // 	},
    // 	deep: true
    // }
  },
};
</script>
