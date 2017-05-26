export default class Play extends Phaser.State
{
    init()
    {
        console.log('1. Play.init()');
        this.bricks = ['blue', 'red', 'yellow'];
    }

    preload()
    {
        console.log('2. Play.preload()');
    }

    create()
    {
        console.log('3. Play.create()');
        console.log('this', this);
        console.log('game', this.game);
        console.log('stage', this.game.stage);
        console.log('world:', this.game.world);

        this.addKey();
        this.createFloor();

        this.start();
    }

    update()
    {
        if (this.brick) {
            let brick = this.brick;

            if (brick.isLanding === false) {
                brick.x += brick.direction * brick.speed;

                let w = brick.width;
                let hw = w / 2;

                if (brick.x - hw < 0 || brick.x + hw > this.game.world.width) {
                    brick.direction *= -1;
                }
            }
        }
    }

    createFloor()
    {
        let w = this.game.world.width,
            h = this.game.world.height,
            floorHeight = 100;

        let graphics = this.game.add.graphics(0, 0);
        graphics.beginFill(0x95a5a6);
        graphics.lineStyle(1, 0x95a5a6);
        graphics.drawRect(0, 0, w, floorHeight);
        graphics.endFill();
        let sprite = this.game.add.sprite(0, h - floorHeight, graphics.generateTexture());
        graphics.destroy();
    }

    start()
    {
        this.brick = this.addBrick();
    }

    addBrick()
    {
        let brick = this.getRandomBrick();
        brick.isLanding = false;
        brick.direction = (Math.random() < 0.5) ? -1 : 1;
        brick.speed = 4;
        return brick;
    }

    getRandomBrick()
    {
        let randomIndex = parseInt(Math.random() * this.bricks.length);
        let randomFrame = this.bricks[randomIndex];
        let sprite = this.game.add.sprite(-100, -100, 'bricks', randomFrame);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.y = 100;
        sprite.x = this.game.world.centerX;
        return sprite;
    }

    addKey()
    {
        let spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spacebar.onDown.add(this.drop.bind(this), this);
    }

    drop()
    {
        console.log('drop');

        if (this.brick) {
            let brick = this.brick;
            brick.isLanding = true;

            let height = this.game.world.height;
            this.game.add.tween(brick).to( {y: height}, 1000, Phaser.Easing.Bounce.Out, true).onUpdateCallback(() => {
                console.log(this.brick.y);
            });
        }
    }
}
