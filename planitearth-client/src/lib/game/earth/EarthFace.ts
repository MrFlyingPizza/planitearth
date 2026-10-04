import Phaser from "phaser";

export class EarthFace extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        for (const eyeX of [0, 100]) {
            this.addEye(eyeX);
            this.addBrow(eyeX);
        }
    }

    private addEye(x: number) {
        const eye = this.scene.make.graphics({ x, y: 0 }, false);
        eye.fillStyle(0xffffff, 1);
        eye.fillEllipse(30, 50, 40, 60);
        this.add(eye);
    }

    private addBrow(x: number) {
        const brow = this.scene.make.graphics({ x, y: 0 }, false);
        brow.lineStyle(10, 0xffffff, 1);
        brow.strokePoints(
            new Phaser.Curves.CubicBezier(
                new Phaser.Math.Vector2(0, 20),
                new Phaser.Math.Vector2(20, 0),
                new Phaser.Math.Vector2(40, 0),
                new Phaser.Math.Vector2(60, 20),
            ).getPoints(16),
        );
        this.add(brow);
    }
}