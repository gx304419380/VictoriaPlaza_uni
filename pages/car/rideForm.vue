<template>
	<view class="page">
		<view class="ride-form-page">
			<view class="weui-form__text-area">
				<h2 class="weui-form__title">添加乘车信息</h2>
			</view>

			<view class="type-button-flex">
				<view :class="'type-flex-item type-btn-left ' + (type === 0 ? 'type-active' : '')" @tap="switchType" data-type="0">
					<uni-icons class="type-icon" v-if="type===0" type="checkmarkempty" color="white" :size="30"></uni-icons>
					我是乘客
				</view>
				<view :class="'type-flex-item type-btn-right ' + (type === 1 ? 'type-active' : '')" @tap="switchType" data-type="1">
					<uni-icons class="type-icon" v-if="type===1" type="checkmarkempty" color="white" :size="30"></uni-icons>
					我是司机
				</view>
			</view>

			<view class="cancel-padding">
				<view class="weui-cells__group weui-cells__group_form">
					<view class="weui-cells__title">选择出行方向</view>
					<view class="weui-cells weui-cells_radio">
						<radio-group class="radio-group" @change="radioChange">
							<label v-for="(item, index) in items" :key="index" class="weui-cell weui-cell_active weui-check__label">
								<view class="weui-cell__bd">
									<view>{{item.value}}</view>
								</view>
								<view class="weui-cell__ft">
									<radio color="#07c160" :value="item.name" :checked="item.checked"></radio>
								</view>
							</label>
						</radio-group>
					</view>
				</view>
				<view class="weui-cells__group weui-cells__group_form">
					<view class="weui-cells__title">红色项目为必填</view>
					<view class="weui-cell weui-cell_active">
						<view class="weui-cell__hd">
							<label class="weui-label">姓名</label>
						</view>
						<view class="weui-cell__bd">
							<input class="weui-input" v-model="nickName" placeholder="填写本人姓名" placeholder-class="weui-input__placeholder"></input>
						</view>
					</view>
					<view class="weui-cell weui-cell_active">
						<view class="weui-cell__hd">
							<view class="weui-label">日期</view>
						</view>
						<view class="weui-cell__bd">
							<picker mode="date" fields="day" :value="date" :start="startDate" :end="endDate" @change="bindDateChange">
								<view class="weui-input">{{date}}</view>
							</picker>
						</view>
					</view>
					<view class="weui-cell weui-cell_active">
						<view class="weui-cell__hd">
							<view class="weui-label">时间</view>
						</view>
						<view class="weui-cell__bd">
							<picker mode="time" :value="time" start="05:00" end="23:30" @change="bindTimeChange">
								<view class="weui-input">{{time}}</view>
							</picker>
						</view>
					</view>
					<view class="weui-cell weui-cell_active">
						<view class="weui-cell__hd">
							<label class="weui-label" style="color: red;">出发地
							</label>
						</view>
						<view class="weui-cell__bd" @tap="selectLocation" data-id="0">
							<input :disabled="direction===0" class="weui-input" v-model="startPoint" placeholder="点击打开地图"
							 placeholder-class="weui-input__placeholder"></input>
						</view>
					</view>
					<view class="weui-cell weui-cell_active">
						<view class="weui-cell__hd">
							<label class="weui-label" style="color: red;">目的地
							</label></view>
						<view class="weui-cell__bd" @tap="selectLocation" data-id="1">
							<input :disabled="direction===1" class="weui-input" v-model="destination" placeholder="点击打开地图"
							 placeholder-class="weui-input__placeholder"></input>
						</view>
					</view>
					<view class="weui-cell weui-cell_active">
						<view class="weui-cell__hd">
							<label class="weui-label" style="color: red;">手机
							</label></view>
						<view class="weui-cell__bd">
							<input type="number" maxlength="11" class="weui-input" v-model="phone" placeholder="填写本人手机"
							 placeholder-class="weui-input__placeholder"></input>
						</view>
					</view>
				</view>
				<view class="weui-cells__group weui-cells__group_form">
					<view class="weui-cells__title">备注</view>
					<view class="weui-cells weui-cells_form">
						<view class="weui-cell ">
							<view class="weui-cell__bd">
								<textarea v-model="content" :maxlength="40" class="weui-textarea" placeholder="请添加备注信息" auto-height="true"
								 rows="2"></textarea>
								<view class="weui-textarea-counter"><text>{{content.length}}</text>/40</view>
							</view>
						</view>
					</view>
				</view>

				<view @tap="submitForm" class="weui-btn weui-btn_primary submit-btn">确定</view>

			</view>

		</view>

		<view :class="'fadeIn ' + (hideWarnToast ? 'fadeOut' : '')" v-if="warnToast">
			<view class="weui-mask_transparent"></view>
			<view class="weui-toast">
				<i class="weui-icon-warn weui-icon_toast"></i>
				<view class="weui-toast__content">{{error}}</view>
			</view>
		</view>

	</view>
