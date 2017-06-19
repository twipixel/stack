export default class Gradation extends Phaser.Graphics
{
    constructor(game, isBold = false, color = 0x607D8B, alpha = 1)
    {
        super(game);

        this.color = color;
        this.alpha = alpha;
        this.isBold = isBold;

        if (isBold) {
            this.gradationWidth = 40;
            this.gradationHeight = 10;
        }
        else {
            //this.gradationWidth =  20;
            this.gradationWidth =  0;
            this.gradationHeight = 10;
        }

        this.initialize();
    }


    initialize()
    {
        const w = this.gradationWidth,
            h = this.gradationHeight,
            hh = h / 2;

        this.beginFill(this.color, this.alpha);
        this.drawRect(-w, -hh, w, h);
        this.endFill();
    }
}