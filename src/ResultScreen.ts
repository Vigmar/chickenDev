import { ConfEffect } from "./ConfEffect";
import { WinEffect } from "./WinEffect";
import {
    ATTEMPTS_OUT_TEXT,
    FONT_NAME,
    FONT_SIZE,
    GIFT_SPRITE_SCALE,
    MOVE_UI_TIME,
    RAYS_EFFECT_DELAY,
    RAYS_EFFECT_TIME,
    TAP_TO_CONTINUE_TEXT,
    WHITE_COLOR,
    YOU_LOSE_TEXT,
} from "./constants";
import { getScaleValue } from "./getScaleValue";

export class ResultScreen {
    scene: Phaser.Scene;
    giftSprite: Phaser.GameObjects.Image;
    shade: Phaser.GameObjects.Rectangle;
    raysImage: Phaser.GameObjects.Image;
    raysContainer: Phaser.GameObjects.Container;
    awardText: Phaser.GameObjects.Text;
    tapText: Phaser.GameObjects.Text;
    confEffect: ConfEffect;
    winEffect: WinEffect;
    attemptsOutText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        const sWidth = this.scene.scale.width;
        const sHeight = this.scene.scale.height;
        const scaleValue = getScaleValue(this.scene);

        this.shade = scene.add
            .rectangle(0, 0, sWidth, sHeight, 0x000000, 0.5)
            .setOrigin(0, 0)
            .setInteractive();

        this.raysContainer = scene.add.container(sWidth / 2, sHeight / 2);

        this.raysImage = scene.add.image(0, 0, "rays");
        this.raysImage.setScale(sWidth / this.raysImage.width);
        this.raysContainer.setAlpha(0);
        this.raysContainer.add(this.raysImage);

        this.confEffect = new ConfEffect(this.scene);
        this.winEffect = new WinEffect(this.scene);

        this.tapText = this.scene.add
            .text(sWidth / 2, sHeight * 0.8, TAP_TO_CONTINUE_TEXT, {
                fontFamily: FONT_NAME,
                fontSize: FONT_SIZE,
                color: WHITE_COLOR,
            })
            .setOrigin(0.5)
            .setAlpha(0.6)
            .setScale(scaleValue);

        this.attemptsOutText = this.scene.add
            .text(sWidth / 2, sHeight / 2, ATTEMPTS_OUT_TEXT, {
                fontFamily: FONT_NAME,
                fontSize: FONT_SIZE,
                color: WHITE_COLOR,
            })
            .setOrigin(0.5)
            .setScale(scaleValue);

        this.tapText.visible = false;
        this.attemptsOutText.visible = false;
        this.shade.visible = false;
        this.raysContainer.visible = false;

        this.shade.on("pointerdown", () => {
            this.hideResult();
        });
    }

    showFinal() {
        this.shade.visible = true;
        this.tapText.visible = true;
        this.attemptsOutText.visible = true;
    }

    showResult(spriteName: string, label: string) {
        this.tapText.visible = true;
        const sWidth = this.scene.scale.width;
        const sHeight = this.scene.scale.height;
        const scaleValue = getScaleValue(this.scene);

        this.awardText = this.scene.add
            .text(sWidth / 2, sHeight / 2, spriteName ? label : YOU_LOSE_TEXT, {
                fontFamily: FONT_NAME,
                fontSize: FONT_SIZE,
                color: WHITE_COLOR,
                wordWrap: { width: this.scene.scale.width * 0.5 },
            })
            .setOrigin(0.5)
            .setScale(0);

        if (spriteName) {
            this.confEffect.start();
            this.winEffect.start();

            this.giftSprite = this.scene.add
                .sprite(sWidth / 2, sHeight / 2, spriteName)
                .setScale(0);

            this.awardText.setOrigin(0.5, 0);
            this.awardText.y =
                this.giftSprite.y +
                (this.giftSprite.height * scaleValue * GIFT_SPRITE_SCALE) / 2 +
                10;

            this.scene.tweens.add({
                targets: this.giftSprite,
                scale: scaleValue * GIFT_SPRITE_SCALE,
                duration: MOVE_UI_TIME,
                ease: "Linear",
            });
        }

        this.scene.tweens.add({
            targets: this.awardText,
            scale: scaleValue * GIFT_SPRITE_SCALE,
            duration: MOVE_UI_TIME,
            ease: "Linear",
        });

        this.shade.visible = true;
        this.raysContainer.setAlpha(0);
        this.raysContainer.visible = true;
        this.scene.tweens.add({
            targets: this.raysContainer,
            props: {
                alpha: {
                    value: 1,
                    duration: RAYS_EFFECT_TIME,
                    ease: "Cubic.easeOut",
                },
            },
            delay: RAYS_EFFECT_DELAY,
        });
    }

    hideResult() {
        this.shade.visible = false;
        this.raysContainer.visible = false;
        this.tapText.visible = false;
        this.attemptsOutText.visible = false;
        if (this.winEffect) {
            this.winEffect.stop();
        }
        if (this.giftSprite) {
            this.giftSprite.destroy();
        }
        if (this.confEffect) {
            this.confEffect.stop();
        }
        if (this.awardText) {
            this.awardText.destroy();
        }
    }
}
