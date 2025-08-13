import { COIN_TEXT, FONT_NAME, FONT_SIZE, WHITE_COLOR, WIN_EFFECT_TIME } from "./constants";
import { getScaleValue } from "./getScaleValue";

export class WinEffect {
    scene: Phaser.Scene;
    ribbonImage: Phaser.GameObjects.Image;
    starsImage: Phaser.GameObjects.Image;
    ribbonText: Phaser.GameObjects.Text;
    headerContainer: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        const sWidth = this.scene.scale.width;
        const sHeight = this.scene.scale.height;
        const scaleValue = getScaleValue(this.scene);

        this.headerContainer = scene.add.container(0, -sHeight / 2);
        this.starsImage = scene.add
            .image(sWidth / 2, sHeight / 3 - 20 * scaleValue, "winstars")
            .setScale(scaleValue)
            .setOrigin(0.5, 1);
        this.ribbonImage = scene.add
            .image(sWidth / 2, sHeight / 3, "ribbon")
            .setScale(scaleValue)
            .setOrigin(0.5, 1);
        this.ribbonText = this.scene.add
            .text(
                sWidth / 2,
                this.ribbonImage.y - this.ribbonImage.height*scaleValue*0.6,
                COIN_TEXT,
                {
                    fontFamily: FONT_NAME,
                    fontSize: FONT_SIZE,
                    color: WHITE_COLOR,
                }
            )
            .setOrigin(0.5, 0.5)
            .setScale(scaleValue);

        this.headerContainer.add(this.starsImage);
        this.headerContainer.add(this.ribbonImage);
        this.headerContainer.add(this.ribbonText);
        this.headerContainer.visible = false;
    }

    start() {
        this.headerContainer.visible = true;
        this.scene.tweens.add({
            targets: this.headerContainer,
            y: 0,
            duration: WIN_EFFECT_TIME,
            ease: "Bounce.easeOut",
        });
    }

    stop() {
        this.headerContainer.visible = false;
        this.headerContainer.y = -this.scene.scale.height / 2;
    }

    destroy() {}
}
