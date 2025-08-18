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
  cashoutBtn: Phaser.GameObjects.Sprite;
  tutorialText: Phaser.GameObjects.Text;
  cover: Phaser.GameObjects.Rectangle;

  chicken: Phaser.GameObjects.Sprite;
  ghoust: Phaser.GameObjects.Sprite;

  scaleValue: number;
  activeRoad: number;
  isJumping: boolean = false;
  isTutorial: boolean = false;
  isWaitStart: boolean = true;

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

    //this.cameras.main.setViewport(0, 0, 800, 1200); // x, y, width, height

    this.roadGroup = this.add.container();
    this.uiGroup = this.add.container();

    const uiCamera = this.cameras
      .add(0, 0, this.scale.width, this.scale.height)
      .setScroll(0, 0) // Не двигается
      .setZoom(1)
      .setName("uiCamera");

    // Убираем фон у UI-камеры, чтобы не перекрывало основное
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

    // Запуск анимации ожидания по умолчанию
    this.chicken.play("idle");

    this.goBtn = this.add
      .sprite(
        this.scale.width / 2 + 80,
        120 + ROAD_CELL_H * ROAD_ROWS,
        "main",
        "go_button.png"
      )
      .setOrigin(0.5, 0)
      .setScale(0.5);

    this.goBtn.setInteractive();

    // Обработчик клика
    this.goBtn.on("pointerdown", (pointer) => {
      if (!this.isTutorial && !this.isWaitStart) this.onJump();
    });

    this.cashoutBtn = this.add
      .sprite(
        this.scale.width / 2 - 80,
        120 + ROAD_CELL_H * ROAD_ROWS,
        "main",
        "cashout_button.png"
      )
      .setOrigin(0.5, 0)
      .setScale(0.5);

    this.cashoutBtn.setInteractive();

    // Обработчик клика
    this.cashoutBtn.on("pointerdown", (pointer) => {});

    this.topBg = this.add.graphics();
    this.topBg.fillStyle(0x000000, 1);
    this.topBg.fillRect(0, 0, 2000, 100); // x, y, ширина, высота
    this.uiGroup.add(this.topBg);

    this.bottomBg = this.add.graphics();
    this.bottomBg.fillStyle(0x000000, 1);
    this.bottomBg.fillRect(0, 100 + ROAD_CELL_H * ROAD_ROWS, 2000, 1000); // x, y, ширина, высота
    this.uiGroup.add(this.bottomBg);

    this.uiGroup.add(this.goBtn);
    this.roadGroup.y = 100;

    this.tutorialText = this.add.text(400, 300, "Tap to see the movies", {
      fontFamily: "Montserrat",
      fontSize: "48px",
      color: "#fff",
      stroke: "#000",
      strokeThickness: 2,
    });

    this.uiGroup.add(this.tutorialText);

    this.cover = this.add
      .rectangle(
        this.cameras.main.width / 2, // x (центр)
        this.cameras.main.height / 2, // y (центр)
        this.cameras.main.width, // ширина
        this.cameras.main.height, // высота
        0x000000, // цвет (любой, мы сделаем прозрачным)
        0.1 // альфа = 0 → полностью прозрачный
      )
      .setOrigin(0.5)
      .setInteractive() // делаем его интерактивным
      .setScrollFactor(0); // чтобы не двигался с камерой (опционально)

    // Добавляем обработчик тапа
    this.cover.on("pointerdown", (pointer) => {
      if (!this.isTutorial && this.isWaitStart) {
        this.isTutorial = true;
        this.tutorialText.visible = false;
        this.ghoust.visible = true;
        this.onJump(true);
        this.cover.setAlpha(0.5);
      }
    });

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

  onMainGameplayStart() {
    this.tweens.add({
      targets: this.cameras.main,
      scrollX: 0,
      duration: 200,
    });

    this.cover.destroy();
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

    if (
      this.cars[this.activeRoad].y > 0 &&
      this.cars[this.activeRoad].y < ROAD_CELL_H * ROAD_ROWS + 200
    )
      return;

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
          duration: FENCE_MOVE_TIME+200,
          onComplete: () => {
              this.onCarTweenComplete(this.activeRoad);
          }
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
          if (this.activeRoad < 4) this.chicken.play("idle");
          else {
            this.chicken.stop();
            this.chicken.x = this.chicken.x + ROAD_CELL_W / 2;
            this.chicken.y += ROAD_CELL_H*2;
            this.chicken.setTexture("main", "dead_chicken.png");

            this.time.delayedCall(1000, () => {
              this.startResultScreen();
                }, [], this);
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

  startGiveMoneyScreen() {}

  startResultScreen() {
  }
    
}
