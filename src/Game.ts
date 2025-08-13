import Phaser from "phaser";
import { ResultScreen } from "./ResultScreen";
import { HeaderUI } from "./HeaderUI";
import {
  CAR_DELTA_X,
  CAR_FRAMES,
  CAR_MOVE_TIME,
  CAR_START_Y,
  CHICKEN_START_X,
  CHICKEN_START_Y,
  COL_MONEY,
  COVER_DELTA_X,
  COVER_DELTA_Y,
  FENCE_DELTA_X,
  FENCE_DELTA_Y,
  FENCE_MOVE_TIME,
  PARTICLE_LIFETIME,
  PARTICLES_COUNT,
  ROAD_CELL_H,
  ROAD_CELL_W,
  ROAD_COLS,
  ROAD_ROWS,
  ROAD_START_X,
  ROTATE_WHEEL_TEXT,
  SIDEWALK_CELL_H,
  SIDEWALK_DELTA_X,
  SIDEWALK_ROWS,
  SIDEWALK_START_X,
  SLOTS_DATA,
  START_ATTEMPTS,
  WHEEL_ROTATE_DELAY,
  WHEEL_ROTATE_DURATION,
} from "./constants";
import { getScaleValue } from "./getScaleValue";

export default class MainGame extends Phaser.Scene {
  roadGroup: Phaser.GameObjects.Container;
  uiGroup: Phaser.GameObjects.Container;
  topBg: Phaser.GameObjects.Graphics;
  bottomBg: Phaser.GameObjects.Graphics;
  roadCols: Phaser.GameObjects.Container[];
  decorGroup: Phaser.GameObjects.Container;
  decorItems: Phaser.GameObjects.Sprite[];
  mcovers: Phaser.GameObjects.Container[];
  coversSprite: Phaser.GameObjects.Sprite[];
  coversText: Phaser.GameObjects.Text[];
  cars: Phaser.GameObjects.Sprite[];
  carsTween: Phaser.Tweens.Tween[];
  fences: Phaser.GameObjects.Sprite[];
  particlesEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  resultScreen: ResultScreen;
  headerUI: HeaderUI;
  goBtn: Phaser.GameObjects.Sprite;
  chicken: Phaser.GameObjects.Sprite;

  scaleValue: number;
  activeRoad: number;
  isJumping: boolean = false;


  preload() {
    this.load.atlas(
      "chicken",
      "assets/chicken_anim.png",
      "assets/chicken_anim.json"
    );
    this.load.atlas(
      "main",
      "assets/first_assets.png",
      "assets/first_assets.json"
    );
  }

