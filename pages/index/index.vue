<template>
	<view class="page">
		<view class="content">
			<view class="content-top">{{beatNumTitle}}</view>
			<view class="flex align-center justify-center operation-area">
				<view class="rhythm-box">
					<view class="flex justify-center">
						<view class="handle-icon rhythm-box-icon " @click="deletePointItemLastOneList">-</view>
					</view>
					<view class="rhythm-point flex">
						<view class="handle-icon delete-icon mt-5" @click="deletePointListData">-</view>
						<view class="flex justify-between flex-column align-center point-list-box" v-for="(list,index) in rhythmPointList"
						 :key="index">
							<view class="handle-icon point-delete-icon " @click="deletePointData(index)">-</view>
							<view class="flex-1 point-list">
								<view class="point-icon" v-if="idx === 0" v-for="(item,idx) in list" :key="idx" @touchend="handlePointLevel(index,idx)">
									<view class="point-item circle-item-strong " :class="[item.id ===serialId?'circle-item-active':'',item.level===0?'level-one':item.level===1?'level-two':item.level===2?'level-three':'level-four']">
									</view>
								</view>
								<view class="point-list-item flex justify-between flex-column">
									<view class="point-icon" v-if="idx !== 0" v-for="(item,idx) in list" :key="idx" @touchend="handlePointLevel(index,idx)">
										<view class="point-item circle-item-strong " :class="[item.id ===serialId?'circle-item-active':'',item.level===0?'level-one':item.level===1?'level-two':item.level===2?'level-three':'level-four']">
										</view>
									</view>
								</view>
							</view>

							<view class="handle-icon point-add-icon " @click="addPointData(index)">+</view>
						</view>
						<view class="handle-icon add-icon mt-5" @click="addPointListData">+</view>
					</view>
					<view class="flex justify-center">
						<view class="handle-icon add-icon mt-5" @click="addPointItemLastOneList">+</view>
					</view>
				</view>
			</view>
			<view class="flex align-center handle-box justify-center" :class="isShowKeyBoard?'handle-box-acitve':'handle-box-init'">
				<view class="handle-btn" @click="handlebeatNum('reduce')">-</view>
				<view class="beatsNum-box" @click="openKeyBoard('number')">{{!isShowKeyBoard?beatsNum:keyWord}}</view>
				<view class="handle-btn" @click="handlebeatNum('add')">+</view>
				<view class="play-btn" v-if="isShowPlayBtn" @tap="startHandleAudioPlay">开始</view>
				<view class="play-btn" v-else @tap="stopHandleAudioPlay">结束</view>
				<!-- <view @tap="pauseHandleAudioPlay">暂停</view> -->
			</view>
		</view>
		<keyboard-package ref="number" @onInput="onInputValue" @onDelete="onDelete" @onConfirm="onConfirm" @onClose="closePopupBox" />

	</view>
</template>

