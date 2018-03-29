import Player from './player/index'
import Enemy from './npc/enemy'
import BackGround from './runtime/background'
import GameInfo from './runtime/gameinfo'
import Music from './runtime/music'
import DataBus from './databus'

let ctx = canvas.getContext('2d')
let databus = new DataBus()
let BlockImg=new Image()
let arr = new Array(10);   //表格有10行  
for (var i = 0; i < 10; i++) {
  arr[i] = new Array(100);    //每行有10列  
}
let arrClick = new Array(10);   //表格有10行  
for (var i = 0; i < 10; i++) {
  arrClick[i] = new Array(100);    //每行有10列  
}
var ClickNum=new Array(10)

let size = 4
let times = 2
let StartX=100
let StartY=100
let SIZE=60
var ShowNum = 0
var NowShow = 0
var Init=0
/**
 * 游戏主函数
 */

var Stage=1

export default class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.aniId = 0

    this.restart()
    BlockImg.src = 'images/2222.png'
  }

  restart() {
    databus.reset()
    
    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )

    this.bg = new BackGround(ctx)
    this.player = new Player(ctx)
    this.gameinfo = new GameInfo()
    this.music = new Music()

    this.bindLoop = this.loop.bind(this)
    this.hasEventBind = false


    
    Stage=1
    for (let k=0;k<=times;k++){
      ClickNum[k]=0
    }
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        for (let k = 0; k <= times; k++) {
          if (Math.random() > 0.5) {
            arr[i][j+k*size] = 0
          } else {
            arr[i][j+k*size] = 1
            ClickNum[k]++
          }
          arrClick[i][j+k*size]=0
          // console.log(arr[i][j][k])
        }
      }
    }


    this.initEvent()
    
    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId);
    
    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  initEvent() {
    canvas.addEventListener('touchstart', ((e) => {
      e.preventDefault()

      let x = e.touches[0].clientX
      let y = e.touches[0].clientY

      // //
      // if ( this.checkIsFingerOnAir(x, y) ) {
      //   this.touched = true

      //   this.setAirPosAcrossFingerPosZ(x, y)
      // }
      if(Stage==2){
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            if (x < StartX + (i + 1) * SIZE && x >= StartX + i * SIZE &&
             y < StartY + (j + 1) * SIZE && y > StartY + j * SIZE) {
              arrClick[i][j+size*NowShow] = 1
              if (ClickNum[NowShow] <= ShowNum) {
                console.log(NowShow, Stage, ShowNum)
                NowShow += 1
                ShowNum = 0
                if (NowShow > times) {
                  Stage = 3
                }
              }
              ShowNum += 1
            }
          }
        }
        

      }

      this.touched = true

    }).bind(this))

    canvas.addEventListener('touchmove', ((e) => {
      e.preventDefault()

      // let x = e.touches[0].clientX
      // let y = e.touches[0].clientY

      // if ( this.touched )
      //   this.setAirPosAcrossFingerPosZ(x, y)

    }).bind(this))

    canvas.addEventListener('touchend', ((e) => {
      e.preventDefault()

      // let x = e.touches[0].clientX
      // let y = e.touches[0].clientY
      // // log(x,y)
      // for (let i =0;i<4;i++){
      //   for(let j=0;j<4;j++){
      //     if(x<100+(i+1)*40 && x>=100+i*40 && y<100+(j+1)*40 && y>100+j*40){
      //       arr[i][j]=0
      //     }
      //   }
      // }
      // disappear(x,y)

      this.touched = false

    }).bind(this))
  }


  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    if (databus.frame % 30 === 0) {
      let enemy = databus.pool.getItemByClass('enemy', Enemy)
      enemy.init(6)
      databus.enemys.push(enemy)
    }
  }

  // 全局碰撞检测
  collisionDetection() {
    let that = this

    databus.bullets.forEach((bullet) => {
      for (let i = 0, il = databus.enemys.length; i < il; i++) {
        let enemy = databus.enemys[i]

        if (!enemy.isPlaying && enemy.isCollideWith(bullet)) {
          enemy.playAnimation()
          // that.music.playExplosion()

          bullet.visible = false
          databus.score += 1

          break
        }
      }
    })

    for (let i = 0, il = databus.enemys.length; i < il; i++) {
      let enemy = databus.enemys[i]

      if (this.player.isCollideWith(enemy)) {
        databus.gameOver = true

        break
      }
    }
  }

  // 游戏结束后的触摸事件处理逻辑
  touchEventHandler(e) {
    e.preventDefault()

    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnArea

    if (x >= area.startX
      && x <= area.endX
      && y >= area.startY
      && y <= area.endY)
      this.restart()
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.bg.render(ctx)

    // databus.bullets
    //   .concat(databus.enemys)
    //   .forEach((item) => {
    //     item.drawToCanvas(ctx)
    //   })

    // this.player.drawToCanvas(ctx)
    databus.blocks.forEach((item)=>{
      item.drawToCanvas(ctx)
    })
    // for (let i = 0; i < size; i++) {
    //   for (let j = 0; j < size; j++) {
    //     for (let k = 0; k <= times; k++) {
    //       console.log(arr[i][j][k])
    //     }
    //   }
    // }
    if(Stage==1){
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {

          ctx.beginPath();
          ctx.moveTo(StartX + i * SIZE, StartY + j * SIZE);
          ctx.lineTo(StartX + i * SIZE + SIZE, StartY + j * SIZE);
          ctx.lineTo(StartX + i * SIZE + SIZE, StartY + j * SIZE + SIZE);
          ctx.lineTo(StartX + i * SIZE, StartY + j * SIZE + SIZE)
          ctx.closePath();
          ctx.stroke();

          if (arr[i][j+NowShow*size] == 1) {
            ctx.drawImage(
              BlockImg,
              StartX + i * SIZE,
              StartY + j * SIZE,
              SIZE,
              SIZE
            )

          }
          // console.log('======')
          // console.log(arr[i][j][NowShow])
          
          if(ShowNum>90){
            console.log(ShowNum,NowShow)
            NowShow++
            ShowNum=0
          }
          if(NowShow>times){
            Stage = 2
            NowShow = 0
            ShowNum=0
          }
        }
      }
      ShowNum++
    }


    if (Stage == 2) {
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {

          ctx.beginPath();
          ctx.moveTo(StartX + i * SIZE, StartY + j * SIZE);
          ctx.lineTo(StartX + i * SIZE + SIZE, StartY + j * SIZE);
          ctx.lineTo(StartX + i * SIZE + SIZE, StartY + j * SIZE + SIZE);
          ctx.lineTo(StartX + i * SIZE, StartY + j * SIZE + SIZE)
          ctx.closePath();
          ctx.stroke();

          if (arrClick[i][j + NowShow * size] == 1) {
            ctx.drawImage(
              BlockImg,
              StartX + i * SIZE,
              StartY + j * SIZE,
              SIZE,
              SIZE
            )

          }
          // console.log('======')
          // console.log(arr[i][j][NowShow])



        }
      }
    }


    
    databus.animations.forEach((ani) => {
      if (ani.isPlaying) {
        ani.aniRender(ctx)
      }
    })

    // this.gameinfo.renderGameScore(ctx, databus.score)

    // 游戏结束停止帧循环
    if (databus.gameOver) {
      this.gameinfo.renderGameOver(ctx, databus.score)

      if (!this.hasEventBind) {
        this.hasEventBind = true
        this.touchHandler = this.touchEventHandler.bind(this)
        canvas.addEventListener('touchstart', this.touchHandler)
      }
    }
  }

  // 游戏逻辑更新主函数
  update() {
    if (databus.gameOver)
      return;

    this.bg.update()
    let ans=0
    for(let i =0;i<size;i++){
      for (let j =0;j<size;j++){
        if(arr[i][j]==1){
          ans=1
          break
        }
      }
    }
    if(ans==0){
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (Math.random() > 0.5) {
            arr[i][j] = 0
          } else {
            arr[i][j] = 1
          }
        }
      }
    }

    // databus.bullets
    //   .concat(databus.enemys)
    //   .forEach((item) => {
    //     item.update()
    //   })

    // this.enemyGenerate()

    // this.collisionDetection()

    // if (databus.frame % 20 === 0) {
    //   this.player.shoot()
    //   this.music.playShoot()
    // }
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++

    this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
}
