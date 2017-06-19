import Gradation from './Gradation';

export default class Ruler extends Phaser.Sprite
{
    constructor(game, height, x = 0, y = 0)
    {
        super(game, x, y);

        console.log('Ruler(', arguments, ')');

        this.game = game;
        this.rulderHeight = height;

        this.initialize();
    }

    initialize()
    {
        this.gradations = [];
        let isBold, gradation, displayInterval = 100;
        const total = parseInt(this.rulderHeight / displayInterval);

        for (let i = 0; i < total; i++) {
            isBold = (i % 2 === 0);
            gradation = new Gradation(this.game, isBold);
            gradation.y = i * displayInterval;
            this.addChild(gradation);
            this.gradations.push(gradation);
        }
    }


    destroy()
    {
        const total = this.gradations.length;

        for (let i = 0; i < total; i++) {
            let gradation = this.gradations[i];
            this.removeChild(gradation);
        }

        this.game = null;
        super.destroy();
    }
}