<script>
	import {
		getUuid
	} from '@/utils/index.js'
	import keyboardPackage from "@/components/keyboard-package/keyboard-package.vue"
	const audioOne = uni.createInnerAudioContext();
	const audioTwo = uni.createInnerAudioContext();
	const audioThree = uni.createInnerAudioContext();
	const audioFour = uni.createInnerAudioContext();
	export default {
		data() {
			return {
				beatNumTitle: '',
				keyWord: '',
				isShowPlayBtn: true, //是否显示播放按钮
				isShowKeyBoard: false, //是否显示键盘
				tapTimeData: '', //点击tap时间
				numberList: [],
				idCardList: [],
				plateNumberList: [],
				length: 4,

				rhythmPointList: [], //节奏数据
				beatsNum: 60, //拍子数
				beat: 0, //拍子
				note: 0,
				isPlay: null,
				serialNum: 0, //当前的坐标
				serialId: 0,
				rhythmIdx: 0,
				playAudioItem: null,
				circleBoxHeight: 200 //高度
			};
		},

		components: {
			keyboardPackage,
		},

		onLoad() {
			let rhythmPointList = []
			for (let i = 0; i < 3; i++) {
				let list = []
				for (let j = 0; j < 4; j++) {
					let obj = {
						id: getUuid(),
						abscissa: 0,
						ordinate: 0,
						level: 0
					}
					list.push(obj)
				}
				rhythmPointList.push(list)
			}
			this.rhythmPointList = rhythmPointList
			audioOne.src = "/static/audio/A1.wav"
			audioTwo.src = "/static/audio/A2.wav"
			audioThree.src = "/static/audio/A3.wav"
			audioFour.src = "/static/audio/B1.wav"
			this.$forceUpdate()
		},
		watch: {
			"rhythmPointList": {
				handler: function(val) {
					const arr = val.map(item => item.length)
					const beatNum = Math.max(...arr)
					this.beatNumTitle = `${val.length}/${beatNum}`
				},
				deep: true
			}
		},
		methods: {
			// 播放音频
			audioPlay(key) {
				return new Promise(resole => {
					switch (key) {
						case 0:
							audioOne.stop();
							audioOne.play();
							resole()
							break;
						case 1:
							audioTwo.stop();
							audioTwo.play();
							resole()
							break;
						case 2:
							audioThree.stop();
							audioThree.play();
							resole()
							break;
						case 3:
							audioFour.stop();
							resole()
							break;
						default:
							break;
					}
				})
			},

			// 开始
			startHandleAudioPlay() {
				if (this.isShowKeyBoard) {
					if (this.keyWord) {
						this.beatsNum = this.keyWord
					}
					if (!this.isShowPlayBtn) {
						this.pauseHandleAudioPlay()
					}
				}
				let playPointList = []
				this.rhythmPointList.forEach(item => {
					playPointList = [...playPointList, ...item]
				})
				this.playPointList = playPointList
				if (this.isPlay) return;
				this.handlePlayAudioData();
				const time = 60000 / this.beatsNum;
				const isPlay = setInterval(() => {
					this.rhythmIdx += 1
					if (this.rhythmIdx === this.rhythmPointList.length) {
						this.rhythmIdx = 0
					}
					clearInterval(this.playAudioItem)
					this.handlePlayAudioData()
				}, time);
				this.isPlay = isPlay
				this.isShowPlayBtn = false
			},
			// 设置每一拍播放速度
			handlePlayAudioData() {
				let lengthNum = this.rhythmPointList[this.rhythmIdx].length
				this.audioPlay(this.rhythmPointList[this.rhythmIdx][0].level)

				this.$set(this, 'serialId', this.rhythmPointList[this.rhythmIdx][0].id)
				let idx = 0
				let playAudioItem = setInterval(async () => {
					idx += 1
					if (idx === lengthNum) return
					let item = this.rhythmPointList[this.rhythmIdx][idx]
					await this.audioPlay(item.level)
					this.$set(this, 'serialId', item.id) //设置当前的点
				}, 60000 / this.beatsNum / lengthNum)
				this.playAudioItem = playAudioItem
			},

			// 处理提示框的移动
			handleTipBoxMove() {
				let serialNum = this.serialNum
				serialNum += 1
				if (serialNum === this.playPointList.length) {
					serialNum = 0;
				}
				this.$set(this, 'serialNum', serialNum)
				this.$set(this, 'serialId', this.playPointList[serialNum].id)
			},
			// 停止
			stopHandleAudioPlay(e) {
				clearInterval(this.isPlay);
				clearInterval(this.playAudioItem)
				this.isPlay = null
				this.serialNum = null
				this.serialId = null
				this.isShowPlayBtn = true
				this.rhythmIdx = 0
			},
			// 暂定
			pauseHandleAudioPlay(e) {
				clearTimeout(this.isPlay);
				clearInterval(this.playAudioItem)
				this.isPlay = null
			},
			// 添加数据
			addPointListData() {
				let serialNum = 0
				if (this.rhythmPointList.length > 0) {
					this.rhythmPointList.forEach(item => {
						serialNum += item.length
					})
				}
				let obj = {
					id: getUuid(),
					abscissa: this.rhythmPointList.length,
					ordinate: 0,
					level: 1
				}
				console.log(obj)
				if (this.rhythmPointList.length === 8) return
				this.rhythmPointList.push([obj])
			},
			// 删除列表数据
			deletePointListData() {
				if (this.rhythmPointList.length === 1) return
				this.rhythmPointList.pop()
			},
			// 删除最后一个数据
			deletePointItemLastOneList() {
				this.rhythmPointList.forEach(item => {
					if (item.length !== 1) {
						item.pop()
					}
				})
			},
			addPointItemLastOneList() {
				this.rhythmPointList.forEach((item, idx) => {
					const obj = {
						id: getUuid(),
						abscissa: idx,
						ordinate: item.length,
						level: 1
					}
					item.push(obj)
				})
			},
			// 添加点数
			addPointData(idx) {
				let serialNum = 0
				if (idx > 0) {
					for (let i = 0; i < idx + 1; i++) {
						serialNum += this.rhythmPointList[i].length
					}
				} else {
					serialNum = this.rhythmPointList[idx].length
				}
				let obj = {
					id: getUuid(),
					abscissa: idx,
					ordinate: this.rhythmPointList[idx].length,
					level: 1
				}
				console.log(obj)
				this.rhythmPointList[idx].push(obj)
				this.$forceUpdate()
			},
			// 删除点数
			deletePointData(idx) {
				if (this.rhythmPointList[idx].length === 1) return
				this.rhythmPointList[idx].pop()
				this.$forceUpdate()
			},
			// 增加级别
			handlePointLevel(index, idx) {
				const oldPoint = this.rhythmPointList[index][idx]
				if (oldPoint.level === 3) {
					oldPoint.level = 0
				} else {
					oldPoint.level += 1
				}
				this.rhythmPointList[index][idx] = oldPoint
				this.$forceUpdate()
			},
			// 处理拍子数
			handlebeatNum(type) {
				if (type === 'add') {
					this.beatsNum = parseInt(this.beatsNum) + 1
				} else {
					this.beatsNum = parseInt(this.beatsNum) - 1
				}
			},
			// 打开键盘
			openKeyBoard(key) {
				this.type = key;
				this.isShowKeyBoard = true
				this.$refs[key].open();
			},
			// 获取输入值
			onInputValue(val) {
				if (val === 'TAP') {
					const time = new Date().getTime()
					if (this.tapTimeData && time - this.tapTimeData < 1000) {
						const keyWord = Math.ceil(Math.random() * 100) + this.keyWord
						if (keyWord >= 1000) {
							this.keyWord = Math.ceil(Math.random() * 100)
						} else {
							this.keyWord = keyWord
						}
					} else {
						this.keyWord = Math.ceil(Math.random() * 100)
					}
					this.tapTimeData = time
					return
				}
				if (this.keyWord.length >= 3) {
					return
				}
				this.keyWord = this.keyWord.toString() + val
			},
			// 删除
			onDelete() {
				this.keyWord = this.keyWord.substring(0, this.keyWord.length - 1)
			},
			// 关闭键盘
			close() {
				this.$refs[this.type].close();
			},
			// 关闭弹框
			closePopupBox() {
				this.isShowKeyBoard = false
				if (this.keyWord) {
					this.beatsNum = this.keyWord
					this.keyWord = ''
				}
				if (!this.isShowPlayBtn) {
					this.pauseHandleAudioPlay()
					this.startHandleAudioPlay()
				}
			},
			// 确定
			onConfirm() {
				uni.showToast({
					title: '完成输入！',
					duration: 2000,
					icon: 'none'
				})
			},
		}
	};
</script>
<style lang="scss">
	@import "./index";
</style>
