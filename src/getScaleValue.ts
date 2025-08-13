export const getScaleValue = (scene: Phaser.Scene) => {
    const sWidth = scene.scale.width;
    const sHeight = scene.scale.height;
    return sWidth < sHeight
        ? sWidth < 700
            ? sWidth / 700
            : 1
        : sHeight / sWidth;
};