  create() {
    this.scaleValue = getScaleValue(this);

    this.roadGroup = this.add.container();
    this.uiGroup= this.add.container();

    this.roadCols = [];
    this.mcovers = [];
    this.coversSprite = [];
    this.coversText = [];
    this.fences = [];
    this.cars = [];
    this.carsTween = [];
    this.activeRoad = 0;
    

    for (let i = 0; i < ROAD_COLS; i++) {
      this.roadCols[i] = this.add.container();
      this.mcovers[i] = this.add.container();
      this.mcovers[i].x = ROAD_START_X + i * ROAD_CELL_W;
      this.mcovers[i].y = COVER_DELTA_Y;
      this.coversSprite[i] = this.add
        .sprite(COVER_DELTA_X, 0, "main", "manhole_cover.png")
        .setOrigin(0, 0)
        .setScale(0.8);
      this.coversText[i] = this.add.text(COVER_DELTA_X+50,50,COL_MONEY[i]+"$").setOrigin(0.5,0.5);
      this.mcovers[i].add(this.coversSprite[i]);
      this.mcovers[i].add(this.coversText[i]);

      
      this.roadCols[i].x = ROAD_START_X + i * ROAD_CELL_W;

      this.roadGroup.add(this.roadCols[i]);
      this.roadGroup.add(this.mcovers[i]);

      for (let j = 0; j < ROAD_ROWS; j++) {
        this.roadCols[i].add(
          this.add
            .sprite(0, ROAD_CELL_H * j, "main", "road_texture.jpg")
            .setOrigin(0, 0)
        );
      }
    }

    this.decorGroup = this.add.container();

    this.roadGroup.add(this.decorGroup);

    for (let i = 0; i < 2; i++)
      for (let j = 0; j < SIDEWALK_ROWS; j++) {
        this.decorGroup.add(
          this.add
            .sprite(
              SIDEWALK_START_X +
                i * (SIDEWALK_DELTA_X + ROAD_CELL_W * ROAD_COLS),
              j * SIDEWALK_CELL_H,
              "main",
              "sidewalk_texture.png"
            )
            .setOrigin(0, 0)
        );
      }

    this.decorGroup.add(
      this.add.sprite(0, 0, "main", "city_2.png").setOrigin(0, 0)
    );
    this.decorGroup.add(
      this.add
        .sprite(
          ROAD_START_X + ROAD_CELL_W * ROAD_COLS - 48,
          0,
          "main",
          "city.png"
        )
        .setOrigin(0, 0)
    );

    for (let i = 0; i < ROAD_COLS; i++) {
      
      this.fences[i] = this.add
        .sprite(FENCE_DELTA_X + ROAD_CELL_W * i,-100, "main", "fence.png")
        .setOrigin(0, 0)
        .setScale(0.5);
      this.fences[i].visible = false;
     
      this.roadGroup.add(this.fences[i]);

    }

    this.chicken = this.add
      .sprite(CHICKEN_START_X, CHICKEN_START_Y, "chicken")
      .setOrigin(0, 0)
      .setScale(0.75);
    this.roadGroup.add(this.chicken);


    for (let i = 0; i < ROAD_COLS; i++) {
      this.cars[i] = this.add
        .sprite(
          CAR_DELTA_X + ROAD_CELL_W * i,
          CAR_START_Y,
          "main",
          CAR_FRAMES[Math.trunc(4 * Math.random())]
        )
        .setOrigin(0, 1)
        .setScale(0.8);
      
      this.roadGroup.add(this.cars[i]);
      

    }

    for (let i = 0; i < ROAD_COLS; i++)
    this.carsTween[i] = this.tweens.add({
        targets: this.cars[i],
        y: ROAD_CELL_H * ROAD_ROWS + 200,
        duration: CAR_MOVE_TIME,
        delay: Math.random() * 1000+500*i,
        onComplete: () => {
          this.onCarTweenComplete(i);
        },
      });

    

    // Создание анимации прыжка
    this.anims.create({
      key: "jump",
      frames: [
        { key: "chicken", frame: "chicken_Jump/chicken_frames1000.png" },
        { key: "chicken", frame: "chicken_Jump/chicken_frames1001.png" },
        { key: "chicken", frame: "chicken_Jump/chicken_frames1002.png" },
        { key: "chicken", frame: "chicken_Jump/chicken_frames1003.png" },
        { key: "chicken", frame: "chicken_Jump/chicken_frames1004.png" },
        { key: "chicken", frame: "chicken_Jump/chicken_frames1005.png" },
        { key: "chicken", frame: "chicken_Jump/chicken_frames1006.png" },
        { key: "chicken", frame: "chicken_Jump/chicken_frames1007.png" },
        { key: "chicken", frame: "chicken_Jump/chicken_frames1008.png" },
      ],
      frameRate: 12, // скорость анимации
      repeat: 0, // проиграть один раз (0 = один раз, -1 = бесконечно)
    });

    // Создание анимации ожидания
    this.anims.create({
      key: "idle",
      frames: [
        { key: "chicken", frame: "idle_chicen/chicken_frames2000.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2001.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2002.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2003.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2004.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2005.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2006.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2007.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2008.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2009.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2010.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2011.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2012.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2013.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2014.png" },
        { key: "chicken", frame: "idle_chicen/chicken_frames2015.png" },
      ],
      frameRate: 8, // скорость анимации (медленнее для idle)
      repeat: -1, // повторять бесконечно
    });

    this.anims.create({
      key: "coin",
      frames: [
        { key: "main", frame: "coin_flip.png" },
        { key: "main", frame: "coin.png" },
        
      ],
      frameRate: 6, // скорость анимации
      repeat: 0, // проиграть один раз (0 = один раз, -1 = бесконечно)
    });

    // Запуск анимации ожидания по умолчанию
    this.chicken.play("idle");

    this.goBtn = this.add.sprite(this.scale.width/2, 120+ROAD_CELL_H*ROAD_ROWS, "main", "go_button.png").setOrigin(0.5, 0).setScale(0.5);

     this.goBtn.setInteractive();
    
    // Обработчик клика
    this.goBtn.on('pointerdown', (pointer) => {
        
       this.onJump();
    });

    this.topBg = this.add.graphics();
    this.topBg.fillStyle(0x000000, 1);
    this.topBg.fillRect(0, 0, 2000, 100); // x, y, ширина, высота
    this.uiGroup.add(this.topBg);

    this.bottomBg = this.add.graphics();
    this.bottomBg.fillStyle(0x000000, 1);
    this.bottomBg.fillRect(0, 100+ROAD_CELL_H*ROAD_ROWS, 2000, 1000); // x, y, ширина, высота
    this.uiGroup.add(this.bottomBg);

    this.uiGroup.add(this.goBtn);
    this.roadGroup.y = 100;

    /*
        this.particlesEmitter = this.add.particles(
            this.scale.width / 2,
            this.scale.height / 2,
            "particle",
            {
                lifespan: PARTICLE_LIFETIME,
                speed: { min: 350, max: 600 },
                scale: { start: 1, end: 0 },
                emitting: false,
            }
        );

        this.createWeel();

        this.startButton = new StartButton(this, ROTATE_WHEEL_TEXT, () => {
            this.tryRotate();
        });

        const storageAttempts = localStorage.getItem("attempts");
        if (storageAttempts) this.attemtps = +storageAttempts;
        else this.attemtps = START_ATTEMPTS;

        this.headerUI = new HeaderUI(this, this.attemtps.toString());

        this.resultScreen = new ResultScreen(this);
        */
  }

