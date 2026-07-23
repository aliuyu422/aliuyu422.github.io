# Canvas的三个应用



## canvas实现时钟转动

 1.1、找到canvas的中心，画出表心，以及表框

 1.2、获取当前时间，并根据时间画出时针，分针，秒针，还有刻度

 1.3、使用定时器，每过一秒获取新的时间，并重新绘图，达到时钟转动的效果



```javascript
//html
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

setInterval(() => {
  ctx.save()
  ctx.clearRect(0, 0, 600, 600)
  ctx.translate(300, 300) // 设置中心点，此时300，300变成了坐标的0，0
  ctx.save()

  // 画大圆
  ctx.beginPath()
  // 画圆线使用arc(中心点X,中心点Y,半径,起始角度,结束角度)
  ctx.arc(0, 0, 100, 0, 2 * Math.PI)
  ctx.stroke() // 执行画线段的操作
  ctx.closePath()

  // 画小圆
  ctx.beginPath()
  ctx.arc(0, 0, 5, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.closePath()

  // 获取当前 时，分，秒
  let time = new Date()
  let hour = time.getHours() % 12
  let min = time.getMinutes()
  let sec = time.getSeconds()

  // 时针
  ctx.rotate(2 * Math.PI / 12 * hour + 2 * Math.PI / 12 * (min / 60) - Math.PI / 2)
  ctx.beginPath()
  // moveTo设置画线起点
  ctx.moveTo(-10, 0)
  // lineTo设置画线经过点
  ctx.lineTo(40, 0)
  // 设置线宽
  ctx.lineWidth = 10
  ctx.stroke()
  ctx.closePath()
  ctx.restore()
  ctx.save()

  // 分针
  ctx.rotate(2 * Math.PI / 60 * min + 2 * Math.PI / 60 * (sec / 60) - Math.PI / 2)
  ctx.beginPath()
  ctx.moveTo(-10, 0)
  ctx.lineTo(60, 0)
  ctx.lineWidth = 5
  ctx.strokeStyle = 'blue'
  ctx.stroke()
  ctx.closePath()
  ctx.restore()
  ctx.save()

  //秒针
  ctx.rotate(2 * Math.PI / 60 * sec - Math.PI / 2)
  ctx.beginPath()
  ctx.moveTo(-10, 0)
  ctx.lineTo(80, 0)
  ctx.strokeStyle = 'red'
  ctx.stroke()
  ctx.closePath()
  ctx.restore()
  ctx.save()

  // 绘制刻度，也是跟绘制时分秒针一样，只不过刻度是死的
  ctx.lineWidth = 1
  for (let i = 0; i < 60; i++) {
    ctx.rotate(2 * Math.PI / 60)
    ctx.beginPath()
    ctx.moveTo(90, 0)
    ctx.lineTo(100, 0)
    // ctx.strokeStyle = 'red'
    ctx.stroke()
    ctx.closePath()
  }
  ctx.restore()
  ctx.save()
  ctx.lineWidth = 5
  for (let i = 0; i < 12; i++) {
    ctx.rotate(2 * Math.PI / 12)
    ctx.beginPath()
    ctx.moveTo(85, 0)
    ctx.lineTo(100, 0)
    // ctx.strokeStyle = 'red'
    ctx.stroke()
    ctx.closePath()
  }

  ctx.restore()
  ctx.restore()
}, 1000)
```





## canvas实现刮刮卡

1、底下答案是一个div，顶部灰皮是一个canvas，canvas一开始盖住div

2、鼠标事件，点击时并移动时，鼠标经过的路径都画圆形开路，并且设置

globalCompositeOperation为destination-out，使鼠标经过的路径都变成透明，一透明，自然就显示出下方的答案信息。



