import config from './../config/config';

const GAME_WIDTH = config.GAME_WIDTH;
const GAME_HEIGHT = config.GAME_HEIGHT;

export default class PlayNoPhysics extends Phaser.State
{
    init()
    {
        console.log('1. Play.init()');
        this.bricks = ['blue', 'red', 'yellow'];
        this.stackBricks = [];

        this.game.world.bounds = new Phaser.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT);
        // setting gravity
        this.game.physics.arcade.gravity = 250;
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
        var floor = this.createFloor();

        this.limitY = floor.y;
        console.log('limitY:', this.limitY);

        this.start();
    }

    update()
    {
        if (this.brick) {
            let brick = this.brick;

            if (brick.isLanding === false) {
                brick.x += brick.direction * brick.speed;

                let w = brick.width;

                if (brick.x < 0 || brick.x + brick.width > this.game.world.width) {
                    brick.direction *= -1;
                }
            }
        }
    }

    createFloor()
    {
        let w = GAME_WIDTH,
            h = GAME_HEIGHT,
            floorHeight = 100;

        let graphics = this.game.add.graphics(0, 0);
        graphics.beginFill(0x95a5a6);
        graphics.lineStyle(1, 0x95a5a6);
        graphics.drawRect(0, 0, w, floorHeight);
        graphics.endFill();

        var y = h - floorHeight;
        let sprite = this.game.add.sprite(0, y, graphics.generateTexture());
        graphics.destroy();
        return sprite;
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
        //sprite.anchor.x = 0.5;
        //sprite.anchor.y = 0.5;
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
        if (this.brick) {
            let brick = this.brick;
            let lastBrick = this.stackBricks[this.stackBricks.length - 1];
            let height = this.game.world.height;

            brick.isLanding = true;

            var tween = this.tween = this.game.add.tween(brick).to( {y: height}, 1000, Phaser.Easing.Bounce.Out, true).onUpdateCallback(() => {
                if (brick.y + brick.height > this.limitY) {
                    tween.stop();

                    if (this.checkOverlap(brick, lastBrick) === true) {
                        if (this.checkBlance() === true) {
                            this.limitY = brick.y = this.limitY - brick.height;
                            this.stackBricks.push(brick);
                            this.brick = this.addBrick();
                        }
                        else {
                            this.gameOver();
                        }
                    }
                    else {
                        this.gameOver();
                    }
                }
            });
        }
    }

    checkOverlap(spriteA, spriteB) {
        if (spriteA && spriteB) {
            return Phaser.Rectangle.intersects(spriteA, spriteB);
        }
        // 처음인 케이스
        return true;
    }

    checkBlance()
    {


        return true;
    }

    gameOver()
    {
        console.log('       gameOver()');
        this.game.add.tween(this.brick).to( {rotation: 2}, 1000, Phaser.Easing.Bounce.Out, true);
    }
}
