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
        //var floor = this.createFloor();
        //this.limitY = floor.y;

        this.limitY = GAME_HEIGHT;
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

        let y = h - floorHeight;
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
        this.stackBricks.push(brick);
        brick.isLanding = false;
        brick.direction = (Math.random() < 0.5) ? -1 : 1;
        brick.speed = 4;
        return brick;
    }

    getRandomBrick()
    {
        let randomIndex = parseInt(Math.random() * this.bricks.length);
        let randomFrame = this.bricks[randomIndex];
        let randomTexture = this.getRandomTexture();

        let sprite = this.game.add.sprite(-100, -100, randomTexture.generateTexture());
        randomTexture.destroy();

        sprite.y = 100;
        sprite.x = this.game.world.centerX;
        return sprite;
    }

    getRandomTexture()
    {
        let h = 20;
        //let w = parseInt(100 + Math.random() * 50);
        let w = 150;
        let g = new Phaser.Graphics(this.game);
        g.beginFill(Math.random() * 0xFFFFFF);
        g.drawRect(0, 0, w, h);
        g.endFill();
        return g;
    }


    addKey()
    {
        this.game.input.onDown.add(this.click, this);

        let spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spacebar.onDown.add(this.drop.bind(this), this);
    }

    click()
    {
        if (this.brick) {
            let brickX = this.game.input.x - this.brick.width / 2;
            brickX = brickX < 0 ? 0 : brickX;
            brickX = brickX + this.brick.width > GAME_WIDTH ? GAME_WIDTH - this.brick.width : brickX;
            this.brick.x = brickX;
            this.brick.isLannding = true;
            this.drop();
        }
    }

    drop()
    {
        if (this.brick) {
            let brick = this.brick;
            let lastBrick = this.stackBricks[this.stackBricks.length - 2];
            let height = this.game.world.height;

            brick.isLanding = true;

            var tween = this.tween = this.game.add.tween(brick).to( {y: height}, 1000, Phaser.Easing.Bounce.Out, true).onUpdateCallback(() => {
                if (brick.y + brick.height > this.limitY) {
                    tween.stop();

                    if (this.checkOverlap(brick, lastBrick) === true) {
                        if (this.checkBlance() === true) {
                            this.limitY = brick.y = this.limitY - brick.height;
                            console.log('stackBricks.length:', this.stackBricks.length);
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
        if (this.stackBricks.length == 1) true;

        const len = this.stackBricks.length;

        console.log('');
        console.log('checkBlance', len);


        let leftCount = 1, rightCount = 1,
            ratio,
            leftOutRatio, rightOutRatio,
            sumLeftOutRatio = 0,sumRightOutRatio = 0,
            leftOverhang, rightOverhang,
            sumLeftOverhang = 0, sumRightOverhang = 0,
            topBrick, bottomBrick,
            topCx, bottomCx,
            topWidth,
            offsetX,
            overhang,
            direction, prevDirection = '';

        for (let i = 1 ; i < len; i++) {
            //leftOverhang = (i === 0) ? 0 : 1 / (2 * leftCount);

            topBrick = this.stackBricks[i];
            bottomBrick = this.stackBricks[i - 1];

            topCx = topBrick.x + topBrick.width / 2;
            bottomCx = bottomBrick.x + bottomBrick.width / 2;

            if (topCx < bottomCx) {
                direction = 'left';
                overhang = 1 / (2 * leftCount);
                offsetX = bottomBrick.x - topBrick.x;
                ratio = ((offsetX / topBrick.width) * 100) / 100;

                sumLeftOverhang += overhang;
                sumLeftOutRatio += ratio;
                leftCount++;

                if (sumLeftOutRatio > sumLeftOverhang) {
                    return false;
                }
            }
            else {
                direction = 'right';
                overhang = 1 / (2 * rightCount);
                offsetX = topBrick.x - bottomBrick.x;
                ratio = ((offsetX / topBrick.width) * 100) / 100;

                sumRightOverhang += overhang;
                sumRightOutRatio += ratio;
                rightCount++;

                if (sumRightOutRatio > sumRightOverhang) {
                    return false;
                }
            }

            console.log(i + ' )', direction, 'left[', this.digit(sumLeftOutRatio), '/', this.digit(sumLeftOverhang), '], right[', this.digit(sumRightOutRatio), '/', this.digit(sumRightOverhang), ']');
            prevDirection = direction;
        }

        return true;
    }

    digit(num, count = 2)
    {
        var n = Math.pow(10, count);
        return parseInt(num * n) / n;
    }

    checkBlanceOld()
    {
        console.log('');
        console.log('checkBlance');
        const len = this.stackBricks.length;
        let n = 0, r = 0, ratio, overhang, o = 0, topBrick, bottomBrick, topCx, bottomCx, topWidth, offsetX, direction, prevDirection = '';

        for (let i = 0 ; i < len; i++) {
            overhang = (i === 0) ? 0 : 1 / (2 * n);
            topBrick = this.stackBricks[i + 1];
            bottomBrick = this.stackBricks[i];

            if (topBrick) {
                topWidth = topBrick.width;

                topCx = topBrick.x + topBrick.width / 2;
                bottomCx = bottomBrick.x + bottomBrick.width / 2;

                if (topCx < bottomCx) {
                    direction = 'left';
                    offsetX = bottomBrick.x - topBrick.x;
                }
                else {
                    direction = 'right';
                    offsetX = (topBrick.x + topBrick.width) - (bottomBrick.x + bottomBrick.width);
                }

                ratio = (i === 0) ? 0 : ((offsetX / topWidth) * 100) / 100;
            }

            if (prevDirection !== '' && prevDirection !== direction) {
                console.log('overhang reset!');
                o = 0;
                r = 0;
                n = 0;
            }
            else {
                o += overhang;
                r += ratio;
            }

            n++;

            console.log(i + '>', direction, 'overhang:', overhang, 'ratio:', ratio, 'o:', o, 'r:', r);

            if (o < r) {
                return false;
            }

            prevDirection = direction;
        }

        return true;
    }

    gameOver()
    {
        console.log('       gameOver()');
        //this.game.add.tween(this.brick).to( {rotation: 2}, 1000, Phaser.Easing.Bounce.Out, true);
    }
}
