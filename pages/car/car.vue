<template>
	<view class="page">

		<view class="weui-flex header-row">
			<view v-for="(item, index) in headerList" :key="index" :class="'weui-flex__item header-tab ' + (headerActive===item?'header-active':'')"
			 @tap="tabHeader" :id="item">
				{{item}}
			</view>
		</view>

		<view v-if="dataList.length === 0" class="content_page" @touchstart="onTouchStart" @touchend="onTouchEnd">
		</view>
		<view v-else class="content_page" @touchstart="onTouchStart" @touchend="onTouchEnd">
			<view v-for="(item, index) in dataList" :key="index" class="content_item">
				<view class="weui-form-preview beautiful-box">
					<view class="weui-form-preview__hd order-padding  box-header" :data-id="item.id" @tap="getDetail">
						<view class="weui-form-preview__item">
							<label :class="'go-common ' + (item.direction===0 ? 'go-home' : 'go-out')">{{item.direction === 0 ? '回家' : '外出'}}</label>
							<em class="weui-form-preview__value" style="font-size: 18pt;">{{item.locationName}}</em>
						</view>
					</view>
					<view class="weui-form-preview__bd order-padding" :data-id="item.id" @tap="getDetail">
						<view class="weui-form-preview__item">
							<label class="weui-form-preview__label">{{item.type === 0 ? '乘客' : '司机'}}</label>
							<text class="weui-form-preview__value">{{item.username}}</text>
						</view>
						<view class="weui-form-preview__item" v-if="item.callTime">
							<label class="weui-form-preview__label">呼叫时间</label>
							<text class="weui-form-preview__value">{{item.callTime}}</text>
						</view>
						<view class="weui-form-preview__item">
							<label class="weui-form-preview__label">乘车时间</label>
							<text class="weui-form-preview__value">{{item.formatTime}}</text>
						</view>
						<view class="weui-form-preview__item">
							<label class="weui-form-preview__label">电话</label>
							<text class="weui-form-preview__value">{{item.phone}}</text>
						</view>
					</view>
					<view class="weui-form-preview__ft" v-if="item.openId===openId">
						<view class="weui-form-preview__btn order_update_btn" :data-id="item.id" @tap="updateOrder">修改</view>
						<view class="weui-form-preview__btn order_delete_btn" :data-id="item.id" @tap="cancelOrder">撤销</view>
					</view>
				</view>
			</view>
		</view>

		<view v-if="showAddButton" class="round-click" @tap="addRideInfo">发布</view>

	</view>
</template>

