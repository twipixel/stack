import Gradation from './Gradation';

export default class Ruler extends Phaser.Sprite
{
    constructor(game, x = 0, y = 0)
    {
        super(game, x, y);
        this.game = game;
        this.initialize();
    }

    initialize()
    {
        const worldHeight = this.game.world.height;

        this.texts = [];
        this.gradations = [];
        let isBold, height, gradation, text, displayInterval = 100;
        const total = parseInt(worldHeight / displayInterval);

        for (let i = 0; i < total; i++) {
            isBold = (i % 2 === 0);
            height = i * displayInterval;
            gradation = new Gradation(this.game, isBold);
            gradation.y = height;
            this.addChild(gradation);
            this.gradations.push(gradation);

            text = this.game.add.text(0, 0, worldHeight - height, {font: "32px Arial", fill: "#ff0044", aligh: 'right'});
            text.anchor.set(0.5);
            text.x = -gradation.width - 50;
            text.y = height;
            this.addChild(text);
            this.texts.push(text);
        }
    }

    boom()
    {

    }

    reset()
    {
        this.destroy(true);
        this.initialize();
    }


    destroy(isReset = false)
    {
        const total = this.gradations.length;

        for (let i = 0; i < total; i++) {
            let text = this.texts[i];
            let gradation = this.gradations[i];
            this.removeChild(text);
            this.removeChild(gradation);
        }

        if (isReset !== true) {
            this.game = null;
            super.destroy();
        }
    }
}