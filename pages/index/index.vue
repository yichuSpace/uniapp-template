<template>
	<view class="page">
		<view class="beatsNum-part">
			<view>
				<text>拍子数：{{ beatsNum }}</text>
			</view>
		</view>
		<!-- 	<view class="circle" :style="'height:' + circleBoxHeight + 'rpx'">
			<text v-for="(item, index) in circleNum" :key="index" :class="'circle-item ' + (item % beat === 0?'circle-item-strong':'') + ' ' + (serialNum === index &&isPlay?'circle-item-active':'')"></text>
		</view> -->
		<view class="rhythm-box">
			<view class="rhythm-point flex">
				<view class="handle-icon delete-icon animated bounceIn fast mt-5" @click="deletePointListData">-</view>
				<view class="flex justify-between flex-column align-center point-list-box" v-for="(list,index) in rhythmPointList"
				 :key="index">
					<view class="handle-icon point-delete-icon animated bounceIn fast" @click="deletePointData(index)">-</view>
					<view class="flex-1 point-list">
						<view class="point-item" :class="item.id ===serialId?'circle-item-strong circle-item-active':''" v-for="(item,idx) in list"
						 :key="idx" @click="handlePointLevel(index,idx)">
							{{item.level}}
						</view>
					</view>
					<view class="handle-icon point-add-icon animated bounceIn fast" @click="addPointData(index)">+</view>
				</view>
				<view class="handle-icon add-icon animated bounceIn fast mt-5" @click="addPointListData">+</view>
			</view>
		</view>
		{{serialId}}
		<view @tap="startHandleAudioPlay">开始</view>
		<view @tap="stopHandleAudioPlay">结束</view>
		<view @tap="pauseHandleAudioPlay">暂停</view>
	</view>
</template>

<script>
	import {
		getUuid
	} from '@/utils/index.js'

	const audioOne = uni.createInnerAudioContext({});
	const audioTwo = uni.createInnerAudioContext({});
	const audioThree = uni.createInnerAudioContext({});
	const audioFour = uni.createInnerAudioContext({});

	export default {
		data() {
			return {
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

		onShow: function() {
			let obj = {
				id: getUuid(),
				abscissa: 0,
				ordinate: 0,
				level: 2
			}

			this.rhythmPointList[0] = [obj]
			console.log(this.rhythmPointList)
			audioOne.src = "/static/audio/A1.wav"
			audioTwo.src = "/static/audio/A2.wav"
			audioThree.src = "/static/audio/A3.wav"
			audioFour.src = "/static/audio/A4.wav"
		},
		onHide: function() {
			console.log('hide')
			this.stopHandleAudioPlay();
		},
		methods: {
			// 播放音频
			audioPlay(key) {
				return new Promise(resole => {
					switch (key) {
						case 0:
							audioOne.stop();
							resole()
							break;
						case 1:
							audioOne.stop();
							audioOne.play();
							resole()
							break;
						case 2:
							audioTwo.stop();
							audioTwo.play();
							resole()
							break;
						case 3:
							audioThree.stop();
							audioThree.play();
							resole()
							break;
						default:
							break;
					}
				})
			},

			// 开始
			startHandleAudioPlay() {
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
				// this.audioPlay(this.playPointList[serialNum].level)
			},
			// 停止
			stopHandleAudioPlay(e) {
				clearInterval(this.isPlay);
				clearInterval(this.playAudioItem)
				this.isPlay = null
				this.serialNum = null
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
					level: 2
				}
				console.log(obj)
				if (this.rhythmPointList.length === 8) return
				this.rhythmPointList.push([obj])
			},
			// 删除列表数据
			deletePointListData() {
				if (this.rhythmPointList.length === 1) return
				this.rhythmPointList.shift()
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
					level: 3
				}
				console.log(obj)
				this.rhythmPointList[idx].push(obj)
				this.$forceUpdate()
			},
			// 删除点数
			deletePointData(idx) {
				console.log(this.rhythmPointList[idx].length)
				if (this.rhythmPointList[idx].length === 1) return
				this.rhythmPointList[idx].shift()
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
		}
	};
</script>
<style lang="scss">
	@import "./index";
</style>
