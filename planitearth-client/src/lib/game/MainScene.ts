import Phaser from "phaser";
import earthBaseSprite from "assets/earth/earth-base.svg";
import { Earth } from "./earth/Earth";

export class MainScene extends Phaser.Scene {
    private earth!: Earth;

    constructor() {
        super("MainScene");
    }

    preload() {
        this.load.image("earth", earthBaseSprite);
    }

    create() {
        this.earth = new Earth(this, this.scale.width / 2, this.scale.height / 2);
        this.add.existing(this.earth);

        this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
        });
        this.layout();
    }

    private layout() {
        const { width, height } = this.scale;
        const earthSize = Math.min(width * 0.9, height * 0.9, 640);

        this.earth.setPosition(width / 2, height / 2);
        this.earth.setScale(earthSize / 804);
    }
}