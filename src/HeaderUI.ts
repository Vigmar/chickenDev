import {
    BLACK_COLOR,
    BLUE_COLOR,
    FONT_NAME,
    FONT_SIZE,
    MOVE_UI_TIME,
    TITLE_FONT_SIZE,
    TITLE_TEXT,
    UI_FONT_SIZE,
} from "./constants";
import { getScaleValue } from "./getScaleValue";

export class HeaderUI {
    scene: Phaser.Scene;
    uiContainer: Phaser.GameObjects.Container;
    uiBg: Phaser.GameObjects.Sprite;
    attemptsText: Phaser.GameObjects.Text;
    titleText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, label: string) {
        this.scene = scene;

        const sWidth = this.scene.scale.width;
        const sHeight = this.scene.scale.height;
        const scaleValue = getScaleValue(this.scene);

        this.uiContainer = scene.add.container();
        this.uiBg = scene.add
            .sprite(sWidth - 10 * scaleValue, sHeight * 0.05, "guiitem")
            .setOrigin(1, 0.5)
            .setScale(scaleValue);

        this.attemptsText = scene.add
            .text(this.uiBg.x - 30 * scaleValue, this.uiBg.y, label, {
                fontFamily: FONT_NAME,
                fontSize: UI_FONT_SIZE,
                color: BLUE_COLOR,
            })
            .setOrigin(1, 0.5);

        this.titleText = scene.add
            .text(sWidth / 2, this.attemptsText.y, TITLE_TEXT, {
                fontFamily: FONT_NAME,
                fontSize: TITLE_FONT_SIZE,
                color: BLACK_COLOR,
            })
            .setOrigin(0.5);

        this.attemptsText.setScale(scaleValue);
        this.titleText.setScale(scaleValue);
        this.uiContainer.add(this.uiBg);
        this.uiContainer.add(this.attemptsText);
        this.uiContainer.add(this.titleText);
    }

    moveOut() {
        this.scene.tweens.add({
            targets: this.uiContainer,
            y: -2 * this.uiBg.height,
            duration: MOVE_UI_TIME,
            ease: "Linear",
        });
    }

    moveOn() {
        this.scene.tweens.add({
            targets: this.uiContainer,
            y: 0,
            duration: MOVE_UI_TIME,
            ease: "Linear",
        });
    }

    setText(label: string) {
        this.attemptsText.setText(label);
    }
}
