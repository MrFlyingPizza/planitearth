import Phaser from "phaser";
import { EarthFace } from "./EarthFace";

export class Earth extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        const earthImage = scene.make.image({}, false);
        earthImage.setTexture("earth");
        this.add(earthImage);

        const face = new EarthFace(scene, -96, -45);
        face.setScale(1.2);
        this.add(face);
    }
}