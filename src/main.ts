import Phaser from "phaser";

import MainGame from "./Game";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "chicken-road",
    backgroundColor: "#ffffff",
    scene: [MainGame],
    
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
    },
	 render: {
        roundPixels: true  // ← Вот это ключевое!
    },
};

export default new Phaser.Game(config);

