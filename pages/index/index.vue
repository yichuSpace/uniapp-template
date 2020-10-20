<template>
	<view class="content">
		<view class="text-area">
			<view class="title">{{demo1.demo}}</view>
			<view class="title">{{getLocale}}</view>
		</view>
	</view>
</template>

<script>
	import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
	export default {
		data() {
			return {
				title: 'Hello'
			}
		},
		computed: {
			...mapGetters(['getLocale']),
			...mapState([
				'demo1'
			])
		},
		onLoad() {
			this.fn('传递的内容')
			this.demoactions('这是一个异步')
		},
		methods: {
			...mapMutations([
				'fn'
			]),
			...mapActions([
				'demoactions'
			])
		}
	}
</script>

<style>
</style>
