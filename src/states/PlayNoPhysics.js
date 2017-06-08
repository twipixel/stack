import Utils from './../utils/Utils';
import config from './../config/config';

const GAME_WIDTH = config.GAME_WIDTH;
const GAME_HEIGHT = config.GAME_HEIGHT;

export default class PlayNoPhysics extends Phaser.State
{
    init()
    {
        console.log('[ PLAY NO PHYSICS ]');

        this.bricks = [];
        this.bottomIndex = 0;
        this.game.world.bounds = new Phaser.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    create()
    {
        this.addEvent();

        //var floor = this.getFloor();
        //this.limitY = floor.y;
        this.limitY = GAME_HEIGHT;

        this.start();
    }

    start()
    {
        this.brick = this.addBrick();
    }

    update()
    {
        let brick = this.brick;

        if (brick) {
            this.swing(brick);
        }
    }

    swing(brick)
    {
        if (brick.isLanding === false) {
            brick.x += brick.direction * brick.speed;

            if (brick.x < 0 || brick.x + brick.width > this.game.world.width) {
                brick.direction *= -1;
            }
        }
    }

    getFloor()
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

    addBrick()
    {
        let brick = this.getRandomBrick();
        this.bricks.push(brick);
        brick.idx = brick.index = this.bricks.length - 1;

        console.log('brick.index:', brick.index);
        brick.isLanding = false;
        brick.direction = (Math.random() < 0.5) ? -1 : 1;
        brick.speed = 4;
        return brick;
    }

    getRandomBrick()
    {
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
        g.beginFill(Math.random() * 0xFFFFFF, 0.5);
        g.drawRect(0, 0, w, h);
        g.endFill();
        return g;
    }

    addEvent()
    {
        this.game.input.onDown.add(this.click, this);
        this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(this.drop, this);
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
        let brick = this.brick;

        if (brick) {
            brick.isLanding = true;

            let dropTo = this.game.world.height;
            let dropBrick = this.bricks[this.bricks.length - 2];

            let tween = this.tween =
                this.game.add.tween(brick).to({y: dropTo}, 1000, Phaser.Easing.Bounce.Out, true).onUpdateCallback(
                    () => {
                        if (brick.y + brick.height > this.limitY) {

                            tween.stop();

                            if (this.checkOverlap(brick, dropBrick) === true) {

                                this.limitY = brick.y = this.limitY - brick.height;

                                if (this.checkBlance() === true) {
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
                    }
                );
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
        console.log('');
        console.log('[[ CHECK BLANCE ]]');
        const len = this.bricks.length;

        if (len === 1) {
            return true;
        }

        let overhangCount = 1, r = 0, ratio, overhang, o = 0, topBrick, bottomBrick, topCx, bottomCx, topWidth, offsetX, direction, prevDirection = 'none';

        for (let i = 1 ; i < len; i++) {
            overhang = (i === 0) ? 0 : 1 / (2 * overhangCount);
            topBrick = this.bricks[i];
            bottomBrick = this.bricks[i - 1];

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

            // OVERHANG RESET
            if (prevDirection !== 'none' && prevDirection !== direction) {
                o = 0;
                r = 0;
                overhangCount = 1;
            }
            else {
                o += overhang;
                r += ratio;
                overhangCount++;
            }

            console.log('OVERHANG [', Utils.digit(o), '/', Utils.digit(r), ']');


            if (o < r) {
                return false;
            }
            else {

                let floorIndex = this.bottomIndex - 1;
                floorIndex = (floorIndex < 0) ? 0 : floorIndex;

                let floorBrick = this.bricks[floorIndex];
                let limitX = (direction === 'left') ? floorBrick.x : floorBrick.x + floorBrick.width;

                if (!this.limit) {
                    let graphics = this.limit = this.game.add.graphics(0, 0);
                    graphics.beginFill(0x3498db);
                    graphics.drawCircle(0, 0, 10);
                    graphics.endFill();
                }


                let limitInfo;

                if (direction === 'left') {

                    limitInfo = this.getLeftLimitInfo();

                    this.bottomIndex = limitInfo.index;
                    this.limit.x = limitInfo.x;
                    this.limit.y = limitInfo.brick.y;
                    this.game.stage.addChild(this.limit);
                    let cm = this.getCenterOfMass(this.getFloorIndex());

                    if (cm.x < limitInfo.x) {
                        return false;
                    }
                }
                else {

                    limitInfo = this.getRightLimitInfo();

                    this.bottomIndex = limitInfo.index;
                    this.limit.x = limitInfo.x;
                    this.limit.y = limitInfo.brick.y;
                    this.game.stage.addChild(this.limit);
                    let cm = this.getCenterOfMass(this.getFloorIndex());

                    if (cm.x > limitInfo.x) {
                        return false;
                    }
                }
            }

            if (prevDirection !== direction) {
                this.bottomIndex = i;
            }
            prevDirection = direction;
        }

        return true;
    }

    getFloorIndex()
    {
        const len = this.bricks.length;

        if (len === 1) {
            return 0;
        }

        let topBrick, bottomBrick, topCx, bottomCx, direction, prevDirection = 'none', floorIndex = 0;

        for (let i = 1 ; i < len; i++) {
            topBrick = this.bricks[i];
            bottomBrick = this.bricks[i - 1];

            if (topBrick) {

                topCx = topBrick.x + topBrick.width / 2;
                bottomCx = bottomBrick.x + bottomBrick.width / 2;

                if (topCx < bottomCx) {
                    direction = 'left';
                }
                else {
                    direction = 'right';
                }
            }

            if (prevDirection !== direction) {
                floorIndex = i;
            }

            prevDirection = direction;
        }

        return floorIndex;
    }

    getLeftLimitInfo()
    {
        let clone = this.bricks.slice(0);

        var sortedBricks = clone.sort(function(a, b) {
            return b.x - a.x;
        });

        let brick = sortedBricks[0];

        let info = {
            brick: brick,
            index: brick.index,
            x: brick.x,
        };

        return info;
    }

    getRightLimitInfo()
    {
        let clone = this.bricks.slice(0);

        var sortedBricks = clone.sort(function(a, b) {
            return (a.x + a.width) - (b.x + b.width);
        });

        let brick = sortedBricks[0];

        let info = {
            brick: brick,
            index: brick.index,
            x: brick.x + brick.width,
        };

        return info;
    }

    getCenterOfMass(bottomIndex = 0)
    {
        if (!this.cm) {
            let graphics = this.cm = this.game.add.graphics(0, 0);
            graphics.beginFill(0xFF3300);
            graphics.drawCircle(0, 0, 10);
            graphics.endFill();
        }

        let n = this.bricks.length;
        let bottomBrick = this.bricks[bottomIndex];
        let sumx = bottomBrick.x + bottomBrick.width / 2;
        let sumy = bottomBrick.y + bottomBrick.height / 2;

        for (let i = bottomIndex + 1; i < n; i++) {
            let brick = this.bricks[i];
            let cx = brick.x + brick.width / 2;
            let cy = brick.y + brick.height / 2;
            sumx += cx;
            sumy += cy;
        }

        let count = (n - bottomIndex);
        this.cm.x = sumx / count;
        this.cm.y = sumy / count;
        this.game.stage.addChild(this.cm);
        return new Phaser.Point(this.cm.x, this.cm.y);
    }

    gameOver()
    {
        console.log('*********** GAME OVER ***********()');
        //this.game.add.tween(this.brick).to( {rotation: 2}, 1000, Phaser.Easing.Bounce.Out, true);
    }
}
