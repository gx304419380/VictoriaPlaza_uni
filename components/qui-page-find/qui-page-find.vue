<template>
	<view>
		<!-- #ifdef MP-WEIXIN -->
		<uni-nav-bar :title="i18n.t('home.find')" fixed="true" :color="checked ? '#fff' : '#000'" :background-color="checked ? '#2e2f30' : '#fff'"
		 status-bar></uni-nav-bar>
		<!-- #endif -->
		
		<grid col="-10" title="日常菜单">
			<grid-item order="0" iconImg="/static/car_green_big.png" url="/pages/car/car" text="拼车"></grid-item>
			<grid-item order="1" iconImg="/static/cart_green_big.png" url="/pages/site/search" text="买菜"></grid-item>
			<grid-item order="2" iconImg="/static/search_blue.png" url="/pages/site/search" text="搜索"></grid-item>
			<grid-item order="3" iconImg="/static/info_green_big.png" url="/pages/topic/list" text="话题"></grid-item>
		</grid>

	</view>
</template>

<script>
	import forums from '@/mixin/forums';
	import grid from '@/components/oveui-grid/grid/grid.vue'
	import gridItem from '@/components/oveui-grid/grid-item/grid-item.vue'

	export default {
		components: {
			grid,
			gridItem
		},
		mixins: [forums],
		data() {
			return {
				searchValue: '',
				system: false,

			};
		},
		watch: {},
		methods: {
			ontrueGetList() {
				//
			},
			toSearch() {
				uni.navigateTo({
					url: '/pages/site/search',
				});
			},
			clearSearch() {
				this.searchValue = '';
			},
		}
	};
</script>