  onJump() {
    
    if (this.isJumping || this.activeRoad>6)
        return;

    if (this.cars[this.activeRoad].y>0 && this.cars[this.activeRoad].y<ROAD_CELL_H * ROAD_ROWS + 200) return;

    this.isJumping = true;

    if (this.activeRoad>0)
    {
        this.coversSprite[this.activeRoad-1].play('coin');
        this.mcovers[this.activeRoad-1].setScale(0.8);
        
        this.mcovers[this.activeRoad-1].visible = true;
    }

    this.fences[this.activeRoad].visible = true;
    this.chicken.play('jump');
    const finalX = this.chicken.x + ROAD_CELL_W;
    const startY = this.chicken.y;
    const jumpHeight = 50;

    console.log("EL",this.carsTween[this.activeRoad].elapsed,this.carsTween[this.activeRoad].isStartDelayed());
    this.carsTween[this.activeRoad].stop();
    if (this.cars[this.activeRoad].y< FENCE_DELTA_Y)
    {
        this.carsTween[this.activeRoad] = this.tweens.add({
        targets:this.cars[this.activeRoad],
        y: FENCE_DELTA_Y,
        duration: FENCE_MOVE_TIME, 
        easy: 'Quart.easeOut',
        delay: (this.cars[this.activeRoad].y==CAR_START_Y)?Math.random()*500+100:100
    });
    }

    this.tweens.add({
        targets:this.fences[this.activeRoad],
        y: FENCE_DELTA_Y,
        duration: FENCE_MOVE_TIME, 
        easy: 'Quart.easeOut'
    });

    this.tweens.add({
        targets:this.chicken,
        x: finalX,
        duration: FENCE_MOVE_TIME, 
        onComplete: () => {
            this.isJumping = false;
            this.mcovers[this.activeRoad].visible = false;
            this.coversText[this.activeRoad].visible = false;
            this.activeRoad+=1;
            this.chicken.play('idle');
            
      },
    });

     this.tweens.add({
        targets: this.chicken,
        y: startY - jumpHeight, // поднимаемся
        duration: FENCE_MOVE_TIME / 2,
        ease: 'Power1',
        yoyo: true, // возвращаемся обратно
        repeat: 0,
        
    });
  }

  onCarTweenComplete(col: number) {

    if (col == this.activeRoad && this.isJumping) return;

    this.cars[col].y = CAR_START_Y;
    this.cars[col].setFrame(CAR_FRAMES[Math.trunc(Math.random() * 4)]);

    this.carsTween[col] = this.tweens.add({
      targets: this.cars[col],
      y: ROAD_CELL_H * ROAD_ROWS + 200,
      duration: CAR_MOVE_TIME,
      delay: Math.random() * 1000,
      onComplete: () => {
        // Рекурсивный вызов
        this.onCarTweenComplete(col);
      },
    });

    
  }

  startResultScreen(resSlot: number) {
    this.headerUI.moveOn();
    this.particlesEmitter.stop();

    if (resSlot >= 0) {
      this.resultScreen.showResult(
        SLOTS_DATA[resSlot].sprite,
        SLOTS_DATA[resSlot].text
      );
    } else {
      this.resultScreen.showFinal();
    }
  }
}
