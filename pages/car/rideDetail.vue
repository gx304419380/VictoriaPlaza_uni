<template>
<view>
    <view>
        <map id="myMap" style="width: 100%; height: 230px;" :latitude="latitude" :longitude="longitude" :markers="markers" show-location scale="11"></map>
    </view>

    <view class="weui-form-preview">
        <view class="weui-form-preview__bd">
            <view class="weui-form-preview__item line-style">
                <label class="weui-form-preview__label">方向</label>
                <text class="weui-form-preview__value">{{order.direction===0?'回家':'外出'}}</text>
            </view>

            <view class="weui-form-preview__item line-style">
                <label class="weui-form-preview__label">地址</label>
                <text class="weui-form-preview__value">{{order.location}}</text>
            </view>

            <view class="weui-form-preview__item line-style">
                <label class="weui-form-preview__label">地名</label>
                <text class="weui-form-preview__value">{{order.direction===0?order.startAddress.name:order.endAddress.name}}</text>
            </view>

            <view class="weui-form-preview__item line-style">
                <label class="weui-form-preview__label">时间</label>
                <text class="weui-form-preview__value">{{order.formatTime}}</text>
            </view>

            <view class="weui-form-preview__item line-style">
                <label class="weui-form-preview__label">电话</label>
                <text class="weui-form-preview__value">{{order.phone}}</text>
            </view>

            <view class="weui-form-preview__item line-style">
                <label class="weui-form-preview__label">名称</label>
                <text class="weui-form-preview__value">{{order.username}}</text>
            </view>

            <view class="weui-form-preview__item line-style content-style">
                <label class="weui-form-preview__label">备注</label>
                <text class="weui-form-preview__value line-content">{{order.content}}</text>
            </view>
        </view>
    </view>


    <view class="footer-style">
<!--        <a class="weui-form-preview__btn back-btn" bindtap="goBack">返回</a>-->
        <view class="foot-btn back-btn" @tap="goMap">开启导航</view>
        <view class="foot-btn call-btn" @tap="makeCall">拨打电话</view>
    </view>
</view>
</template>

<script>
// pages/rideDetail/rideDetail.js
const app = getApp();

export default {
  data() {
    return {
      //纬度
      latitude: null,
      //经度
      longitude: null,
      //标记点
      markers: [],
      order: {}
    };
  },

  components: {},
  props: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let order = app.globalData.orderDetail;
    let latitude, longitude, latitude1, longitude1;

    if (order.direction === 0) {
      latitude = order.startAddress.latitude;
      longitude = order.startAddress.longitude;
      latitude1 = order.endAddress.latitude;
      longitude1 = order.endAddress.longitude;
    } else {
      latitude = order.endAddress.latitude;
      longitude = order.endAddress.longitude;
      latitude1 = order.startAddress.latitude;
      longitude1 = order.startAddress.longitude;
    }

      this.order= order,
      this.latitude= latitude,
      //经度
      this.longitude= longitude,
      //标记点
      this.markers= [{
        //标记点 id
        id: 1,
        //标记点纬度
        latitude: latitude,
        //经度
        longitude: longitude,
        width: 30,
        height: 45,
        title: order.direction === 0 ? "出发地" : "目的地",
        callout: {
          content: order.direction === 0 ? "出发地" : "目的地",
          fontSize: 14,
          display: "ALWAYS"
        }
      }, {
        //标记点 id
        id: 2,
        //标记点纬度
        latitude: latitude1,
        //经度
        longitude: longitude1,
        width: 30,
        height: 45,
        title: order.direction === 1 ? "出发地" : "目的地",
        callout: {
          content: order.direction === 1 ? "出发地" : "目的地",
          fontSize: 14,
          display: "ALWAYS"
        }
      }]

  },
  methods: {
    makeCall() {
      let order = this.order;
      let phone = order.phone;
      let that = this;
      uni.removeStorageSync("沟通历史");
      uni.removeStorageSync("沟通历史_hasMore");
	  
      uni.makePhoneCall({
        phoneNumber: phone,

        success(res) {
          that.addCallRecord(order);
          console.log("success");
        },

        fail(res) {
          console.log("fail");
        }

      });
    },

    goBack() {
      uni.navigateBack();
    },

    goMap() {
      let data = this;
      let name = data.order.direction === 0 ? "出发地" : "目的地";
      uni.openLocation({
        latitude: data.latitude,
        // 纬度，范围为-90~90，负数表示南纬
        longitude: data.longitude,
        // 经度，范围为-180~180，负数表示西经
        scale: 10,
        // 缩放比例
        name: name,
        success: function (res) {
          console.log(res);
        },

        fail(res) {
          console.log(res);
          uni.showToast({
            title: '打开地图失败',
            icon: 'error',
            duration: 1000
          });
        }

      });
    },

    addCallRecord(order) {
      let data = {
        orderId: order._id,
        openId: app.globalData.openId,
        creatTime: new Date(),
        rideTime: new Date(order.rideTime)
      };
      uni.cloud.callFunction({
        name: "addCallRecord",
        data: {
          data: data
        },

        success(res) {
          console.log("add data to tb_call", res);
        }

      });
    }

  }
};
</script>
<style>
@import "./rideDetail.css";
@import "@/weui/weui-wxss/dist/style/weui.css";
</style>