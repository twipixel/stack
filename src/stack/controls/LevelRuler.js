import Gradation from './Gradation';

export default class LevelRuler extends Phaser.Sprite
{
    constructor(game, labelList, colorList)
    {
        super(game);

        this.game = game;
        this.labelList = labelList;
        this.colorList = colorList;
        this.tweenFactor = 0;

        this.initialize();
    }

    initialize()
    {
        const totalLevel = this.labelList.length,
            levelStartY = this.game.world.height,
            worldHeight = this.game.world.height,
            cameraHeight = this.game.camera.height,
            levelHeight = (worldHeight - cameraHeight) / totalLevel;

        this.textList = [];
        for (let i = 1; i <= totalLevel; i++) {

            const level = i;
            const height = i * levelHeight;
            const y = levelStartY - height;
            const color = this.colorList[level - 1];
            const label = this.labelList[level - 1];

            //const levelText = this.game.add.text(this.game.world.width, y, label, { font: "74px Arial", fill: color, align: "center"});
            const levelText = this.game.add.text(this.game.world.centerX, y, label, { font: "74px Arial", fill: color, align: "center"});
            levelText.anchor.setTo(0.5, 0.5);
            levelText.x = this.game.world.centerX;
            levelText.y = y;
            levelText.alpha = 0.5;

            /*if (Phaser.Device.desktop) {
                levelText.anchor.setTo(1, 0.5);
            }
            else {
                // TODO 모바일에서는 텍스트 길이에 오류가 있네요!
                levelText.anchor.setTo(0.5, 0.5);
                levelText.x = this.game.world.centerX;
                levelText.y = y;
            }*/

            this.textList.push(levelText);
        }

        /*this.gradations = [];
        for (let i = 1; i <= totalLevel; i++) {

            const level = i;
            const height = i * levelHeight;
            const y = levelStartY - height;
            const color = this.colorList[level - 1];
            const label = this.labelList[level - 1];

            const gradation = new Gradation(this.game, true);
            gradation.y = y;
            this.addChild(gradation);
            this.gradations.push(gradation);
        }*/
    }

    boom()
    {
        if (this.textList) {

            const total = this.textList.length;
            const tween = this.tween = this.game.add.tween(this).to({tweenFactor:1}, 5000, Phaser.Easing.Linear.None, true);

            for (let i = 0; i < total; i++) {
                const levelText = this.textList[i];
                levelText.vx = 0;
                levelText.vy = 0;
                levelText.velocityX = 0.1 + Math.random();
                levelText.velocityY = 0.1 + Math.random() * 0.4;
                levelText.tr = Phaser.Math.degToRad(Math.random() * 30);
            }

            tween.onUpdateCallback(() => {
                for (let i = 0; i < total; i++) {
                    const levelText = this.textList[i];
                    levelText.vx += levelText.velocityX;
                    levelText.vy += levelText.velocityY;
                    levelText.x -= levelText.vx;
                    levelText.y += levelText.vy;
                    levelText.rotation += 0.1 * (-levelText.tr - levelText.rotation);
                }
            });
        }
    }

    reset()
    {

    }

    destroy()
    {
        if (this.tween) {
            this.tween.stop();
        }

        if (this.textList) {
            const total = this.textList.length;

            for (let i = 0; i < total; i++) {
                const levelText = this.textList[i];
                this.removeChild(levelText);
                levelText.destroy();
            }
        }

        if (this.gradations) {
            const total = this.gradations.length;

            for (let i = 0; i < total; i++) {
                const gradation = this.gradations[i];
                this.removeChild(gradation);
            }
        }

        this.game = null;
        this.tween = null;
        super.destroy();
    }
}