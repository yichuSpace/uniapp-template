<template>
	<view class="content">
		<!-- 密码输入框 -->
		<div>
			<text>是否展示e324密码：</text>
			<switch :checked="showPsw" @change="showPswChange" />
		</div>
		<!-- #ifndef H5 -->
		<password-input @tap="openKeyBoard('number')" :length="length" :gutter="20" :list="numberList" :showPsw="showPsw"></password-input>
		<!-- #endif -->
		
		<!-- H5 openKeyBoard 点击事件失效，需要在外侧包裹一层view外衣 -->
		<!-- #ifdef H5 -->
		<view @tap="openKeyBoard('number')">
			<password-input :length="length" :gutter="40" :list="numberList" :showPsw="showPsw"></password-input>
		</view>
		<!-- #endif -->
		
		<view class="idcard" @tap="openKeyBoard('idCard')">
			idCard:{{passStr}}
		</view>
		
		<view class="idcard" @tap="openKeyBoard('plateNumber')">
			plateNumber:{{plateNumberStr}}
		</view>
		<!-- 键盘 -->
		
		<!-- 数字键盘 -->
		<keyboard-package ref="number"  @onInput="onInput" @onDelete="onDelete" @onConfirm="onConfirm" :disableDot="true"/>
		
		<!-- 身份证键盘 -->
		<keyboard-package ref="idCard" type="idCard"  @onInput="onInput" @onDelete="onDelete" @onConfirm="onConfirm"/>
		
		<!-- 车牌键盘 -->
		<keyboard-package ref="plateNumber" type="plateNumber"  @onInput="onInput" @onDelete="onDelete" @onConfirm="onConfirm"/>
	</view>
</template>

<script>
	import keyboardPackage from "@/components/keyboard-package/keyboard-package.vue"
	import passwordInput from "@/components/password-input/password-input.vue"
	export default {
		components: {
			keyboardPackage,
			passwordInput,
		},
		data() {
			return {
				numberList:[],
				idCardList:[],
				plateNumberList:[],
				length:4,
				type:'number',
				showPsw: false,
			}
		},
		mounted() {
			this.openKeyBoard('plateNumber');
		},
		methods: {
			openKeyBoard(key) {
				this.type=key;
				this.$refs[key].open();
			},
			onInput(val){
				switch(this.type){
					case 'number':
						if(this.numberList.length>=this.length){
							this.close();
							return;
						};
						if(this.numberList.length===this.length-1){
							this.numberList.push(val);
							this.close();
							return;
						};
						this.numberList.push(val);
						break;
					case 'idCard':
						this.idCardList.push(val);
						break;
					case 'plateNumber':
						this.plateNumberList.push(val);
						break;
				}
				
			},
			onDelete(){
				switch (this.type){
					case 'number':
						this.numberList.pop();
						break;
					case 'idCard':
						this.idCardList.pop();
						break;
					default:
						this.plateNumberList.pop();
						break;
				}
			},
			onConfirm(){
				uni.showToast({
					title:'完成输入！',
					duration:2000,
					icon:'none'
				})
			},
			close(){
				this.$refs[this.type].close();
			},
			showPswChange(e){
				this.showPsw = e.detail.value;
			},
		},
		computed:{
			passStr(){
				let str='';
				this.idCardList.forEach(item=>{
					str+=item.toString();
				})
				return str;
			},
			plateNumberStr(){
				let str='';
				this.plateNumberList.forEach(item=>{
					str+=item.toString();
				})
				return str;
			}
		}
	}
</script>

<style lang="scss">
.idcard{
	padding: 40rpx;
	background-color: #f5f5f5;
	margin: 20rpx 0;
}
</style>
