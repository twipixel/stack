import Utils from './../utils/Utils';
import config from './../config/config';

const FLOOR_HEIGHT = 100;
const GAME_WIDTH = config.GAME_WIDTH;
const GAME_HEIGHT = config.GAME_HEIGHT;
const WORLD_BOUNDS_WIDTH = config.WORLD_BOUNDS_WIDTH;
const WORLD_BOUNDS_HEIGHT = config.WORLD_BOUNDS_HEIGHT;
const DEBUG_MODE = (config.DEBUG_MODE) ? config.DEBUG_MODE : false;

export default class PlayNoPhysics extends Phaser.State
{
    init()
    {
        console.log('[ PLAY NO PHYSICS ], DEBUG MODE:', DEBUG_MODE);

        this.bricks = [];
        this.limitY = WORLD_BOUNDS_HEIGHT;
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.game.world.setBounds(0, 0, WORLD_BOUNDS_WIDTH, WORLD_BOUNDS_HEIGHT);
    }

    create()
    {
        //var floor = this.addFloor();
        //this.limitY = floor.y;

        this.start();
        this.addEvent();
        this.game.camera.y = 1858;

        this.setDebug(DEBUG_MODE);
    }

    start()
    {
        this.createBrick();
    }

    addEvent()
    {
        this.game.input.onDown.add(this.click, this);
        this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(this.drop, this);
    }

    setDebug(isDebugMode)
    {
        if (!isDebugMode) { return; }

        // 위크 디버그 포인트 생성
        let g = this.weakPoint = this.game.add.graphics(0, 0);
        g.beginFill(0x3498db);
        g.drawCircle(0, 0, 10);
        g.endFill();

        // 무게 중심 디버그 포인트 생성
        g = this.centerPoint = this.game.add.graphics(0, 0);
        g.beginFill(0xFF3300);
        g.drawCircle(0, 0, 10);
        g.endFill();
    }

    update()
    {
        this.swing(this.brick);

        if (DEBUG_MODE) {
            if (this.cursors.up.isDown) {
                this.game.camera.y -= 4;
            }
            else if (this.cursors.down.isDown) {
                this.game.camera.y += 4;
            }

            if (this.cursors.left.isDown) {
                this.game.camera.x -= 4;
            }
            else if (this.cursors.right.isDown) {
                this.game.camera.x += 4;
            }
        }
    }

    render()
    {
        if (DEBUG_MODE) {
            this.game.debug.cameraInfo(this.game.camera, 420, 32);

            const dropBrick = this.bricks[this.bricks.length - 1],
                lastBrick = this.bricks[this.bricks.length - 2];

            if (dropBrick) {
                this.game.debug.spriteCoords(dropBrick, 32, 32);
            }

            if (lastBrick) {
                this.game.debug.spriteCoords(lastBrick, 32, 80);
            }
        }
    }

    swing(brick)
    {
        if (brick && brick.isLanding === false) {
            brick.x += brick.direction * brick.speed;

            if (brick.x < 0 || brick.x + brick.width > this.game.world.width) {
                brick.direction *= -1;
            }
        }
    }

    addFloor()
    {
        const w = WORLD_BOUNDS_WIDTH,
            h = WORLD_BOUNDS_HEIGHT;

        const graphics = this.game.add.graphics(0, 0);
        graphics.beginFill(0x95a5a6);
        graphics.lineStyle(1, 0x95a5a6);
        graphics.drawRect(0, 0, w, FLOOR_HEIGHT);
        graphics.endFill();

        const y = h - FLOOR_HEIGHT;
        const sprite = this.game.add.sprite(0, y, graphics.generateTexture());
        graphics.destroy();
        return sprite;
    }

    createBrick()
    {
        this.brick = this.addBrick();
        //this.game.camera.follow(this.brick);
        return this.brick;
    }

    addBrick()
    {
        const brick = this.getRandomBrick();
        this.bricks.push(brick);
        brick.index = this.bricks.length - 1;
        brick.isLanding = false;
        brick.direction = (Math.random() < 0.5) ? -1 : 1;
        brick.speed = 4;
        return brick;
    }

    getRandomBrick()
    {
        const randomTexture = this.getRandomTexture();
        const sprite = this.game.add.sprite(-100, -100, randomTexture.generateTexture());
        randomTexture.destroy();

        sprite.y = 100;
        sprite.x = this.game.world.centerX;
        return sprite;
    }

    getRandomTexture()
    {
        //const w = parseInt(100 + Math.random() * 50);
        const w = 150;
        const h = 20;
        const g = new Phaser.Graphics(this.game);
        g.beginFill(Math.random() * 0xFFFFFF, 0.5);
        g.drawRect(0, 0, w, h);
        g.endFill();
        return g;
    }

    click()
    {
        const brick = this.brick;

        if (brick) {
            let brickX = this.game.input.x - brick.width / 2;
            brickX = brickX < 0 ? 0 : brickX;
            brickX = brickX + brick.width > WORLD_BOUNDS_WIDTH ? WORLD_BOUNDS_WIDTH - brick.width : brickX;
            brick.x = brickX;
            brick.isLannding = true;
            this.drop(brick);
        }
    }

    drop(brick)
    {
        if (!brick) { return; }

        brick.isLanding = true;

        const dropTo = this.game.world.height,
            lastBrick = this.bricks[this.bricks.length - 2],
            tween = this.tween = this.game.add.tween(brick).to({y: dropTo}, 1000, Phaser.Easing.Bounce.Out, true);

        tween.onUpdateCallback(() => {
            if (this.checkCrossedLimit(brick) === true) {

                tween.stop();

                if (this.checkOverlap(brick, lastBrick) === true) {

                    this.limitY = brick.y = this.limitY - brick.height;

                    if (this.checkBlance() === true) {
                        this.createBrick();
                    }
                    else {
                        this.gameOver('*** Blance Over GameOver');
                    }
                }
                else {
                    this.gameOver('*** Not Hit GameOver');
                }
            }
        });
    }

