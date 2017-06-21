import Gradation from './Gradation';

export default class LevelRuler extends Phaser.Sprite
{
    constructor(game, labelList, colorList, worldHeight, cameraHeight)
    {
        super(game);

        this.game = game;
        this.labelList = labelList;
        this.colorList = colorList;
        this.worldHeight = worldHeight;
        this.cameraHeight = cameraHeight;
        this.levelStartY = worldHeight;

        this.initialize();
    }

    initialize()
    {
        const totalLevel = this.labelList.length;
        const levelHeight = (this.worldHeight - this.cameraHeight) / totalLevel;

        this.textList = [];
        for (let i = 1; i <= totalLevel; i++) {

            const level = i;
            const height = i * levelHeight;
            const y = this.levelStartY - height;
            const color = this.colorList[level - 1];
            const label = this.labelList[level - 1];

            const levelText = this.game.add.text(this.game.world.width, y, label, { font: "74px AppleGothic", fill: color, align: "center"});
            levelText.anchor.setTo(1, 0.5);
            //levelText.alpha = 0.5;
            this.textList.push(levelText);
        }

        /*this.gradations = [];
        for (let i = 1; i <= totalLevel; i++) {

            const level = i;
            const height = i * levelHeight;
            const y = this.levelStartY - height;
            const color = this.colorList[level - 1];
            const label = this.labelList[level - 1];

            const gradation = new Gradation(this.game, true);
            gradation.y = y;
            this.addChild(gradation);
            this.gradations.push(gradation);
        }*/
    }

    destroy()
    {
        if (this.textList) {
            const total = this.textList.length;

            for (let i = 0; i < total; i++) {
                let levelText = this.textList[i];
                this.removeChild(levelText);
                levelText.destroy();
            }
        }

        if (this.gradations) {
            const total = this.gradations.length;

            for (let i = 0; i < total; i++) {
                let gradation = this.gradations[i];
                this.removeChild(gradation);
            }
        }

        this.game = null;
        super.destroy();
    }
}