<template>
	<view>
		<!-- #ifdef MP-WEIXIN -->
		<uni-nav-bar :title="i18n.t('home.find')" fixed="true" shadow="true" :color="checked ? '#fff' : '#000'" :background-color="checked ? '#2e2f30' : '#fff'"
		 status-bar></uni-nav-bar>
		<!-- #endif -->
		
		<!-- #ifdef H5 -->
		<uni-nav-bar :title="i18n.t('home.find')" fixed="true" shadow="true" :color="'#000'" :background-color="'#E7E7E7'"
		 status-bar></uni-nav-bar>
		<!-- #endif -->
		
		<view>
			
		</view>

		<view class="Grid">
			<view class="Grid-Item" 
			v-for="item in List" 
			:key="item.id" 
			hover-class="hover-menu"
			@tap="gotoMenu"
			:data-url="item.url">
				<view class="GSimg"><image class="Image" :src="item.img"></image></view>
			    <view class="GStitle">{{ item.title }}</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	import forums from '@/mixin/forums';
	import loginModule from '@/mixin/loginModule';

	export default {
		mixins: [loginModule, forums],
		data() {
			return {
				searchValue: '',
				system: false,
				List:[
						{id:1,img:'/static/car_green_big.png',title:'拼车',url:"/pages/car/car"},
						{id:2,img:'/static/cart_green_big.png',title:'买菜',url:"/pages/site/search"},
						{id:3,img:'/static/search_blue.png',title:'搜索',url:"/pages/site/search"},
						{id:4,img:'/static/info_green_big.png',title:'话题',url:"/pages/topic/list"}
				   ]

			};
		},
		watch: {},
		methods: {
			ontrueGetList() {
				//
			},
			gotoMenu(e) {
				
				let notLogin = !uni.getStorageSync('access_token');
				if (notLogin) {
					console.log("当前用户未登录！")
					// #ifdef MP-WEIXIN
					this.mpLoginMode();
					// #endif
					// #ifdef H5
					this.h5LoginMode();
					// #endif
					return;
				}
				
				uni.navigateTo({
					url: e.currentTarget.dataset.url
				})
			}
		}
	};
</script>

<style lang="scss">
	.hover-menu {
		background-color: #e7e7e7;
	}
	.Grid {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			align-content: space-between;
			padding:10rpx 0;
			.Grid-Item {
				width: 33%;
				height: 213rpx;
				text-align: center;
				box-sizing:border-box;
				.GSimg {
					width: 96rpx;
					height: 96rpx;
					margin-top: 42rpx;
					margin-left: 75rpx;
					.Image {
						width: 96rpx;
						height: 96rpx;
					}
				}
				.GStitle {
					width: 100%;
					height: 34rpx;
					line-height: 34rpx;
					color: #06121e;
					font-size: 24rpx;
					margin-top: 20rpx;
				}
			}
		}
</style>