<script>
	import forums from '@/mixin/forums';
	import { DISCUZ_REQUEST_HOST } from '@/common/const';
	import { http } from '@/api/api-request';
	
	let app = getApp();
	export default {
		mixins: [forums],
		data() {
			return {
				headerList: ["人叫车", "车等人", "沟通历史", "我发布的"],
				headerActive: "人叫车",
				openId: "",
				deleteOrderId: "",
				dataList: [],
				showAddButton: true,
				needRefresh: true,
				touchStartX: "",
				touchStartY: ""
			};
		},

		components: {

		},
		props: {},

		onLoad() {
			app.globalData.clearCarCache();
			this.openId = parseInt(uni.getStorageSync("user_id"));
		},

		onShow() {
			if (this.needRefresh === true) {
				console.log("onShow refresh");
				this.refreshPage();
				this.needRefresh = false;
			} else {
				console.log("无需刷新");
			}
		},

		//页面相关事件处理函数--监听用户下拉动作
		onPullDownRefresh() {
			//清楚掉页面缓存
			let pageKey = this.headerActive + "_page";
			uni.removeStorageSync(pageKey);
			let hasMoreKey = this.headerActive + "_hasMore";
			uni.removeStorageSync(hasMoreKey);
			this.refreshPage();
			uni.stopPullDownRefresh();
		},

		//触底事件
		onReachBottom: function() {
			this.refreshPage();
		},
		methods: {
			refreshPage() {
				let headerActive = this.headerActive;
				console.log("刷新页面：", headerActive);

				switch (headerActive) {
					case "人叫车":
						this.searchDataOfServer(0, false, headerActive);
						break;

					case "车等人":
						this.searchDataOfServer(1, false, headerActive);
						break;

					case "沟通历史":
						this.searchHistory();
						break;

					case "我发布的":
						this.searchDataOfServer(null, true, headerActive);
						break;
				}
			},

			//点击导航栏
			tabHeader(e) {
				let header = e.target.id;

				this.headerActive = header,
					this.showAddButton = header !== "沟通历史"

				let cache = uni.getStorageSync(header);

				if (cache) {
					console.log("缓存有对应数据：", header);
					this.dataList = cache
					return;
				}

				this.refreshPage();
			},

			onTouchEnd: function(e) {
				let x = e.changedTouches[0].clientX - this.touchStartX;
				let y = e.changedTouches[0].clientY - this.touchStartY;
				let headerList = this.headerList;
				let headerActive = this.headerActive;
				let goal;
				let i = headerList.findIndex(h => h === headerActive);

				if (y >= -80 && y <= 80) {
					if (x > 80) {
						let j = i - 1 < 0 ? 0 : i - 1;
						goal = headerList[j];
					}

					if (x < -80) {
						let j = i + 1 > 3 ? 3 : i + 1;
						goal = headerList[j];
					}
				}

				if (goal) {
					console.log("左右滑动切换");
					this.tabHeader({
						target: {
							id: goal
						}
					});
				}
			},

			onTouchStart(e) {
				let x = e.changedTouches[0].clientX;
				let y = e.changedTouches[0].clientY;
				this.touchStartX = x,
					this.touchStartY = y
			},

			//取消出行订单
			cancelOrder(e) {
				let id = e.currentTarget.dataset.id;
				console.log("cancel order", e.currentTarget.dataset);
				this.deleteOrderId= id
				let that = this;
				uni.showModal({
				    title: '确定要删除？',
				    content: '点击确认删除该项',
				    success: function (res) {
				        if (res.confirm) {
							that.doDelete();
				        } else if (res.cancel) {
				            console.log('用户点击取消');
				        }
				    }
				});
			},

			//点击确定或取消按钮
			doDelete() {
				let dataList = this.dataList;
				let id = this.deleteOrderId;
				this.deleteRideOrder(id);
				console.log("撤销订单:", id);
			},

			//查询数据库数据
			searchDataOfServer(type, filterSelf, cacheName) {
				//判断是否还有数据
				let hasMoreKey = cacheName + "_hasMore";
				let hasMore = uni.getStorageSync(hasMoreKey);
				if (hasMore === false) {
					console.log("没有数据了！");
					return;
				}
				
				let isAsc = true;
				let openId = null;
				let start = new Date(new Date().getTime() - 2 * 3600000); 
				
				//是否只查询自己发布的
				if (filterSelf === true) {
					openId = this.openId;
					start = null;
					isAsc = false;
				}
				
				let pageKey = cacheName + "_page";
				let page = uni.getStorageSync(pageKey);
				page = page ? page + 1 : 1;
				let that = this;
				uni.showLoading({
					title: '加载中'
				});
				
				let postData = {
					pageNo: page,
					pageSize: 40,
					rideTime: start,
					orderBy: "rideTime",
					isAsc: isAsc,
					type: type,
					openId: openId
				}
				
				http
				.post(DISCUZ_REQUEST_HOST + "vic/ride/page", postData)
				.then(res => {
					let list = res.data.data.list;
					console.log("res", res)
					
					list.forEach(d => {
						let t = d.rideTime;
						d.formatTime = app.globalData.formatDate(new Date(t));
						d.locationName = d.direction === 0 ?
							d.startAddress.name : d.endAddress.name;
					});
					uni.hideLoading();
									
					if (page > 1) {
						list = that.dataList.concat(list);
					}
									
					that.dataList= list
					
					//放入缓存，key为tab header名称
					uni.setStorage({
						key: pageKey,
						data: page
					});
					uni.setStorage({
						key: cacheName,
						data: list
					});
					uni.setStorage({
						key: hasMoreKey,
						data: res.data.data.hasMore
					});
				}).catch(e => {
					uni.hideLoading();
					uni.showToast({
						title: '查询失败',
						icon: 'error',
						duration: 2000
					});
				});
				
			},

			//查找历史记录
			searchHistory() {
				let hasMoreKey = "沟通历史" + "_hasMore";
				let hasMore = uni.getStorageSync(hasMoreKey);

				if (hasMore === false) {
					console.log("没有数据了！");
					return;
				}

				let openId = this.openId;
				let that = this;
				uni.showLoading();
				
				http.get(DISCUZ_REQUEST_HOST + "vic/ride/callHistory?openId=" + openId)
				.then(res => {
					uni.hideLoading();
					let list = res.data.data;
					list.forEach(d => {
						let t = d.rideTime;
						let c = d.callTime;
						d.formatTime = app.globalData.formatDate(new Date(t));
						d.callTime = app.globalData.formatDate(new Date(c));
						d.locationName = d.direction === 0 ?
							d.startAddress.name : d.endAddress.name;
					});
					that.dataList = list;
					uni.setStorage({
						key: "沟通历史",
						data: list
					});
					uni.setStorage({
						key: hasMoreKey,
						data: false
					});
				}).catch(e => {
					uni.hideLoading();
					uni.showToast({
						title: '查询失败',
						icon: 'error',
						duration: 2000
					});
				})
			},

			//跳转到新增订单页面
			addRideInfo() {
				let headerActive = this.headerActive;
				let type = headerActive === "人叫车" ? 0 : 1;
				uni.navigateTo({
					url: "/pages/car/rideForm?type=" + type
				});
			},

			//跳转到查看详情页面
			getDetail(event) {
				let id = parseInt(event.currentTarget.dataset.id);
				app.globalData.orderDetail = this.dataList.find(d => d.id === id);
				uni.navigateTo({
					url: "/pages/car/rideDetail?id=" + id
				});
			},

			//修改订单
			updateOrder(event) {
				let id = parseInt(event.currentTarget.dataset.id);
				app.globalData.orderDetail = this.dataList.find(d => d.id === id);
				uni.navigateTo({
					url: "/pages/car/rideForm?id=" + id
				});
			},

			//删除订单
			deleteRideOrder(id) {
				let that = this;
				
				http.post(DISCUZ_REQUEST_HOST + "vic/ride/delete/" + id)
				.then(res => {
					console.log("delete by id success", res);
				}).catch(e => {
					console.log("delete fail", res);
				})
				id = parseInt(id);
				
				let list = that.dataList.filter(d => d.id !== id);

				this.dataList = list;
				//更新缓存
				app.globalData.clearCarCache();
			}

		}
	};
</script>
<style>
	@import "@/weui/weui-wxss/dist/style/weui.css";
	@import "./car.css";
</style>
