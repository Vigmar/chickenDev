import Phaser from "phaser";

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
  ROAD_CELL_H,
  ROAD_CELL_W,
  ROAD_COLS,
  ROAD_ROWS,
  ROAD_START_X,
  SIDEWALK_CELL_H,
  SIDEWALK_DELTA_X,
  SIDEWALK_ROWS,
  SIDEWALK_START_X,
} from "./constants";
import { getScaleValue } from "./getScaleValue";

const chickenMult = [2, 4, 14, 29, 84, 209, 709];
const coversSprites = ["1", "2", "3", "4", "5", "6", "7"];
const coversText = [50000, 100000, 250000, 375000, 1375000, 12500000, 25000000];

export default class MainGame extends Phaser.Scene {
  roadGroup: Phaser.GameObjects.Container;
  uiGroup: Phaser.GameObjects.Container;
  gameContainer: Phaser.GameObjects.Container;
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
  cracks: Phaser.GameObjects.Sprite[];
  particlesEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  goBtn: Phaser.GameObjects.Sprite;

  tutorialText: Phaser.GameObjects.Sprite;
  tutorialHand: Phaser.GameObjects.Sprite;
  tutorialWheel: Phaser.GameObjects.Sprite;
  handTween: Phaser.Tweens.Tween;
  wheelTween: Phaser.Tweens.Tween;
  uiPanel: Phaser.GameObjects.Sprite;
  headerSprite: Phaser.GameObjects.Sprite;
  headerLogo: Phaser.GameObjects.Sprite;

  cover: Phaser.GameObjects.Rectangle;
  coinEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  loseEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  endEffectAnim: Phaser.GameObjects.Sprite;
  endPanel: Phaser.GameObjects.Sprite;
  endPanelContainer: Phaser.GameObjects.Container;
  endEffectTween: Phaser.Tweens.Tween;
  endPanelTween: Phaser.Tweens.Tween;
  endPanelTweenBounce: Phaser.Tweens.Tween;
  pushSprite: Phaser.GameObjects.Sprite;
  pushTimeline: Phaser.Tweens.Tween;

  headBalance: Phaser.GameObjects.Container;
  cashBalance: Phaser.GameObjects.Container;
  onlineText: Phaser.GameObjects.Container;
  onlineSprite: Phaser.GameObjects.Sprite;
  usernameSprite: Phaser.GameObjects.Sprite;
  soundIcon: Phaser.GameObjects.Sprite;
  roadSound: Phaser.Sound.BaseSound;

  chicken: Phaser.GameObjects.Sprite;
  chickenBalance: Phaser.GameObjects.Container;
  chickenContainer: Phaser.GameObjects.Container;

  moneyAddContainer: Phaser.GameObjects.Container;
  moneyAddBG: Phaser.GameObjects.Sprite;
  bankUI1: Phaser.GameObjects.Sprite;
  bankUI2: Phaser.GameObjects.Sprite;
  bankUI3: Phaser.GameObjects.Sprite;
  chicon1: Phaser.GameObjects.Sprite;
  chicon2: Phaser.GameObjects.Sprite;
  chicon3: Phaser.GameObjects.Sprite;
  chicon4: Phaser.GameObjects.Sprite;
  moneyBalance: Phaser.GameObjects.Container;

  finalContainer: Phaser.GameObjects.Container;
  finalBG: Phaser.GameObjects.Sprite;
  finalHeader: Phaser.GameObjects.Sprite;
  finalFooter: Phaser.GameObjects.Sprite;
  finalArca: Phaser.GameObjects.Sprite;
  finalChicken: Phaser.GameObjects.Sprite;
  finalCoin1: Phaser.GameObjects.Sprite;
  finalCoin2: Phaser.GameObjects.Sprite;
  finalBtn: Phaser.GameObjects.Sprite;
  finalFlag: Phaser.GameObjects.Sprite;
  moneys: Phaser.GameObjects.Sprite[];

  isPort: boolean;
  centerX: number;
  scaleValue: number;
  activeRoad: number;
  balance: number = 0;
  isJumping: boolean = false;

  isSoundEnable: boolean = true;
  isResult: boolean = false;
  isRotating: boolean = false;
  wheelRound: number = 0;
  gameRound: number = 0;

  preload() {
    this.load.audio("jump", "sounds/01_jump.mp3");
    this.load.audio("win", "sounds/02_win.mp3");
    this.load.audio("bank1", "sounds/03_bank1.mp3");
    this.load.audio("bank3", "sounds/03_bank3.mp3");
    this.load.audio("beep", "sounds/06_beep.mp3");
    this.load.audio("chicken", "sounds/05_noise.mp3");
    this.load.audio("road", "sounds/roadamb.mp3");

    this.load.image("packshot_arca", "/assets/packshot_arca.png");
    this.load.image("bg4", "/assets/background_4.png");
    this.load.image("bg3", "/assets/background_3.png");

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

    
    this.load.atlas(
      "ui",
      "assets/second_assets.png",
      "assets/second_assets.json"
    );
  }