```javascript
// html
<canvas id="canvas" width="400" height="100"></canvas>
<div class="text">恭喜您获得100w</div>
<style>
    \* {
      margin: 0;
      padding: 0;
    }
    .text {
      position: absolute;
      left: 130px;
      top: 35px;
      z-index: -1;
    }
</style>


// js
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

// 填充的颜色
ctx.fillStyle = 'darkgray'
// 填充矩形 fillRect(起始X,起始Y,终点X,终点Y)
ctx.fillRect(0, 0, 400, 100)
ctx.fillStyle = '#fff'
// 绘制填充文字
ctx.fillText('刮刮卡', 180, 50)

let isDraw = false
canvas.onmousedown = function () {
  isDraw = true
}
canvas.onmousemove = function (e) {
  if (!isDraw) return
  // 计算鼠标在canvas里的位置
  const x = e.pageX - canvas.offsetLeft
  const y = e.pageY - canvas.offsetTop
  // 设置globalCompositeOperation
  ctx.globalCompositeOperation = 'destination-out'
  // 画圆
  ctx.arc(x, y, 10, 0, 2 * Math.PI)
  // 填充圆形
  ctx.fill()
}
canvas.onmouseup = function () {
  isDraw = false
}
```



## canvas实现画板和保存

1、鼠标拖拽画正方形和圆形

2、画完一个保存画布，下次再画的时候叠加

3、保存图片
```javascript
<template>
  <div>
    <div style="margin-bottom: 10px; display: flex; align-items: center">
      <el-button @click="changeType('huabi')" type="primary">画笔</el-button>
      <el-button @click="changeType('rect')" type="success">正方形</el-button>
      <el-button
        @click="changeType('arc')"
        type="warning"
        style="margin-right: 10px"
        >圆形</el-button
      >
      <div>颜色：</div>
      <el-color-picker v-model="color"></el-color-picker>
      <el-button @click="clear">清空</el-button>
      <el-button @click="saveImg">保存</el-button>
    </div>
    <canvas
      id="canvas"
      width="800"
      height="400"
      @mousedown="canvasDown"
      @mousemove="canvasMove"
      @mouseout="canvasUp"
      @mouseup="canvasUp"
    >
    </canvas>
  </div>
</template>

<script>
export default {
  data() {
    return {
      type: "huabi",
      isDraw: false,
      canvasDom: null,
      ctx: null,
      beginX: 0,
      beginY: 0,
      color: "#000",
      imageData: null,
    };
  },
  mounted() {
    this.canvasDom = document.getElementById("canvas");
    this.ctx = this.canvasDom.getContext("2d");
  },
  methods: {
    changeType(type) {
      this.type = type;
    },
    canvasDown(e) {
      this.isDraw = true;
      const canvas = this.canvasDom;
      this.beginX = e.pageX - canvas.offsetLeft;
      this.beginY = e.pageY - canvas.offsetTop;
    },
    canvasMove(e) {
      if (!this.isDraw) return;
      const canvas = this.canvasDom;
      const ctx = this.ctx;
      const x = e.pageX - canvas.offsetLeft;
      const y = e.pageY - canvas.offsetTop;
      this[`${this.type}Fn`](ctx, x, y);
    },
    canvasUp() {
      this.imageData = this.ctx.getImageData(0, 0, 800, 400);
      this.isDraw = false;
    },
    huabiFn(ctx, x, y) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
    },
    rectFn(ctx, x, y) {
      const beginX = this.beginX;
      const beginY = this.beginY;
      ctx.clearRect(0, 0, 800, 400);
      this.imageData && ctx.putImageData(this.imageData, 0, 0, 0, 0, 800, 400);
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.rect(beginX, beginY, x - beginX, y - beginY);
      ctx.stroke();
      ctx.closePath();
    },
    arcFn(ctx, x, y) {
      const beginX = this.beginX;
      const beginY = this.beginY;
      this.isDraw && ctx.clearRect(0, 0, 800, 400);
      this.imageData && ctx.putImageData(this.imageData, 0, 0, 0, 0, 800, 400);
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.arc(
        beginX,
        beginY,
        Math.round(
          Math.sqrt((x - beginX) * (x - beginX) + (y - beginY) * (y - beginY))
        ),
        0,
        2 * Math.PI
      );
      ctx.stroke();
      ctx.closePath();
    },
    saveImg() {
      const url = this.canvasDom.toDataURL();
      const a = document.createElement("a");
      a.download = "sunshine";
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    clear() {
        this.imageData = null
        this.ctx.clearRect(0, 0, 800, 400)
    }
  },
};
</script>

<style lang="scss" scoped>
#canvas {
  border: 1px solid black;
}
</style>
```