    checkCrossedLimit(brick) {
        return (brick.y + brick.height > this.limitY);
    }

    checkOverlap(brick, lastBrick) {

        if (brick && lastBrick) {

            const left = brick.x,
                right = brick.x + brick.width,
                limitLeft = lastBrick.x,
                limitRight = lastBrick.x + lastBrick.width;

            if (left >= limitLeft && left <= limitRight ||
                right <= limitRight && right >= limitLeft ||
                limitLeft >= left && limitRight <= right) {
                return true;
            }

            return false;
        }

        // 처음인 케이스
        return true;
    }

    checkBlance()
    {
        const n = this.bricks.length;

        if (n === 1) { return true; }

        let offsetX,
            overhang, overhangRatio,
            topWidth, topBrick, topCenterX,
            bottomBrick, bottomCenterX,
            direction, prevDirection = 'none',
            maximumOverhang = 0, totalOverhang = 0, overhangCount = 1;

        for (let i = 1 ; i < n; i++) {
            overhang = (i === 0) ? 0 : 1 / (2 * overhangCount);
            topBrick = this.bricks[i];
            bottomBrick = this.bricks[i - 1];

            if (topBrick) {
                topWidth = topBrick.width;

                topCenterX = topBrick.x + topBrick.width / 2;
                bottomCenterX = bottomBrick.x + bottomBrick.width / 2;

                if (topCenterX < bottomCenterX) {
                    direction = 'left';
                    offsetX = bottomBrick.x - topBrick.x;
                }
                else {
                    direction = 'right';
                    offsetX = (topBrick.x + topBrick.width) - (bottomBrick.x + bottomBrick.width);
                }

                overhangRatio = (i === 0) ? 0 : ((offsetX / topWidth) * 100) / 100;
            }

            // OVERHANG RESET
            if (prevDirection !== 'none' && prevDirection !== direction) {
                overhangCount = 1;
                totalOverhang = 0;
                maximumOverhang = 0;
            }
            else {
                overhangCount++;
                maximumOverhang += overhang;
                totalOverhang += overhangRatio;
            }

            if (maximumOverhang < totalOverhang ||
                direction === 'left' && this.getCenterOfMass(this.getFloorIndex()).x < this.getLeftLimit().x ||
                direction === 'right' && this.getCenterOfMass(this.getFloorIndex()).x > this.getRightLimit().x) {

                console.log('GameOver Maximum overhang! MAXIMUM: ', Utils.digit(maximumOverhang), ', OVERHANG:', Utils.digit(totalOverhang), ']');

                return false;
            }

            prevDirection = direction;
        }

        return true;
    }

    getFloorIndex()
    {
        const n = this.bricks.length;

        if (n === 1) { return 0; }

        let topBrick, bottomBrick,
            topCenterX, bottomCenterX,
            direction, prevDirection = 'none',
            floorIndex = 0;

        for (let i = 1 ; i < n; i++) {

            topBrick = this.bricks[i];
            bottomBrick = this.bricks[i - 1];

            if (topBrick) {
                topCenterX = topBrick.x + topBrick.width / 2;
                bottomCenterX = bottomBrick.x + bottomBrick.width / 2;

                if (topCenterX < bottomCenterX) {
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

    getLeftLimit()
    {
        const clone = this.bricks.slice(0);

        const sortedBricks = clone.sort(function(a, b) {
            return b.x - a.x;
        });

        const brick = sortedBricks[0];

        const info = {
            brick: brick,
            index: brick.index,
            x: brick.x,
        };

        if (this.weakPoint) {
            this.weakPoint.x = info.x;
            this.weakPoint.y = info.brick.y;
            this.game.stage.addChild(this.weakPoint);
        }

        return info;
    }

    getRightLimit()
    {
        const clone = this.bricks.slice(0);

        const sortedBricks = clone.sort(function(a, b) {
            return (a.x + a.width) - (b.x + b.width);
        });

        const brick = sortedBricks[0];

        const info = {
            brick: brick,
            index: brick.index,
            x: brick.x + brick.width,
        };

        if (this.weakPoint) {
            this.weakPoint.x = info.x;
            this.weakPoint.y = info.brick.y;
            this.game.stage.addChild(this.weakPoint);
        }

        return info;
    }

    getCenterOfMass(bottomIndex = 0)
    {
        const n = this.bricks.length,
            bottomBrick = this.bricks[bottomIndex];

        let sumx = bottomBrick.x + bottomBrick.width / 2,
            sumy = bottomBrick.y + bottomBrick.height / 2;

        for (let i = bottomIndex + 1; i < n; i++) {
            let brick = this.bricks[i];
            let cx = brick.x + brick.width / 2;
            let cy = brick.y + brick.height / 2;
            sumx += cx;
            sumy += cy;
        }

        const count = (n - bottomIndex),
            centerOfMassX = sumx / count,
            centerOfMassY = sumy / count;

        if (this.centerPoint) {
            this.centerPoint.x = centerOfMassX;
            this.centerPoint.y = centerOfMassY;
            this.game.stage.addChild(this.centerPoint);
        }

        return new Phaser.Point(centerOfMassX, centerOfMassY);
    }

    gameOver(message)
    {
        console.log('*********** GAME OVER ***********', message);
    }


    /////////////////////////////////////////////////////////////////////////////////////
    //
    // Getter & Setter
    //
    /////////////////////////////////////////////////////////////////////////////////////



    get brickY()
    {

    }

    get cameraY()
    {

    }


}
