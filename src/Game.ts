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
  particlesEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  resultScreen: ResultScreen;
  headerUI: HeaderUI;
  goBtn: Phaser.GameObjects.Sprite;
  cashoutBtn: Phaser.GameObjects.Sprite;
  tutorialText: Phaser.GameObjects.Sprite;
  tutorialHand: Phaser.GameObjects.Sprite;
  handTween: Phaser.Tweens.Tween;
  uiPanel: Phaser.GameObjects.Sprite;
  headerSprite: Phaser.GameObjects.Sprite;
  cashOutText: Phaser.GameObjects.Text;
  headerText: Phaser.GameObjects.Text;
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
  soundIcon: Phaser.GameObjects.Sprite;

  chicken: Phaser.GameObjects.Sprite;
  ghoust: Phaser.GameObjects.Sprite;

  moneyAddContainer: Phaser.GameObjects.Container;
  moneyAddBG: Phaser.GameObjects.Sprite;
  bankUI1: Phaser.GameObjects.Sprite;
  bankUI2: Phaser.GameObjects.Sprite;
  bankUI3: Phaser.GameObjects.Sprite;
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

  centerX: number;
  scaleValue: number;
  activeRoad: number;
  balance: number = 0;
  isJumping: boolean = false;
  isTutorial: boolean = false;
  isWaitStart: boolean = true;
  isSoundEnable: boolean = true;

  preload() {
    this.load.audio("jump", "sounds/01_jump.mp3");
    this.load.audio("win", "sounds/02_win.mp3");
    this.load.audio("bank1", "sounds/03_bank1.mp3");
    this.load.audio("bank3", "sounds/03_bank3.mp3");
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
      this.coversText[i] = this.add
        .text(COVER_DELTA_X + 50, 50, COL_MONEY[i] + "$")
        .setOrigin(0.5, 0.5);
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
        .sprite(FENCE_DELTA_X + ROAD_CELL_W * i, -100, "main", "fence.png")
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

    this.ghoust = this.add
      .sprite(CHICKEN_START_X, CHICKEN_START_Y, "chicken")
      .setOrigin(0, 0)
      .setScale(0.75)
      .setAlpha(0.75);

    this.ghoust.visible = false;

    this.roadGroup.add(this.ghoust);

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
        delay: Math.random() * 500 + 500 * i,
        onComplete: () => {
          this.onCarTweenComplete(i);
        },
      });

    this.carsTween[0].stop();
    this.carsTween[1].stop();
    this.carsTween[2].stop();

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
      key: "gjump",
      frames: [
        { key: "chicken", frame: "GHOST_chicken_Jump/CHICKEN_FRAMES1000.png" },
        { key: "chicken", frame: "GHOST_chicken_Jump/CHICKEN_FRAMES1001.png" },
        { key: "chicken", frame: "GHOST_chicken_Jump/CHICKEN_FRAMES1002.png" },
        { key: "chicken", frame: "GHOST_chicken_Jump/CHICKEN_FRAMES1003.png" },
        { key: "chicken", frame: "GHOST_chicken_Jump/CHICKEN_FRAMES1004.png" },
        { key: "chicken", frame: "GHOST_chicken_Jump/CHICKEN_FRAMES1005.png" },
        { key: "chicken", frame: "GHOST_chicken_Jump/CHICKEN_FRAMES1006.png" },
        { key: "chicken", frame: "GHOST_chicken_Jump/CHICKEN_FRAMES1007.png" },
        { key: "chicken", frame: "GHOST_chicken_Jump/CHICKEN_FRAMES1008.png" },
      ],
      frameRate: 12, // скорость анимации
      repeat: 0, // проиграть один раз (0 = один раз, -1 = бесконечно)
    });

    // Создание анимации ожидания
    this.anims.create({
      key: "gidle",
      frames: [
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2000.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2001.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2002.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2003.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2004.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2005.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2006.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2007.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2008.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2009.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2010.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2011.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2012.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2013.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2014.png" },
        { key: "chicken", frame: "GHOST_idle_chicen/CHICKEN_FRAMES2015.png" },
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

    this.anims.create({
      key: "coinwin",
      frames: [
        { key: "main", frame: "coin_frames/coin_frames000.png" },
        { key: "main", frame: "coin_frames/coin_frames001.png" },
        { key: "main", frame: "coin_frames/coin_frames002.png" },
        { key: "main", frame: "coin_frames/coin_frames003.png" },
        { key: "main", frame: "coin_frames/coin_frames004.png" },
        { key: "main", frame: "coin_frames/coin_frames005.png" },
        { key: "main", frame: "coin_frames/coin_frames006.png" },
      ],
      frameRate: 30, // скорость анимации
      repeat: -1, // проиграть один раз (0 = один раз, -1 = бесконечно)
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
        110 + ROAD_CELL_H * ROAD_ROWS,
        "main",
        "ui_panel.png"
      )
      .setOrigin(0.5, 0)
      .setScale(0.5);

    this.goBtn = this.add
      .sprite(
        this.centerX + 70,
        240 + ROAD_CELL_H * ROAD_ROWS,
        "main",
        "go_button.png"
      )
      .setOrigin(0.5, 0)
      .setScale(0.5);

    this.goBtn.setInteractive();

    // Обработчик клика
    this.goBtn.on("pointerdown", (pointer) => {
      if (!this.isTutorial && !this.isWaitStart) {
        this.tutorialHand.visible = false;
        this.onJump();
      }
    });

    this.cashoutBtn = this.add
      .sprite(
        this.centerX - 70,
        240 + ROAD_CELL_H * ROAD_ROWS,
        "main",
        "cashout_button.png"
      )
      .setOrigin(0.5, 0)
      .setScale(0.5);

    this.cashoutBtn.setInteractive();

    // Обработчик клика
    this.cashoutBtn.on("pointerdown", (pointer) => {
      if (!this.isJumping && !this.isTutorial && this.activeRoad == 3)
        this.startResultScreen();
    });

    this.headerSprite = this.add
      .sprite(this.centerX, 20, "main", "header.png")
      .setOrigin(0.5, 0)
      .setScale(0.66);

    this.headBalance = this.createRouletteCounter(
      this.centerX + 30,
      50,
      0.3,
      0,
      0,
      0,
      false
    );

    this.soundIcon = this.add
      .sprite(5, this.scale.height-5, "main", "sound_button.png")
      .setOrigin(0, 1)
      .setScale(0.5);

      this.soundIcon.setInteractive();

     this.soundIcon.on("pointerdown", (pointer) => {
        this.isSoundEnable = !this.isSoundEnable;
        if (this.isSoundEnable)
        {
          this.soundIcon.setTexture("main","sound_button.png");
        }
        else
        {
          this.soundIcon.setTexture("main","sound_button_off.png");
        }
    });
      

    this.topBg = this.add.graphics();
    this.topBg.fillStyle(0x000000, 1);
    this.topBg.fillRect(0, 0, 2000, 100); // x, y, ширина, высота
    this.uiGroup.add(this.topBg);

    this.bottomBg = this.add.graphics();
    this.bottomBg.fillStyle(0x000000, 1);
    this.bottomBg.fillRect(0, 100 + ROAD_CELL_H * ROAD_ROWS, 2000, 1000); // x, y, ширина, высота
    this.uiGroup.add(this.bottomBg);

    this.uiGroup.add(this.uiPanel);
    this.uiGroup.add(this.goBtn);
    this.uiGroup.add(this.cashoutBtn);
    this.uiGroup.add(this.headerSprite);
    this.uiGroup.add(this.headBalance);
    //this.uiGroup.add(this.soundIcon);
    this.roadGroup.y = 100;

    const tutorialScale =
      this.scale.width > this.scale.height
        ? 1
        : this.scale.width / this.scale.height;
    this.tutorialText = this.add
      .sprite(this.centerX, 300, "main", "Tap to see the moves.png")
      .setOrigin(0.5, 0.5)
      .setScale(tutorialScale);
    this.uiGroup.add(this.tutorialText);

    this.tutorialHand = this.add
      .sprite(this.centerX + 330 * tutorialScale, 425, "ui", "tutor_hand.png")
      .setAngle(-45)
      .setScale(tutorialScale);
    this.uiGroup.add(this.tutorialHand);

    this.handTween = this.tweens.add({
      targets: this.tutorialHand,
      x: this.tutorialHand.x - 70,
      y: this.tutorialHand.y - 70,
      duration: 700, // 0.5 секунды до точки
      ease: "Sine.easeInOut", // плавное ускорение/замедление
      yoyo: true, // возвращается обратно
      repeat: -1, // бесконечно (или поставь число повторений)
      // repeat: 3,                     // например, 3 раза туда-обратно
    });

    this.cover = this.add
      .rectangle(
        this.cameras.main.width / 2, // x (центр)
        this.cameras.main.height / 2, // y (центр)
        this.cameras.main.width, // ширина
        this.cameras.main.height, // высота
        0x000000, // цвет (любой, мы сделаем прозрачным)
        0.5 // альфа = 0 → полностью прозрачный
      )
      .setOrigin(0.5)
      .setInteractive() // делаем его интерактивным
      .setScrollFactor(0); // чтобы не двигался с камерой (опционально)

    // Добавляем обработчик тапа
    this.cover.on("pointerdown", (pointer) => {
      if (!this.isTutorial && this.isWaitStart) {
        this.isTutorial = true;
        this.tutorialText.visible = false;
        this.tutorialHand.visible = false;
        this.handTween.stop();
        this.ghoust.visible = true;
        this.onJump(true);
        this.cover.setAlpha(0.5);
        //this.startResultScreen();
      }
    });

    //this.startMoneyAddScreen();
    //this.startFinalScreen();
    //this.startPush();
  }

  onThirdStep() {
    this.goBtn.setTexture("main", "risk.png");
    this.tutorialHand.x = this.cashoutBtn.x + 100;
    this.tutorialHand.y = this.cashoutBtn.y + 100;
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
  }

  onMainGameplayStart() {
    this.tweens.add({
      targets: this.cameras.main,
      scrollX: 0,
      duration: 200,
    });

    this.tutorialHand.x = this.goBtn.x + 100;
    this.tutorialHand.y = this.goBtn.y + 100;
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

    this.cover.visible = false;
    this.ghoust.visible = false;
    this.activeRoad = 0;
    this.isWaitStart = false;
    this.isTutorial = false;
    this.tutorialText.visible = false;

    for (let i = 0; i < 3; i++) {
      this.fences[i].y = -100;
      this.cars[i].y = -400;
      this.carsTween[i] = this.tweens.add({
        targets: this.cars[i],
        y: ROAD_CELL_H * ROAD_ROWS + 200,
        duration: CAR_MOVE_TIME,
        delay: Math.random() * 500 + 500 * i,
        onComplete: () => {
          this.onCarTweenComplete(i);
        },
      });

      this.mcovers[i].visible = true;
      this.coversText[i].visible = true;
      this.mcovers[i].setScale(1);
      this.coversSprite[i].setTexture("main", "manhole_cover.png");
    }
  }

  onJump(isGhoust: boolean = false) {
    if (this.isJumping || this.activeRoad > 3) return;

    /*
    if (
      this.cars[this.activeRoad].y > 0 &&
      this.cars[this.activeRoad].y < ROAD_CELL_H * ROAD_ROWS + 200
    )
      return;
      */

    this.isJumping = true;

    if (this.activeRoad > 0) {
      this.coversSprite[this.activeRoad - 1].play("coin");
      this.mcovers[this.activeRoad - 1].setScale(0.8);

      this.mcovers[this.activeRoad - 1].visible = true;
    }

    this.fences[this.activeRoad].visible = true;
    if (isGhoust) this.ghoust.play("gjump");
    else this.chicken.play("jump");

    const finalX = (isGhoust ? this.ghoust.x : this.chicken.x) + ROAD_CELL_W;
    const startY = this.chicken.y;
    const jumpHeight = 50;

    if (this.isSoundEnable)
        this.sound.play("jump");

    if (this.activeRoad < 3) {
      this.tweens.add({
        targets: this.fences[this.activeRoad],
        y: FENCE_DELTA_Y,
        duration: FENCE_MOVE_TIME,
        easy: "Quart.easeOut",
      });

      this.carsTween[this.activeRoad].stop();

      if (this.cars[this.activeRoad].y < FENCE_DELTA_Y) {
        this.carsTween[this.activeRoad] = this.tweens.add({
          targets: this.cars[this.activeRoad],
          y: FENCE_DELTA_Y,
          duration: FENCE_MOVE_TIME,
          easy: "Quart.easeOut",
          delay:
            this.cars[this.activeRoad].y == CAR_START_Y
              ? Math.random() * 500 + 100
              : 100,
        });
      }
    } else {
      console.log("AR", this.cars[this.activeRoad].y);

      this.carsTween[this.activeRoad].stop();
      this.cars[this.activeRoad].y = -200;

      this.carsTween[this.activeRoad] = this.tweens.add({
        targets: this.cars[this.activeRoad],
        y: ROAD_CELL_H * ROAD_ROWS + 200,
        duration: FENCE_MOVE_TIME + 200,
        onComplete: () => {
          this.onCarTweenComplete(this.activeRoad);
        },
      });
    }

    this.tweens.add({
      targets: isGhoust ? this.ghoust : this.chicken,
      x: finalX,
      duration: FENCE_MOVE_TIME,
      onComplete: () => {
        this.isJumping = false;
        this.mcovers[this.activeRoad].visible = false;
        this.coversText[this.activeRoad].visible = false;
        this.activeRoad += 1;

        if (isGhoust) {
          this.ghoust.play("gidle");
          this.tweens.add({
            targets: this.ghoust,
            alpha: 0.8,
            duration: FENCE_MOVE_TIME,
            ease: "Power1",
            repeat: 0,
            onComplete: () => {
              if (this.activeRoad < 3) this.onJump(true);
              else {
                this.onMainGameplayStart();
              }
            },
          });
        } else {
          if (this.activeRoad == 1) {
            this.headBalance.destroy();
            this.cashBalance = this.createRouletteCounter(
              this.cashoutBtn.x - 40,
              this.cashoutBtn.y + 60,
              0.3,
              0,
              171,
              1000,
              false,
              "black"
            );
            this.headBalance = this.createRouletteCounter(
              this.centerX + 20,
              50,
              0.3,
              0,
              171,
              1000,
              false
            );
            this.uiGroup.add(this.cashBalance);
            this.uiGroup.add(this.headBalance);
          } else {
            this.cashBalance.destroy();
            this.headBalance.destroy();
            this.cashBalance = this.createRouletteCounter(
              this.cashoutBtn.x - 40,
              this.cashoutBtn.y + 60,
              0.3,
              171,
              373,
              1000,
              false,
              "black"
            );
            this.headBalance = this.createRouletteCounter(
              this.centerX + 20,
              50,
              0.3,
              171,
              373,
              1000,
              false
            );
            this.uiGroup.add(this.cashBalance);
            this.uiGroup.add(this.headBalance);
          }

          if (this.activeRoad == 3) {
            this.cashBalance.destroy();
            this.headBalance.destroy();
            this.cashBalance = this.createRouletteCounter(
              this.cashoutBtn.x - 40,
              this.cashoutBtn.y + 60,
              0.3,
              373,
              610,
              1000,
              false,
              "black"
            );
            this.headBalance = this.createRouletteCounter(
              this.centerX + 20,
              50,
              0.3,
              373,
              610,
              1000,
              false
            );
            this.uiGroup.add(this.cashBalance);
            this.uiGroup.add(this.headBalance);
            this.onThirdStep();
          }

          if (this.activeRoad < 4) this.chicken.play("idle");
          else {
            this.chicken.stop();
            this.chicken.x = this.chicken.x + ROAD_CELL_W / 2;
            this.chicken.y += ROAD_CELL_H * 2;
            this.chicken.setTexture("main", "dead_chicken.png");

            this.time.delayedCall(
              1000,
              () => {
                this.startResultScreen(false);
              },
              [],
              this
            );
          }
        }
      },
    });

    this.tweens.add({
      targets: isGhoust ? this.ghoust : this.chicken,
      y: startY - jumpHeight, // поднимаемся
      duration: FENCE_MOVE_TIME / 2,
      ease: "Power1",
      yoyo: true, // возвращаемся обратно
      repeat: 0,
    });

    const cameraX = this.cameras.main.scrollX + ROAD_CELL_W;

    console.log(
      "scale dx",
      ROAD_START_X + ROAD_CELL_W * ROAD_COLS - this.chicken.x,
      this.scale.width
    );

    if (
      this.activeRoad > 0 &&
      ROAD_START_X +
        ROAD_CELL_W * ROAD_COLS -
        (isGhoust ? this.ghoust.x : this.chicken.x) >
        this.scale.width
    )
      this.tweens.add({
        targets: this.cameras.main,
        scrollX: cameraX,
        duration: FENCE_MOVE_TIME,
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
        this.onCarTweenComplete(col);
      },
    });
  }

  startCoinEffect(x, y) {
    this.coinEmitter = this.add.particles(x, y, "main", {
      anim: "coinwin",
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

  startWinEffect(x, y) {
    this.isSoundEnable
      this.sound.play("win");

    this.startPush();
    this.endEffectAnim = this.add
      .sprite(
        x,
        y,
        "main",
        "you_win_effect_frames/you_win_effect_frames000.png"
      )
      .setOrigin(0.5, 0.5)
      .setScale(0);

    this.uiGroup.add(this.endEffectAnim);
    this.endEffectAnim.play("wineffect");
    this.endEffectTween = this.tweens.add({
      targets: this.endEffectAnim,
      duration: 300,
      scale: 2.5,
      onComplete: () => {
        this.endEffectAnim.destroy();
        this.startCoinEffect(x, y);
      },
    });

    this.time.delayedCall(150, () => {
      //this.startCoinEffect(x,y);
      this.startEndPanel(true, this.centerX, 425);
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
    const scalePush = (this.scale.width<this.scale.height)?((this.scale.width/this.gameContainer.scale)/700):0.8;

    console.log(this.scale.width,this.scale.height,this.gameContainer.scale);
    
    this.pushSprite = this.add
      .sprite(this.centerX, 50+30*scalePush, "ui", "push.png")
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

  startEndPanel(isWin, x, y) {
    this.endPanelContainer = this.add.container();
    this.endPanelContainer.x = x;
    this.endPanelContainer.y = y;
    this.endPanelContainer.setAngle(3);

    if (isWin)
      this.endPanel = this.add
        .sprite(0, 0, "ui", "win.png")
        .setOrigin(0.5, 0.5)
        .setScale(0);
    else
      this.endPanel = this.add
        .sprite(0, 0, "main", "lose.png")
        .setOrigin(0.5, 0.5)
        .setScale(0);

    this.uiGroup.add(this.endPanelContainer);
    this.endPanelContainer.add(this.endPanel);

    this.endPanelTween = this.tweens.add({
      targets: this.endPanel,
      duration: 300,
      scale: 0.5,
      onComplete: () => {
        this.startEndPanelTweens();
      },
    });

    this.time.delayedCall(2000, () => {
      //this.startCoinEffect(x,y);
      if (isWin) this.startMoneyAddScreen();
      else this.startFinalScreen();
    });
  }

  startLoseEffect(x, y) {
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
      this.startEndPanel(false, this.centerX, 425);
    });
  }

  startFinalScreen() {
    this.finalContainer = this.add.container();
    this.finalContainer.y = -1000;
    this.finalBG = this.add
      .sprite(this.centerX, 450, "bg3")
      .setOrigin(0.5, 0.5);
    this.finalBG.scaleX = (this.scale.width / 1280) * (900 / this.scale.height);
    this.finalBG.scaleY =
      ((this.scale.height / 1280) * 900) / this.scale.height;

    this.finalArca = this.add
      .sprite(this.centerX, 900, "packshot_arca")
      .setOrigin(0.5, 1)
      .setScale(0.7);
    this.finalFooter = this.add
      .sprite(this.centerX, 900, "ui", "packshot_footer.png")
      .setOrigin(0.5, 1);
    this.finalChicken = this.add
      .sprite(this.centerX, 400, "ui", "packshot_chicken.png")
      .setOrigin(0.5, 0.5)
      .setScale(0.6);
    this.finalBtn = this.add
      .sprite(this.centerX, 630, "ui", "packshot_button.png")
      .setOrigin(0.5, 0.5)
      .setScale(0.55);
    this.finalHeader = this.add
      .sprite(this.centerX, 40, "ui", "packshot_heading.png")
      .setOrigin(0.5, 0)
      .setScale(0.6);

    this.uiGroup.add(this.finalContainer);
    this.finalContainer.add(this.finalBG);
    this.finalContainer.add(this.finalArca);
    this.finalContainer.add(this.finalFooter);
    this.finalContainer.add(this.finalChicken);
    this.finalContainer.add(this.finalBtn);
    this.finalContainer.add(this.finalHeader);

    this.tweens.add({
      targets: this.finalBtn,
      scale: 0.53,
      duration: 1000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    this.tutorialHand.x = this.finalBtn.x + 90;
    this.tutorialHand.y = this.finalBtn.y + 10;
    this.tutorialHand.visible = true;
    this.finalContainer.add(this.tutorialHand);

    this.handTween = this.tweens.add({
      targets: this.tutorialHand,
      x: this.tutorialHand.x - 30,
      y: this.tutorialHand.y - 30,
      duration: 400, // 0.5 секунды до точки
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
    this.isSoundEnable
      this.sound.play("bank3");

    const bankScale =
      this.scale.width > this.scale.height
        ? 1
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

    this.moneyBalance = this.createRouletteCounter(
      this.centerX - 50,
      425 - 250 * bankScale,
      0.6 * bankScale,
      0,
      2323,
      2000
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
      this.startFinalScreen();
    });
  }

  startResultScreen(isWin = true) {
    this.tutorialHand.visible = false;
    this.handTween.stop();
    this.cover.setAlpha(0.5);
    this.cover.visible = true;
    if (isWin) this.startWinEffect(this.centerX, 425);
    else this.startLoseEffect(this.centerX, 425);
  }

  createRouletteCounter(
    x,
    y,
    scale,
    min,
    max,
    duration,
    isSmall = true,
    dirprefix = ""

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
      for (let char of str) {
        if (char === " ") continue;

        let frameName;
        if (char === ".") {
          frameName = "nums"+dirprefix+"/dot.png";
        } else if (/[0-9]/.test(char)) {
          frameName = `nums`+dirprefix+`/0${char}.png`;
        } else {
          continue;
        }

        const sprite = self.add.sprite(offsetX, 0, atlasKey, frameName);
        container.add(sprite);
        offsetX += spacing;
      }

      offsetX -= spacing / 3;

      for (let i = 0; i < 3; i++) {
        let frameName = i == 0 ? "nums"+dirprefix+"/dot.png" : "nums"+dirprefix+"/00.png";
        const sprite = self.add.sprite(offsetX, isSmall?15:0, atlasKey, frameName);
        if (isSmall) sprite.setScale(0.5);
        container.add(sprite);
        offsetX += spacing / 2;
        if (!isSmall) offsetX += spacing / 2;
      }

      offsetX += spacing / 2;
      if (!isSmall) offsetX += spacing / 2;

      let frameName = "nums"+dirprefix+"/0€.png";
      const sprite = self.add.sprite(offsetX, isSmall?15:0, atlasKey, frameName);
      if (isSmall) sprite.setScale(0.5);
      container.add(sprite);
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
            console.log(currentVal);
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