</template>

<script>
	import uniIcons from "@/components/uni-icons/uni-icons.vue"
	import user from '@/mixin/user';
	import { DISCUZ_REQUEST_HOST } from '@/common/const';

	let app = getApp(); // pages/rideForm/rideForm.js

	export default {
		mixins: [user],
		components: {
			uniIcons
		},
		data() {
			return {
				error: "",
				warnToast: false,
				hideWarnToast: false,
				buttons: [{
					text: '取消'
				}, {
					text: '确定'
				}],
				type: 0,
				direction: 0,
				username: "",
				phone: "",
				rideTime: null,
				time: app.globalData.getTime(),
				date: app.globalData.getDate(),
				startDate: app.globalData.getDate(),
				endDate: app.globalData.getDate(new Date(), 5),
				startPoint: "",
				destination: "",
				content: "",
				nickName: "",
				startAddress: {},
				endAddress: {},
				longitude: 120.25624741528318,
				latitude: 36.015723213455935,
				items: [{
					name: '0',
					value: '我要回家',
					checked: 'true'
				}, {
					name: '1',
					value: '我要出门'
				}],
				id: "",
				openId: "",
				needRefresh: false
			};
		},
		props: {},

		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			//修改操作
			let id = options.id;

			if (id) {
				let order = app.globalData.orderDetail;
				let date = new Date(order.rideTime);
				let dateString = app.globalData.getDate(date);
				let timeString = app.globalData.getTime(date);
				this.id = order.id
				this.username = order.username
				this.rideTime = new Date(order.rideTime)
				this.date = dateString
				this.time = timeString
				this.content = order.content
				this.phone = order.phone
				this.type = order.type
				this.direction = order.direction
				this.startAddress = order.startAddress
				this.endAddress = order.endAddress
				this.nickName = order.username
				this.startPoint = order.startPoint
				this.destination = order.destination


				if (order.direction === 0) {
					this.longitude = order.startAddress.longitude,
						this.latitude = order.startAddress.latitude
				} else {
					this.longitude = order.endAddress.longitude,
						this.latitude = order.endAddress.latitude
				}

				return;
			} //新增操作


			let type = parseInt(options.type);

			this.type = type
			let userInfo = this.user;

			this.username = userInfo.username
			this.nickName = userInfo.username
			this.openId = userInfo.id
			this.phone = userInfo.mobile
			this.destination = "维湾小区"
			this.endAddress = {
				longitude: 120.25624741528318,
				latitude: 36.015723213455935
			}
			this.rideTime = new Date()

		},
		methods: {
			switchType(e) {
				let type = parseInt(e.currentTarget.dataset.type);
				this.type = type
			},

			bindDateChange: function(e) {
				let date = e.detail.value;
				let time = this.time;
				let dateSplit = date.split("-");
				let timeSplit = time.split(":");
				let dateTime = new Date(dateSplit[0], dateSplit[1] - 1, dateSplit[2], parseInt(timeSplit[0]), parseInt(timeSplit[1]),
					0);
				console.log("时间=", dateTime);
				this.date = date,
				this.rideTime = dateTime
			},
			bindTimeChange: function(e) {
				let time = e.detail.value;
				let date = this.date;
				let timeSplit = time.split(":");
				let dateSplit = date.split("-");
				let dateTime = new Date(dateSplit[0], dateSplit[1] - 1, dateSplit[2], parseInt(timeSplit[0]), parseInt(timeSplit[1]),
					0);
				console.log("时间=", dateTime);
				this.time = time;
				this.rideTime = dateTime;
			},

			submitForm() {
				
				if (!this.startPoint) {
					this.error = "请输入出发地址"
					this.openWarnToast();
					return;
				}

				if (!this.startPoint) {
					this.error = "请输入目的地址"
					this.openWarnToast();
					return;
				}

				if (this.rideTime < new Date()) {
					this.error = "时间不能早于当前时间"
					this.openWarnToast();
					return;
				}
				
				if (!/^1([3456789])\d{9}$/.test(this.phone)) {
					this.error = "电话号码格式错误";
					this.openWarnToast();
					return;
				}
				
				let that = this;
				uni.showModal({
				    title: '确认提交',
				    content: '点击确认提交表单',
				    success: function (res) {
				        if (res.confirm) {
				            console.log('用户点击确定');
							that.doSubmit();
				        } else if (res.cancel) {
				            console.log('用户点击取消');
				        }
				    }
				});
			},

			//点击确定或取消按钮
			doSubmit() {

					console.log("提交表单:");
					let location;

					if (this.direction === 0) {
						location = this.startAddress.address.substring(6);
					} else {
						location = this.endAddress.address.substring(6);
					}

					let data = this;
				
					let ride = {
						username: data.username,
						rideTime: data.rideTime,
						content: data.content,
						phone: data.phone,
						location: location,
						type: data.type,
						direction: data.direction,
						startPoint: data.startPoint,
						destination: data.destination,
						startAddress: data.startAddress,
						endAddress: data.endAddress,
						openId: data.user.id
					};
					
					if (data.id) {
						ride.id = data.id;
					}

					console.log("ride", ride);
					uni.showLoading({
						title: '提交中...'
					}); //清空缓存

					let pages = getCurrentPages(); //获取页面栈

					if (pages.length > 1) {
						let prePage = pages[pages.length - 2];
						prePage.$vm.needRefresh = true
					}

					
					uni.request({
						url: DISCUZ_REQUEST_HOST + "vic/ride",
						method: "POST",
						data: ride,
						success(res) {
							uni.hideLoading();
								
							if (res.data.code !== 200) {
								uni.showToast({
									icon: "error",
									duration: 2000,
									title: res.data.msg
								});
								return;
							}
							
							console.log("添加乘车信息成功...", res); //提示用户保存成功，返回
							app.globalData.clearCarCache(); //设置上一页刷新
							uni.navigateBack();
						},
						fail(res) {
							console.log(res);
							uni.hideLoading();
							uni.showToast({
								icon: "error",
								duration: 2000,
								title: "失败！"
							});
						}
					})
				
			},

			radioChange: function(e) {
				let dir = parseInt(e.detail.value);
				this.direction = dir
				this.startPoint = dir === 1 ? "维湾小区" : ""
				this.destination = dir === 0 ? "维湾小区" : ""

				if (dir === 0) {
					this.endAddress = {
						longitude: 120.25624741528318,
						latitude: 36.015723213455935
					}
				} else {
					this.startAddress = {
						longitude: 120.25624741528318,
						latitude: 36.015723213455935
					}
				}
			},

			handleAddress(res, id) {
				if (!res.address) {
					return;
				}

				if (id === 0) {
					this.startAddress = res
					this.startPoint = res.name + "（" + res.address.substring(6) + "）"
				} else {
					this.endAddress = res
					this.destination = res.name + "（" + res.address.substring(6) + "）"
				}
			},

			selectLocation(e) {
				let id = parseInt(e.currentTarget.dataset.id);

				if (id + this.direction === 1) {
					console.log("无需开启地图");
					return;
				}

				let that = this;
				const latitude = this.latitude;
				const longitude = this.longitude;
				uni.chooseLocation({
					latitude: latitude,
					longitude: longitude,
					success: function(res) {
						that.handleAddress(res, id);
					},

					fail(res) {
						console.log(res);
						uni.getSetting({
							success(res) {
								if (res.authSetting['scope.userLocation']) {
									console.log("用户已有位置权限");
									return;
								}

								uni.showModal({
									title: '是否授权当前位置',
									content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',

									success(tip) {
										if (!tip.confirm) {
											return;
										}

										uni.openSetting({
											success(res) {
												if (!res.authSetting['scope.userLocation']) {
													uni.showToast({
														title: '授权失败',
														icon: 'success',
														duration: 1000
													});
													return;
												}

												uni.showToast({
													title: '授权成功',
													icon: 'success',
													duration: 1000
												}); //授权成功之后，再调用chooseLocation选择地方

												uni.chooseLocation({
													success: function(res) {
														that.handleAddress(res, id);
													}
												});
											}

										});
									}

								});
							}

						});
					}

				});
			},

			openWarnToast: function() {
				this.warnToast = true

				setTimeout(() => {
					this.hideWarnToast = true
					setTimeout(() => {
						this.warnToast = false
						this.hideWarnToast = false
					}, 300);
				}, 2000);
			}
		}
	};
</script>
<style>
	@import "./rideForm.css";
	@import "@/weui/weui-wxss/dist/style/weui.css";
</style>
