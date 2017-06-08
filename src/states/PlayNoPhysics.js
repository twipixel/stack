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
        this.bottomIndex = 0;

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
        brick.index = this.stackBricks.length - 1;
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
        g.beginFill(Math.random() * 0xFFFFFF, 0.5);
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

                        this.limitY = brick.y = this.limitY - brick.height;
                        this.getCenterOfMass(this.bottomIndex);


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
        console.log('');
        console.log('[[ CHECK BLANCE ]]');
        const len = this.stackBricks.length;

        if (len === 1) {
            return true;
        }

        let overhangCount = 1, r = 0, ratio, overhang, o = 0, topBrick, bottomBrick, topCx, bottomCx, topWidth, offsetX, direction, prevDirection = 'none';

        for (let i = 1 ; i < len; i++) {
            overhang = (i === 0) ? 0 : 1 / (2 * overhangCount);
            topBrick = this.stackBricks[i];
            bottomBrick = this.stackBricks[i - 1];

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

            console.log('OVERHANG [', this.digit(o), '/', this.digit(r), ']');


            if (o < r) {
                return false;
            }
            else {

                let floorIndex = this.bottomIndex - 1;
                floorIndex = (floorIndex < 0) ? 0 : floorIndex;

                let floorBrick = this.stackBricks[floorIndex];
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
                console.log('BOTTOM INDEX:', this.bottomIndex);
            }
            prevDirection = direction;
        }

        return true;
    }

    getFloorIndex()
    {
        const len = this.stackBricks.length;

        if (len === 1) {
            return 0;
        }

        let topBrick, bottomBrick, topCx, bottomCx, direction, prevDirection = 'none', floorIndex = 0;

        for (let i = 1 ; i < len; i++) {
            topBrick = this.stackBricks[i];
            bottomBrick = this.stackBricks[i - 1];

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
        let clone = this.stackBricks.slice(0);

        var sortedBricks = clone.sort(function(a, b) {
            return b.x - a.x;
        });

        sortedBricks.forEach(brick => {
            console.log('LEFT:', brick.index, brick.x);
        });

        let brick = sortedBricks[0];

        console.log(brick, brick.index, brick.x, brick.width);

        let info = {
            brick: brick,
            index: brick.index,
            x: brick.x,
        }

        console.log(info);
        return info;
    }

    getRightLimitInfo()
    {
        let clone = this.stackBricks.slice(0);

        var sortedBricks = clone.sort(function(a, b) {
            return (a.x + a.width) - (b.x + b.width);
        });

        sortedBricks.forEach(brick => {
            console.log('RIGHT:', brick.x + brick.width);
        });

        let brick = sortedBricks[0];

        console.log(brick, brick.index, brick.x, brick.width);

        let info = {
            brick: brick,
            index: brick.index,
            x: brick.x + brick.width,
        }

        console.log(info);
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

        let n = this.stackBricks.length;
        let bottomBrick = this.stackBricks[bottomIndex];
        let sumx = bottomBrick.x + bottomBrick.width / 2;
        let sumy = bottomBrick.y + bottomBrick.height / 2;

        for (let i = bottomIndex + 1; i < n; i++) {
            let brick = this.stackBricks[i];
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

    getCenterOfMassAll()
    {
        if (!this.cm) {
            let graphics = this.cm = this.game.add.graphics(0, 0);
            graphics.beginFill(0xFF3300);
            graphics.drawCircle(0, 0, 10);
            graphics.endFill();
            this.cm.x = this.brick.x + this.brick.width / 2;
            this.cm.y = this.brick.y + this.brick.height / 2;
        }
        else {
            let n = this.stackBricks.length;

            let sumx = 0, sumy = 0;

            console.log('n:', n);

            for (let i = 0; i < n; i++) {
                let brick = this.stackBricks[i];
                let cx = brick.x + brick.width / 2;
                let cy = brick.y + brick.height / 2;
                sumx += cx;
                sumy += cy;
            }

            let cx = sumx / n;
            let cy = sumy / n;

            this.cm.x = cx;
            this.cm.y = cy;

            this.game.stage.addChild(this.cm);
        }

        return new Phaser.Point(this.cm.x, this.cm.y);
    }


    checkBlanceLeftRight()
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
        console.log('*********** GAME OVER ***********()');
        //this.game.add.tween(this.brick).to( {rotation: 2}, 1000, Phaser.Easing.Bounce.Out, true);
    }
}