  create() {
    this.scaleValue = getScaleValue(this);
    this.isPort = this.scale.width < this.scale.height;
    this.sound.volume = 0.4;

    //this.cameras.main.setViewport(0, 0, 800, 1200); // x, y, width, height

    this.gameContainer = this.add.container();

    this.roadGroup = this.add.container();
    this.uiGroup = this.add.container();

    this.gameContainer.add(this.roadGroup);
    this.gameContainer.add(this.uiGroup);

    this.gameContainer.setScale(this.scale.height / 900);

    const uiCamera = this.cameras
      .add(0, 0, this.scale.width, this.scale.height)
      .setScroll(0, 0) // Не двигается
      .setZoom(1)
      .setName("uiCamera");

    // Убираем фон у UI-камеры, чтобы не перекрывало основное;

    uiCamera.transparent = true;

    // Добавляем uiGroup в эту камеру
    uiCamera.ignore(this.roadGroup); // Основная сцена — не рисуем в UI камере

    // Основная камера игнорирует UI
    this.cameras.main.ignore(this.uiGroup);
    this.cameras.main.roundPixels = true;

    this.roadCols = [];
    this.mcovers = [];
    this.coversSprite = [];
    this.coversText = coversText;
    this.fences = [];
    this.cracks = [];
    this.cars = [];
    this.carsTween = [];
    this.activeRoad = 0;

    for (let i = 0; i < ROAD_COLS; i++) {
      this.roadCols[i] = this.add.container();
      this.mcovers[i] = this.add.container();
      this.mcovers[i].x = ROAD_START_X + i * ROAD_CELL_W;
      this.mcovers[i].y = COVER_DELTA_Y;
      this.coversSprite[i] = this.add
        .sprite(COVER_DELTA_X, 0, "main", "covers/" + coversSprites[i] + ".png")
        .setOrigin(0, 0)
        .setScale(0.8);
      /*
      this.coversText[i] = this.add
        .text(COVER_DELTA_X + 50, 50, COL_MONEY[i] + "$")
        .setOrigin(0.5, 0.5);
        */
      this.mcovers[i].add(this.coversSprite[i]);
      //this.mcovers[i].add(this.coversText[i]);

      this.roadCols[i].x = ROAD_START_X + i * ROAD_CELL_W;

      this.roadGroup.add(this.roadCols[i]);
      this.roadGroup.add(this.mcovers[i]);

      for (let j = 0; j < ROAD_ROWS; j++) {
        this.roadCols[i].add(
          this.add
            .sprite(0, ROAD_CELL_H * j, "main", "road_texture.png")
            .setOrigin(0, 0)
        );
      }
    }

    this.decorGroup = this.add.container();

    this.roadGroup.add(this.decorGroup);

    /*
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
      */

    /*
    for (let j = 0; j < SIDEWALK_ROWS; j++) {
      this.decorGroup.add(
        this.add
          .sprite(
            SIDEWALK_START_X +
              (SIDEWALK_DELTA_X + ROAD_CELL_W * ROAD_COLS) +
              272,
            j * SIDEWALK_CELL_H,
            "main",
            "sidewalk_texture.png"
          )
          .setOrigin(0, 0)
      );
    }
      */

    this.decorGroup.add(
      this.add.sprite(0, 0, "main", "city.png").setOrigin(0, 0).setScale(1.5)
    );

    this.decorGroup.add(
      this.add
        .sprite(ROAD_START_X + ROAD_CELL_W * ROAD_COLS, 0, "main", "city.png")
        .setOrigin(0, 0)
        .setScale(1.5)
    );
    this.decorGroup.add(
      this.add
        .sprite(
          ROAD_START_X + ROAD_CELL_W * ROAD_COLS - 10,
          0,
          "main",
          "city.png"
        )
        .setOrigin(0, 0)
        .setScale(1.5)
        .setFlipX(true)
    );

    this.decorGroup.add(
      this.add
        .sprite(
          ROAD_START_X + ROAD_CELL_W * ROAD_COLS - 10 + 300,
          0,
          "main",
          "city.png"
        )
        .setOrigin(0, 0)
        .setScale(1.5)
    );

    this.chicken = this.add
      .sprite(0, 0, "chicken")
      .setOrigin(0, 0)
      .setScale(0.6);

    this.chickenBalance = this.createRouletteCounter(
      70,
      180,
      0.5,
      0,
      0,
      0,
      true
    );

    this.chickenContainer = this.add.container(
      CHICKEN_START_X,
      CHICKEN_START_Y
    );
    this.chickenContainer.add(this.chicken);
    this.chickenContainer.add(this.chickenBalance);

    

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

    for (let i = 0; i < ROAD_COLS; i++) {
      this.fences[i] = this.add
        .sprite(FENCE_DELTA_X + ROAD_CELL_W * i, -100, "main", "fence.png")
        .setOrigin(0, 0)
        .setScale(0.5);
      this.fences[i].visible = false;

      this.cracks[i] = this.add
        .sprite(
          FENCE_DELTA_X + ROAD_CELL_W * i + 50,
          FENCE_DELTA_Y + 45,
          "main",
          "crack.png"
        )
        .setOrigin(0.5, 0.5)
        .setScale(0);

      this.roadGroup.add(this.cracks[i]);
      this.roadGroup.add(this.fences[i]);
    }

    this.roadGroup.add(this.chickenContainer);

    for (let i = 0; i < ROAD_COLS; i++)
      this.carsTween[i] = this.tweens.add({
        targets: this.cars[i],
        y: ROAD_CELL_H * ROAD_ROWS + 200,
        duration: CAR_MOVE_TIME,
        delay: Math.random() * 500 + 500 * i,
        onComplete: () => {
          this.onCarTweenComplete(i);
        },
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

    this.anims.create({
      key: "coin",
      frames: [
        { key: "main", frame: "coin_flip.png" },
        { key: "main", frame: "coin.png" },
      ],
      frameRate: 6, // скорость анимации
      repeat: 0, // проиграть один раз (0 = один раз, -1 = бесконечно)
    });

    this.anims.create({
      key: "wineffect",
      frames: [
        {
          key: "main",
          frame: "you_win_effect_frames/you_win_effect_frames000.png",
        },
        {
          key: "main",
          frame: "you_win_effect_frames/you_win_effect_frames001.png",
        },
        {
          key: "main",
          frame: "you_win_effect_frames/you_win_effect_frames002.png",
        },
        {
          key: "main",
          frame: "you_win_effect_frames/you_win_effect_frames003.png",
        },
        {
          key: "main",
          frame: "you_win_effect_frames/you_win_effect_frames004.png",
        },
        {
          key: "main",
          frame: "you_win_effect_frames/you_win_effect_frames005.png",
        },
        {
          key: "main",
          frame: "you_win_effect_frames/you_win_effect_frames006.png",
        },
      ],
      frameRate: 15, // скорость анимации
      repeat: 0, // проиграть один раз (0 = один раз, -1 = бесконечно)
    });

    this.anims.create({
      key: "loseeffect",
      frames: [
        { key: "main", frame: "animation_lose/feather_frames000.png" },
        { key: "main", frame: "animation_lose/feather_frames001.png" },
        { key: "main", frame: "animation_lose/feather_frames002.png" },
        { key: "main", frame: "animation_lose/feather_frames003.png" },
        { key: "main", frame: "animation_lose/feather_frames004.png" },
        { key: "main", frame: "animation_lose/feather_frames005.png" },
        { key: "main", frame: "animation_lose/feather_frames006.png" },
      ],
      frameRate: 15, // скорость анимации
      repeat: 0, // проиграть один раз (0 = один раз, -1 = бесконечно)
    });

    // Запуск анимации ожидания по умолчанию
    this.chicken.play("idle");

    this.centerX = (0.5 * this.scale.width * 900) / this.scale.height;

    this.uiPanel = this.add
      .sprite(
        this.centerX,
        100 * !this.isPort + 10 + ROAD_CELL_H * ROAD_ROWS,
        "main",
        this.isPort ? "ui_panel_2.png" : "ui_panel.png"
      )
      .setOrigin(0.5, 0)
      .setScale(this.isPort ? 0.8 : 1.2);

    this.goBtn = this.add
      .sprite(
        this.centerX + 30 + 140 * !this.isPort,
        150 + ROAD_CELL_H * ROAD_ROWS,
        "main",
        this.isPort ? "go_button_2.png" : "go_button.png"
      )
      .setOrigin(0, 0.5);

    this.goBtn.setInteractive();

    // Обработчик клика
    this.goBtn.on("pointerdown", (pointer) => {
      if (this.activeRoad < 7) {
        this.tutorialHand.visible = false;
        this.onJump();
      } else {
        this.startMoneyAddScreen();
      }
    });

    this.headerSprite = this.add
      .sprite(this.centerX - 80, 20, "main", "header.png")
      .setOrigin(1, 0)
      .setScale(1.2);

    this.headBalance = this.createRouletteCounter(
      this.centerX - 220,
      43,
      0.3,
      0,
      0,
      0
    );

    this.headerLogo = this.add
      .sprite(this.centerX, 20, "main", "logo.png")
      .setOrigin(0.5, 0)
      .setScale(0.5);

    this.soundIcon = this.add
      .sprite(5, this.scale.height - 5, "main", "sound_button.png")
      .setOrigin(0, 1)
      .setScale(0.5);

    this.soundIcon.setInteractive();

    this.soundIcon.on("pointerdown", (pointer) => {
      this.isSoundEnable = !this.isSoundEnable;
      if (this.isSoundEnable) {
        this.roadSound.play({
          loop: true,
        });
        this.soundIcon.setTexture("main", "sound_button.png");
      } else {
        this.roadSound.stop();
        this.soundIcon.setTexture("main", "sound_button_off.png");
      }
    });

    this.topBg = this.add.graphics();
    this.topBg.fillStyle(0x181a39, 1);
    this.topBg.fillRect(0, 0, 2000, 100); // x, y, ширина, высота
    if (this.isPort) this.topBg.visible = false;
    this.uiGroup.add(this.topBg);

    this.bottomBg = this.add.graphics();
    this.bottomBg.fillStyle(0x181a39, 1);
    this.bottomBg.fillRect(
      0,
      100 * !this.isPort + ROAD_CELL_H * ROAD_ROWS,
      2000,
      1000
    ); // x, y, ширина, высота
    this.uiGroup.add(this.bottomBg);

    this.uiGroup.add(this.uiPanel);
    this.uiGroup.add(this.goBtn);

    this.uiGroup.add(this.headerSprite);
    this.uiGroup.add(this.headBalance);
    this.uiGroup.add(this.headerLogo);

    if (this.isPort) {
      this.headBalance.visible = false;
      this.headerSprite.visible = false;
      this.headerLogo.visible = false;
    }

    //this.uiGroup.add(this.soundIcon);
    this.roadGroup.y = this.isPort ? 0 : 100;

    if (this.scale.width > this.scale.height) {
      this.roadGroup.setScale(1.5);
      this.roadGroup.y = -100;
    }

    /*
    this.cover = this.add
      .rectangle(
        this.cameras.main.width / 2, // x (центр)
        this.cameras.main.height / 2, // y (центр)
        10 * this.cameras.main.width, // ширина
        10 * this.cameras.main.height, // высота
        0x000000, // цвет (любой, мы сделаем прозрачным)
        0.5 // альфа = 0 → полностью прозрачный
      )
      .setOrigin(0.5)

      .setScrollFactor(0); // чтобы не двигался с камерой (опционально)

    this.uiGroup.add(this.cover);
    */

    const tutorialScale =
      this.scale.width > this.scale.height
        ? 1
        : this.scale.width / this.scale.height;

    this.onMainGameplayStart();

    this.roadSound = this.sound.add("road");

    if (this.isSoundEnable)
      this.roadSound.play({
        loop: true,
      });

    //this.startMoneyAddScreen();
    //this.startFinalScreen(true);
    //this.startPush();
    this.startPromoScreen();
    this.scale.on("resize", this.resizeGame, this);
  }

  update()
  {

    if (this.chickenContainer && 
      this.activeRoad > 0 && this.scale.width < this.scale.height)
      {
           const bounds = this.chickenContainer.getBounds();
    const worldX = bounds.centerX+50; // мировая X-координата центра объекта

        this.cameras.main.scrollX = worldX - this.cameras.main.width / 2;
      }
          
  }

  onMainGameplayStart() {
    this.tutorialHand = this.add
      .sprite(this.centerX, 250, "ui", "tutor_hand.png")
      .setAngle(-45)
      .setScale(0.8);

    this.uiGroup.add(this.tutorialHand);

    this.tutorialHand.x = this.goBtn.x + 50;
    this.tutorialHand.y = this.goBtn.y + 50;
    this.tutorialHand.visible = true;

    this.handTween = this.tweens.add({
      targets: this.tutorialHand,
      x: this.tutorialHand.x - 30,
      y: this.tutorialHand.y - 30,
      duration: 700, // 0.5 секунды до точки
      ease: "Sine.easeInOut", // плавное ускорение/замедление
      yoyo: true, // возвращается обратно
      repeat: -1, // бесконечно (или поставь число повторений)
      // repeat: 3,                     // например, 3 раза туда-обратно
    });

    //this.cover.visible = false;

    this.activeRoad = 0;
  }

  resizeGame() {
    this.gameContainer.setScale(this.scale.height / 900);
    this.centerX = (0.5 * this.scale.width * 900) / this.scale.height;

    this.isPort = this.scale.width < this.scale.height;

    if (!this.isPort) {
      this.roadGroup.setScale(1.5);
      this.roadGroup.y = -100;
    } else {
      this.roadGroup.y = 100;
      this.roadGroup.setScale(1);
    }

    this.uiPanel.x = this.centerX;
    this.goBtn.x = this.centerX + 150;

    this.headBalance.x = this.centerX + 30;
    this.headerSprite.x = this.centerX;

    const tutorialScale =
      this.scale.width > this.scale.height
        ? 1
        : this.scale.width / this.scale.height;

    //if (this.tutorialHand.visible)
    {
      this.tutorialHand.x = this.centerX + 330;
      this.tutorialHand.setScale(tutorialScale);

      this.handTween = this.tweens.add({
        targets: this.tutorialHand,
        x: this.tutorialHand.x - 70,
        y: this.tutorialHand.y - 70,
        duration: 700, // 0.5 секунды до точки
        ease: "Sine.easeInOut", // плавное ускорение/замедление
        yoyo: true, // возвращается обратно
        repeat: -1, // бесконечно (или поставь число повторений)
      });
    }

    this.headBalance.visible = !this.isPort;
    this.headerSprite.visible = !this.isPort;
    this.headerLogo.visible = !this.isPort;
  }

  moveFB() {
    const finalX = this.chickenContainer.x + 30;
    this.chicken.play("jump");

    this.tweens.add({
      targets: this.chickenContainer,
      x: finalX,
      duration: 200,
      ease: "Sine.easeInOut", // плавное ускорение/замедление
      yoyo: true, // возвращается обратно
      repeat: 0, // бесконечно (или поставь число повторений)
      onComplete: () => {
        this.isJumping = false;
      },
    });
    this.isJumping = true;
  }

  onJump() {
    if (this.isJumping || this.activeRoad > 8) return;

    if (
      this.cars[this.activeRoad].y > 0 &&
      this.cars[this.activeRoad].y < ROAD_CELL_H * ROAD_ROWS
    ) {
      this.moveFB();
      return;
    }

    this.isJumping = true;

    if (this.activeRoad > 0) {
      this.roadGroup.remove(this.mcovers[this.activeRoad - 1]);
      this.roadGroup.add(this.mcovers[this.activeRoad - 1]);
      this.roadGroup.remove(this.chickenContainer);
      this.roadGroup.add(this.chickenContainer);

      this.mcovers[this.activeRoad - 1].setScale(0.8);

      //this.mcovers[this.activeRoad - 1].visible = true;
    }

    this.fences[this.activeRoad].visible = true;

    const finalX = this.chickenContainer.x + ROAD_CELL_W;
    const startY = this.chickenContainer.y;
    const jumpHeight = 50;

    if (this.isSoundEnable) this.sound.play("jump");

    if (this.activeRoad < 8) {
      this.chicken.play("jump");

      this.tweens.add({
        targets: this.fences[this.activeRoad],
        y: FENCE_DELTA_Y,
        duration: FENCE_MOVE_TIME,
        easy: "Quart.easeOut",
      });

      this.tweens.add({
        targets: this.cracks[this.activeRoad],
        scale: 0.6,
        duration: FENCE_MOVE_TIME,
        easy: "Quart.easeOut",
      });

      this.carsTween[this.activeRoad].stop();

      //if (this.cars[this.activeRoad].y < FENCE_DELTA_Y)

      {
        this.carsTween[this.activeRoad].stop();
        this.cars[this.activeRoad].y = -200;
        this.carsTween[this.activeRoad] = this.tweens.add({
          targets: this.cars[this.activeRoad],
          y: FENCE_DELTA_Y,
          duration: FENCE_MOVE_TIME * 2,
          easy: "Quart.easeOut",
          repeat: 0,
          delay:
            this.cars[this.activeRoad].y == CAR_START_Y
              ? Math.random() * 500
              : 100,
        });
      }
      /*
      else {
        this.carsTween[this.activeRoad].stop();
        this.cars[this.activeRoad].y = -200;

        this.carsTween[this.activeRoad] = this.tweens.add({
          targets: this.cars[this.activeRoad],
          y: ROAD_CELL_H * ROAD_ROWS + 200,
          duration: FENCE_MOVE_TIME + 500,
          onComplete: () => {
            // this.onCarTweenComplete(this.activeRoad);
          },
        });
      }
      */
    }

    this.tweens.add({
      targets: this.chickenContainer,
      x: finalX,
      duration: FENCE_MOVE_TIME,
      onComplete: () => {
        this.isJumping = false;
        this.mcovers[this.activeRoad].visible = false;
        //this.coversText[this.activeRoad].visible = false;

        this.activeRoad += 1;

        this.chickenContainer.remove(this.chickenBalance);
        this.chickenBalance.destroy();
        this.chickenBalance = this.createRouletteCounter(
          this.activeRoad>5?50:70,
          180,
          0.5,
          this.activeRoad == 1 ? 0 : chickenMult[this.activeRoad - 2],
          chickenMult[this.activeRoad - 1],
          300,
          true
          
        );

        this.chickenContainer.add(this.chickenBalance);

        this.tutorialHand.visible = true;
        this.headBalance.destroy();
        if (this.cashBalance && this.cashBalance.active)
          this.cashBalance.destroy();

        this.cashBalance = this.createRouletteCounter(
          this.goBtn.x - 110 - this.isPort * 20,
          this.goBtn.y + 5 + 5 * this.isPort,
          0.3,
          this.activeRoad == 1 ? 0 : this.coversText[this.activeRoad - 2],
          this.coversText[this.activeRoad - 1],
          1000,
          false,
          "yellow"
        );
        this.headBalance = this.createRouletteCounter(
          this.centerX - 230,
          43,
          0.3,
          this.activeRoad == 1 ? 0 : this.coversText[this.activeRoad - 2],
          this.coversText[this.activeRoad - 1],
          1000
        );
        this.uiGroup.add(this.cashBalance);
        this.uiGroup.add(this.headBalance);

        if (this.isPort) this.headBalance.visible = false;

        if (this.activeRoad < 7) this.chicken.play("idle");
        else {
          this.goBtn.setTexture(
            "main",
            this.isPort ? "cashout_2.png" : "cashout.png"
          );
        }
      },
    });

    const tutorialScale =
      this.scale.width > this.scale.height
        ? 1
        : this.scale.width / this.scale.height;

    const cameraX = this.cameras.main.scrollX + ROAD_CELL_W/tutorialScale;

    
    if (
      this.activeRoad > 0 &&
      (ROAD_START_X + ROAD_CELL_W * ROAD_COLS - this.chickenContainer.x >
        this.scale.width - 300 ||
        this.scale.width < this.scale.height)
    )
    {
      

    }
    /*
      this.tweens.add({
        targets: this.cameras.main,
        scrollX: cameraX,
        duration: FENCE_MOVE_TIME,
      });
      */
    
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
        this.onCarTweenComplete(col);
      },
    });
  }

  startCoinEffect(x, y) {
    this.coinEmitter = this.add.particles(x, y, "main", {
      anim: "coin",
      quantity: 1,
      speed: { min: 500, max: 600 },
      angle: { min: 0, max: 360 },
      gravityY: 0,
      scale: { start: 0.5, end: 1 },
      lifespan: 900,
    });

    this.uiGroup.add(this.coinEmitter);

    this.coinEmitter.flow(50, 5);
    this.time.delayedCall(500, () => {
      this.coinEmitter.stop();
    });
  }

  startWinEffect(x, y, round = 0) {
    if (this.isSoundEnable) this.sound.play("win");

    if (this.gameRound == 2) this.startPush();

    this.time.delayedCall(150, () => {
      //this.startCoinEffect(x,y);
      this.startEndPanel(this.centerX, 425);
    });
  }

  startEndPanelTweens() {
    this.endPanelTweenBounce = this.tweens.add({
      targets: this.endPanelContainer,
      angle: -3,
      duration: 3000, // 0.5 секунды до точки
      ease: "Sine.easeInOut", // плавное ускорение/замедление
      yoyo: true, // возвращается обратно
      repeat: -1, // бесконечно (или поставь число повторений)
      // repeat: 3,                     // например, 3 раза туда-обратно
    });

    /*
    this.endPanelTween = this.tweens.add({
      targets: this.endPanelContainer,
      angle: 5,
      duration: 500,
      ease: "Sine.easeInOut",
      onComplete: () => {
        
      },

      // repeat: 4,            // Или задай число циклов (например, 4 раза туда-обратно)
      // delay: 100,           // Задержка между повторами (если нужно)
    });

    
    this.endPanelTween = this.tweens.add({
      targets: this.endPanelContainer,
      angle: -5,
      duration: 1000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
      // repeat: 4,            // Или задай число циклов (например, 4 раза туда-обратно)
      // delay: 100,           // Задержка между повторами (если нужно)
    });
    */
  }

  startPush() {
    const scalePush =
      this.scale.width < this.scale.height
        ? this.scale.width / this.gameContainer.scale / 700
        : 0.8;

    this.pushSprite = this.add
      .sprite(this.centerX, 50 + 30 * scalePush, "ui", "push_europe.png")
      .setOrigin(0.5, 0.5)
      .setScale(0);

    this.uiGroup.add(this.pushSprite);

    this.tweens.add({
      targets: this.pushSprite,
      scale: 1 * scalePush,
      duration: 150,
      easy: "Quart.easeOut",
      onComplete: () => {
        const scale1 = this.tweens.add({
          targets: this.pushSprite,
          scale: 0.8 * scalePush,
          duration: 110,
          easy: "Quart.easeOut",
          onComplete: () => {
            const scale2 = this.tweens.add({
              targets: this.pushSprite,
              scale: 0.85 * scalePush,
              duration: 110,
              easy: "Quart.easeOut",
              onComplete: () => {
                const scale3 = this.tweens.add({
                  targets: this.pushSprite,
                  scale: 0.8 * scalePush,
                  duration: 110,
                  easy: "Quart.easeOut",
                  onComplete: () => {
                    const scale4 = this.tweens.add({
                      targets: this.pushSprite,
                      scale: 0.85 * scalePush,
                      duration: 110,
                      easy: "Quart.easeOut",
                    });
                  },
                });
              },
            });
          },
        });
      },
    });
  }

  startEndPanel(x, y) {
    this.endPanelContainer = this.add.container();
    this.endPanelContainer.x = x;
    this.endPanelContainer.y = y;

    this.endPanel = this.add
      .sprite(0, 0, "main", "welcome.png")
      .setOrigin(0.5, 0.5)
      .setScale(0);

    this.uiGroup.add(this.endPanelContainer);
    this.endPanelContainer.add(this.endPanel);

    this.endPanelTween = this.tweens.add({
      targets: this.endPanel,
      duration: 300,
      scale: 1,
    });

    this.time.delayedCall(1000, () => {
      //this.startCoinEffect(x,y);

      this.endPanel.setInteractive();

      this.endPanel.on("pointerdown", (pointer) => {
        this.cover.visible = false;
        this.endPanel.visible = false;

        this.handTween.stop();

        this.tutorialHand.x = this.goBtn.x + 80;
        this.tutorialHand.y = this.goBtn.y + 20;

        this.uiGroup.add(this.tutorialHand);

        this.handTween = this.tweens.add({
          targets: this.tutorialHand,
          x: this.tutorialHand.x + 30,
          y: this.tutorialHand.y + 30,
          duration: 700,
          ease: "Sine.easeInOut",
          yoyo: true,
          repeat: -1,
        });
      });

      this.tutorialHand = this.add
        .sprite(
          this.endPanelContainer.x + 10,
          this.endPanelContainer.y + 120,
          "ui",
          "tutor_hand.png"
        )
        .setAngle(-45)
        .setScale(0.8);

      this.uiGroup.add(this.tutorialHand);

      this.handTween = this.tweens.add({
        targets: this.tutorialHand,
        x: this.tutorialHand.x + 50,
        y: this.tutorialHand.y + 50,
        duration: 600,
        ease: "Sine.easeInOut", // плавное ускорение/замедление
        yoyo: true, // возвращается обратно
        repeat: -1, // бесконечно (или поставь число повторений)
        // repeat: 3,                     // например, 3 раза туда-обратно
      });
    });
  }

  startLoseEffect(x, y) {
    if (this.isSoundEnable) this.sound.play("chicken");
    /*
    this.coinEmitter = this.add.particles(x, y, "main", {
      anim: "loseeffect",
      quantity: 1,
      speed: { min: 500, max: 600 },
      angle: { min: 0, max: 360 },
      gravityY: 0,
      scale: { start: 0.5, end: 1 },
      lifespan: 900,
    });

    this.uiGroup.add(this.coinEmitter);

    this.coinEmitter.flow(50, 5);
    this.time.delayedCall(500, () => {
      this.coinEmitter.stop();
    });
    */

    /*
    this.endEffectAnim = this.add
      .sprite(x, y, "main", "animation_lose/feather_frames000.png")
      .setOrigin(0.5, 0.5)
      .setScale(0);

    this.uiGroup.add(this.endEffectAnim);
    this.endEffectAnim.play("loseeffect");
    this.endEffectTween = this.tweens.add({
      targets: this.endEffectAnim,
      duration: 300,
      scale: 2.5,
      onComplete: () => {
        this.endEffectAnim.destroy();
        //this.startCoinEffect(x,y);
      },
    });
    */

    this.time.delayedCall(250, () => {
      //this.startCoinEffect(x,y);
      this.startEndPanel(this.centerX, 425);
    });
  }

  startFinalScreen(isWin = false) {
    this.roadSound.stop();

    this.finalContainer = this.add.container();
    this.finalContainer.y = -1000;
    this.finalBG = this.add
      .sprite(this.centerX, 450, "bg3")
      .setOrigin(0.5, 0.5);
    this.finalBG.scaleX = (this.scale.width / 1280) * (900 / this.scale.height);
    this.finalBG.scaleY =
      ((this.scale.height / 1280) * 900) / this.scale.height;

    this.finalFlag = this.add
      .sprite(this.centerX, 140, "main", "flag.png")
      .setOrigin(0.5, 0)
      .setScale(0.6);

    this.finalArca = this.add
      .sprite(this.centerX, 900, "packshot_arca")
      .setOrigin(0.5, 1)
      .setScale(0.7);
    this.finalFooter = this.add
      .sprite(Math.round(this.centerX), 900, "ui", "packshot_footer.png")
      .setOrigin(0.5, 1);
    this.finalChicken = this.add
      .sprite(this.centerX, 400, "ui", "packshot_chicken.png")
      .setOrigin(0.5, 0.5)
      .setScale(0.6);
    this.finalBtn = this.add
      .sprite(Math.round(this.centerX), 630, "ui", "packshot_button.png")
      .setOrigin(0.5, 0.5)
      .setScale(0.55);
    this.finalCoin1 = this.add
      .sprite(this.centerX + 150, 120, "main", "coin_flip.png")
      .setOrigin(0.5, 0)
      .setScale(0.6);

    this.finalCoin2 = this.add
      .sprite(this.centerX - 150, 140, "main", "coin.png")
      .setOrigin(0.5, 0)
      .setScale(0.6);

    this.finalCoin2.flipX = true;

    this.finalHeader = this.add
      .sprite(this.centerX, 40, "ui", "packshot_heading.png")
      .setOrigin(0.5, 0)
      .setScale(0.6);

    if (isWin) {
      this.coinEmitter = this.add.particles(this.centerX, 400, "main", {
        anim: "coin",
        quantity: 1,
        speed: { min: 500, max: 600 },
        angle: { min: 0, max: 360 },
        gravityY: 0,
        scale: { start: 0.5, end: 1 },
        lifespan: 900,
      });

      this.coinEmitter.flow(50, 5);
      this.time.delayedCall(500, () => {
        this.coinEmitter.stop();
      });

      if (this.isSoundEnable) this.sound.play("win");
    }

    this.uiGroup.add(this.finalContainer);
    this.finalContainer.add(this.finalBG);
    this.finalContainer.add(this.finalArca);
    this.finalContainer.add(this.finalFlag);
    this.finalContainer.add(this.finalFooter);
    this.finalContainer.add(this.finalChicken);
    this.finalContainer.add(this.finalBtn);
    this.finalContainer.add(this.finalCoin1);
    this.finalContainer.add(this.finalCoin2);
    this.finalContainer.add(this.finalHeader);

    this.finalContainer.add(this.coinEmitter);

    this.tweens.add({
      targets: this.finalBtn,
      scale: 0.53,
      duration: 1000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: this.finalFooter,
      y: 950,
      duration: 1000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: this.finalCoin2,
      y: 135,
      duration: 1000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: this.finalCoin1,
      y: 130,
      duration: 1000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: this.finalFlag,
      y: 130,
      duration: 1000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: this.finalChicken,
      y: 410,
      duration: 1000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    if (this.tutorialHand) this.tutorialHand.destroy();

    this.tutorialHand = this.add
      .sprite(
        this.finalBtn.x + 120,
        this.finalBtn.y + 180,
        "ui",
        "tutor_hand.png"
      )
      .setAngle(-45)
      .setScale(0.6);

    this.tutorialHand.visible = true;
    this.finalContainer.add(this.tutorialHand);

    this.handTween = this.tweens.add({
      targets: this.tutorialHand,
      x: this.tutorialHand.x - 30,
      y: this.tutorialHand.y - 30,
      duration: 600,
      ease: "Sine.easeInOut", // плавное ускорение/замедление
      yoyo: true, // возвращается обратно
      repeat: -1, // бесконечно (или поставь число повторений)
      // repeat: 3,                     // например, 3 раза туда-обратно
    });

    this.tweens.add({
      targets: this.finalContainer,
      y: 0,
      duration: 300,
      ease: "Sine.easeInOut",
    });
  }

  startMoneyAddScreen() {
    //this.cover.visible = false;
    this.roadSound.stop();
    this.goBtn.x = -1000;

    if (this.tutorialHand) this.tutorialHand.destroy();

    const bankScale =
      this.scale.width > this.scale.height
        ? 1
        : this.scale.width / this.scale.height < 0.8
        ? 0.8
        : this.scale.width / this.scale.height;

    this.moneyAddContainer = this.add.container();
    this.moneyAddBG = this.add
      .sprite(this.centerX, 450, "bg4")
      .setOrigin(0.5, 0.5);
    this.moneyAddBG.scaleX =
      (this.scale.width / 1280) * (900 / this.scale.height);
    this.moneyAddBG.scaleY =
      ((this.scale.height / 1280) * 900) / this.scale.height;

    this.uiGroup.add(this.moneyAddContainer);
    this.moneyAddContainer.add(this.moneyAddBG);

    this.bankUI1 = this.add
      .sprite(this.centerX, 445, "ui", "bank_ui_1.png")
      .setOrigin(0.5, 0.5)
      .setScale(0.8 * bankScale);
    this.bankUI2 = this.add
      .sprite(this.centerX, 880, "ui", "bank_ui_2.png")
      .setOrigin(0.5, 1)
      .setScale(bankScale);
    this.bankUI3 = this.add
      .sprite(this.centerX, 20, "ui", "bank_ui_3.png")
      .setOrigin(0.5, 0)
      .setScale(bankScale);
    this.moneyAddContainer.add(this.bankUI1);
    this.moneyAddContainer.add(this.bankUI2);
    this.moneyAddContainer.add(this.bankUI3);

    const startDelay = 500;

    this.chicon1 = this.add
      .sprite(this.centerX, 445 + 40 * bankScale, "ui", "rch1.png")
      .setOrigin(0.5, 0.5)
      .setScale(0.8 * bankScale);

    this.chicon2 = this.add
      .sprite(this.centerX, 445 + 40 * bankScale, "ui", "rch2.png")
      .setOrigin(0.5, 0.5)
      .setScale(0);

    this.chicon3 = this.add
      .sprite(this.centerX, 445 + 40 * bankScale, "ui", "rch3.png")
      .setOrigin(0.5, 0.5)
      .setScale(0);

    this.chicon4 = this.add
      .sprite(this.centerX, 445 + 40 * bankScale, "ui", "rch3.png")
      .setOrigin(0.5, 0.5)
      .setScale(0);

    this.tweens.add({
      targets: this.moneyAddContainer,
      x: 0,
      duration: 300,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: this.chicon1,
      y: 445 + 110 * bankScale,
      duration: 300,
      delay: startDelay,
      ease: "Sine.easeInOut",
      onStart: () => {},
      onComplete: () => {},
    });

    this.tweens.add({
      targets: this.chicon1,
      y: 445 + 180 * bankScale,
      duration: 300,
      delay: 1000 + startDelay,
      ease: "Sine.easeInOut",
      onStart: () => {},
    });

    this.tweens.add({
      targets: this.chicon1,
      y: 445 + 250 * bankScale,
      duration: 300,
      delay: 1500 + startDelay,
      ease: "Sine.easeInOut",
      onStart: () => {},
    });

    this.tweens.add({
      targets: this.chicon1,
      y: 445 + 110 * bankScale,
      duration: 300,
      delay: 500 + startDelay,
      ease: "Sine.easeInOut",
      onStart: () => {},
      onComplete: () => {},
    });

    this.tweens.add({
      targets: this.chicon2,
      scale: 0.88 * bankScale,
      duration: 100,
      delay: 300 + startDelay,
      ease: "Sine.easeInOut",
      onStart: () => {
        if (this.isSoundEnable) {
          this.sound.play("bank1");
        }
      },
    });

    this.tweens.add({
      targets: this.chicon2,
      scale: 0.8 * bankScale,
      duration: 100,
      delay: 400 + startDelay,
      ease: "Sine.easeInOut",
      onStart: () => {},
    });

    this.tweens.add({
      targets: this.chicon2,
      y: 445 + 110 * bankScale,
      duration: 300,
      delay: 1000 + startDelay,
      ease: "Sine.easeInOut",
      onStart: () => {},
    });

    this.tweens.add({
      targets: this.chicon2,
      y: 445 + 180 * bankScale,
      duration: 300,
      delay: 1500 + startDelay,
      ease: "Sine.easeInOut",
      onStart: () => {},
    });

    this.tweens.add({
      targets: this.chicon3,
      scale: 0.88 * bankScale,
      duration: 100,
      delay: 1300 + startDelay,
      ease: "Sine.easeInOut",
      onStart: () => {
        if (this.isSoundEnable) {
          this.sound.play("bank1");
        }
      },
    });

    this.tweens.add({
      targets: this.chicon3,
      scale: 0.8 * bankScale,
      duration: 100,
      delay: 1400 + startDelay,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: this.chicon3,
      y: 445 + 110 * bankScale,
      duration: 300,
      delay: 1500 + startDelay,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: this.chicon4,
      scale: 0.88 * bankScale,
      duration: 100,
      delay: 1800 + startDelay,
      ease: "Sine.easeInOut",
      onStart: () => {},
    });

    this.tweens.add({
      targets: this.chicon4,
      scale: 0.8 * bankScale,
      duration: 100,
      delay: 1900 + startDelay,
      ease: "Sine.easeInOut",
      onStart: () => {
        if (this.isSoundEnable) {
          this.sound.play("bank1");
        }
      },
    });

    this.moneyAddContainer.add(this.chicon1);
    this.moneyAddContainer.add(this.chicon2);
    this.moneyAddContainer.add(this.chicon3);
    this.moneyAddContainer.add(this.chicon4);

    this.moneyBalance = this.createRouletteCounter(
      this.centerX - 150 + 80 * this.isPort,
      425 - 150 * bankScale,
      0.6 * bankScale,
      0,
      25000000,
      2000,
      false,
      "black",
      false
    );
    this.moneyAddContainer.add(this.moneyBalance);
    this.moneyAddContainer.x = 2000;

    this.tweens.add({
      targets: this.moneyAddContainer,
      x: 0,
      duration: 300,
      ease: "Sine.easeInOut",
    });

    this.time.delayedCall(3000, () => {
      this.startFinalScreen(true);
    });
  }

  startResultScreen(isWin = true) {
    //this.cover.visible = false;
    this.isResult = true;
    this.tutorialHand.visible = false;
    this.handTween.stop();
    //this.cover.destroy();

    this.cover = this.add
      .rectangle(
        this.cameras.main.width / 2, // x (центр)
        this.cameras.main.height / 2, // y (центр)
        10 * this.cameras.main.width, // ширина
        10 * this.cameras.main.height, // высота
        0x000000, // цвет (любой, мы сделаем прозрачным)
        0.5 // альфа = 0 → полностью прозрачный
      )
      .setOrigin(0.5)
      .setScrollFactor(0); // чтобы не двигался с камерой (опционально)

    this.uiGroup.add(this.cover);

    //if (isWin) this.startWinEffect(this.centerX, 425);
    //else this.startLoseEffect(this.centerX, 425);

    this.time.delayedCall(500, () => {
      this.startMoneyAddScreen();
    });
  }

  startPromoScreen() {
    //this.cover.visible = false;

    this.tutorialHand.visible = false;
    this.handTween.stop();
    //this.cover.destroy();

    this.cover = this.add
      .rectangle(
        this.cameras.main.width / 2, // x (центр)
        this.cameras.main.height / 2, // y (центр)
        10 * this.cameras.main.width, // ширина
        10 * this.cameras.main.height, // высота
        0x000000, // цвет (любой, мы сделаем прозрачным)
        0.5 // альфа = 0 → полностью прозрачный
      )
      .setOrigin(0.5)
      .setScrollFactor(0); // чтобы не двигался с камерой (опционально)

    this.uiGroup.add(this.cover);

    this.startWinEffect(this.centerX, 425);

    this.coinEmitter = this.add.particles(this.centerX, 425, "main", {
      anim: "coin",
      quantity: 1,
      speed: { min: 500, max: 600 },
      angle: { min: 0, max: 360 },
      gravityY: 0,
      scale: { start: 0.2, end: 0.5 },
      lifespan: 900,
    });

    this.uiGroup.add(this.coinEmitter);

    this.coinEmitter.flow(50, 5);
    this.time.delayedCall(500, () => {
      this.coinEmitter.stop();
    });

    if (this.isSoundEnable) this.sound.play("win");

    //if (isWin) this.startWinEffect(this.centerX, 425);
    //else this.startLoseEffect(this.centerX, 425);
  }

  createRouletteCounter(
    x,
    y,
    scale,
    min,
    max,
    duration,
    isX = false,
    dirprefix = "",
    isNoCur = true
  ) {
    const atlasKey = "ui";
    const container = this.add.container(x, y);
    container.setScale(scale);

    const spacing = 40;
    const decimals = 2;
    const formatWidth = 7; // Максимум: "1000.00" → 7 символов

    let currentVal = min;
    const totalFrames = duration / 16.6; // ~60 FPS
    const increment = (max - min) / totalFrames;

    const self = this;

    // Функция форматирования числа: 12.3 → "12.30", 5 → "5.00", 1000 → "1000.00"
    function formatNumber(num) {
      const fixed = num.toFixed(decimals);
      return fixed.padStart(formatWidth - decimals - 1, " ").replace(" ", "0"); // Дополняем нулями слева
    }

    // Функция обновления отображения
    function updateDisplay(value) {
      const str = "" + Math.floor(value);
      //formatNumber(value);
      container.removeAll(true);

      let offsetX = 0;

      if (isX) {
        let frameName = "nums" + dirprefix + "/x.png";
        const sprite = self.add.sprite(offsetX, 0, atlasKey, frameName).setScale(0.8);
        container.add(sprite);
        offsetX += spacing;
      }

      for (let char of str) {
        if (char === " ") continue;

        let frameName;
        if (char === ".") {
          frameName = "nums" + dirprefix + "/dot.png";
        } else if (/[0-9]/.test(char)) {
          frameName = `nums` + dirprefix + `/0${char}.png`;
        } else {
          continue;
        }

        const sprite = self.add.sprite(offsetX, 0, atlasKey, frameName);
        container.add(sprite);
        offsetX += spacing;
      }

      offsetX -= spacing / 3;

      if (!isNoCur) {
        offsetX += spacing;

        let frameName = "nums" + dirprefix + "/0$.png";
        const sprite = self.add.sprite(offsetX, 0, atlasKey, frameName);

        container.add(sprite);
      }
    }

    // Первое отображение
    updateDisplay(currentVal);

    // Анимация
    if (duration > 0) {
      const timer = this.time.addEvent({
        delay: 16.6, // ~60 FPS
        callback: () => {
          currentVal += increment;
          if (currentVal >= max) {
            currentVal = max;
            updateDisplay(currentVal);
            timer.remove(); // Завершаем
          } else {
            updateDisplay(currentVal);
          }
        },
        repeat: Math.floor(totalFrames),
      });
    }

    // Добавим метод для остановки вручную
    container.stop = () => {
      if (timer) timer.remove();
      updateDisplay(max);
    };

    return container;
  }
}
