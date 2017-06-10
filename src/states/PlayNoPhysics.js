import Utils from './../utils/Utils';
import config from './../config/config';


const FLOOR_HEIGHT = 100;
const BRICK_HEIGHT = 40;
const BRICK_TOP_MARGIN_Y = 300;
const CAMERA_VIEW_WIDTH = config.CAMERA_VIEW_WIDTH;
const CAMERA_VIEW_HEIGHT = config.CAMERA_VIEW_HEIGHT;
const WORLD_BOUNDS_WIDTH = config.WORLD_BOUNDS_WIDTH;
const WORLD_BOUNDS_HEIGHT = config.WORLD_BOUNDS_HEIGHT;
const DEBUG_MODE = (config.DEBUG_MODE) ? config.DEBUG_MODE : false;


export default class PlayNoPhysics extends Phaser.State
{
    init()
    {
        console.log('[PLAY NO PHYSICS], DEBUG MODE:', DEBUG_MODE);
        console.log('[Game]:', this.game);
        console.log('[Stage]:', this.stage);
        console.log('[World]:', this.world);
        console.log('[Camera]:', this.camera);
        console.log('[Input]:', this.input);
        console.log('[Debug]:', this.game.debug);

        this.bricks = [];
        this.limitY = WORLD_BOUNDS_HEIGHT + BRICK_HEIGHT / 2;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.world.setBounds(0, 0, WORLD_BOUNDS_WIDTH, WORLD_BOUNDS_HEIGHT);
    }

    preload()
    {
        // 카메라 설정을 여기서 해줘야 topY 가 정상 동작합니다.
        this.camera.y = this.startCameraY;
    }

    create()
    {
        //this.createFloor();

        this.start();
        this.addEvent();
        this.setDebug(DEBUG_MODE);

        // DEBUG 코드
        if (this.cameraPoint) {
            this.cameraPoint.y = this.startCameraY + this.cameraPoint.height;
        }
    }

    start()
    {
        this.createBrick();
    }

    addEvent()
    {
        this.input.onDown.add(this.click, this);
        this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(this.drop, this);
    }

    setDebug(isDebugMode)
    {
        if (!isDebugMode) { return; }

        let x = 100;
        let y = config.CAMERA_VIEW_HEIGHT - 20;


        // 위크 디버그 포인트 생성
        this.weakPoint = Utils.getCircle(this.game, 10, y, 10, 0x3498db);

        // 무게 중심 디버그 포인트 생성
        this.centerPoint = Utils.getCircle(this.game, 20, y, 10, 0xFF3300);

        // 카메라 위치 디버그 포인트
        this.cameraPoint = Utils.getCircle(this.game, config.CAMERA_VIEW_WIDTH - 10, y, 10, 0xecf0f1);

        // 제한선 디버그 라인
        this.limitLine = Utils.getLine(this.game, 10, config.CAMERA_VIEW_HEIGHT - 10, config.CAMERA_VIEW_WIDTH, 0x8e44ad);
    }

    update()
    {
        this.swing(this.brick);

        if (DEBUG_MODE) {
            if (this.cursors.up.isDown) {
                this.camera.y -= 4;
            }
            else if (this.cursors.down.isDown) {
                this.camera.y += 4;
            }

            if (this.cursors.left.isDown) {
                this.camera.x -= 4;
            }
            else if (this.cursors.right.isDown) {
                this.camera.x += 4;
            }
        }
    }

    render()
    {
        if (DEBUG_MODE) {
            this.game.debug.cameraInfo(this.camera, 420, 32);

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

    updateCamera()
    {
        if (this.numBricks === 1) { return; }

        const firstBrick = this.firstBrick;
        const nextBrickY = firstBrick.y + firstBrick.height;
        const diffY = nextBrickY - this.viewCenterY;

        if (diffY < 0) {
            this.cameraY = this.cameraY + diffY;
        }
    }

    swing(brick)
    {
        if (brick && brick.isLanding === false) {
            brick.x += brick.direction * brick.speed;

            if (brick.x < 0 || brick.x + brick.width > this.world.width) {
                brick.direction *= -1;
            }
        }
    }

    createFloor()
    {
        var floor = this.addFloor();
        this.limitY = floor.y;
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
        //this.camera.follow(this.brick);

        this.updateCamera();

        /*this.world.forEach((child) => {
            console.log(child === this.brick);
        });*/

        return this.brick;
    }

    addBrick()
    {
        const brick = this.getRandomBrick();
        brick.anchor.setTo(0.5);
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


        sprite.y = this.topY + BRICK_TOP_MARGIN_Y;
        sprite.x = this.world.centerX;
        return sprite;
    }

    getRandomTexture()
    {
        //const w = parseInt(100 + Math.random() * 50);
        //const h = 20;
        const w = 150;
        const g = new Phaser.Graphics(this.game);
        g.beginFill(Math.random() * 0xFFFFFF, 0.5);
        g.drawRect(0, 0, w, BRICK_HEIGHT);
        g.endFill();
        return g;
    }

    click()
    {
        const brick = this.brick;
        const halfWidth = brick.width / 2;

        if (brick) {
            let brickX = this.input.x;
            brickX = brickX < halfWidth ? halfWidth : brickX;
            brickX = brickX + halfWidth > WORLD_BOUNDS_WIDTH ? WORLD_BOUNDS_WIDTH - halfWidth : brickX;
            brick.x = brickX;
            brick.isLannding = true;
            this.drop(brick);
        }
    }

    drop(brick)
    {
        if (!brick) { return; }

        brick.isLanding = true;

        const dropTo = this.world.height,
            lastBrick = this.bricks[this.bricks.length - 2],
            tween = this.tween = this.game.add.tween(brick).to({y: dropTo}, 1000, Phaser.Easing.Bounce.Out, true);

        tween.onUpdateCallback(() => {
            // 제한선을 넘으면 충돌감지 및 밸런스 체크
            if (this.checkCrossedLimit(brick) === true) {

                tween.stop();

                if (this.checkOverlap(brick, lastBrick) === true) {

                    this.limitY = brick.y = this.limitY - BRICK_HEIGHT;

                    const result = this.checkBlance();

                    (result.isBlance === true) ? this.createBrick() : this.gameOver(result);
                }
                else {
                    this.gameOver({brick: brick, isBlance: true});
                }
            }
        });
    }

    checkCrossedLimit(brick) {
        return (brick.y + brick.height > this.limitY);
    }

    checkOverlap(brick, lastBrick) {

        if (brick && lastBrick) {

            const brickHalfWidth = brick.width / 2,
                left = brick.x - brickHalfWidth,
                right = brick.x + brickHalfWidth,
                lastBrickHalfWidth = lastBrick.width / 2,
                limitLeft = lastBrick.x - lastBrickHalfWidth,
                limitRight = lastBrick.x + lastBrickHalfWidth;

            if (left >= limitLeft && left <= limitRight ||
                right <= limitRight && right >= limitLeft ||
                limitLeft >= left && limitRight <= right) {
                return true;
            }

            return false;
        }

        // 맨 처음인 케이스
        return true;
    }

    checkBlance()
    {
        const n = this.bricks.length;

        if (n === 1) { return {isBlance: true}; }

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

            // 방향이 바뀌어 overhang 을 리셋합니다.
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

            const floorIndex = this.getFloorIndex();
            if (maximumOverhang < totalOverhang) {
                console.log('GameOver Maximum overhang! MAXIMUM: ', Utils.digit(maximumOverhang), ', OVERHANG:', Utils.digit(totalOverhang), ']');
                return {
                    isBlance: false,
                    brick: topBrick,
                    direction: direction,
                    floorIndex: floorIndex
                };
            }

            if (direction === 'left') {
                const weakPoint = this.getLeftWeakPoint();
                if (this.getCenterOfMass(floorIndex).x < weakPoint.x) {
                    return {
                        isBlance: false,
                        brick: topBrick,
                        direction: direction,
                        floorIndex: floorIndex,
                        weakPoint: weakPoint
                    };
                }
            }
            else {
                const weakPoint = this.getRightWeakPoint();
                if (this.getCenterOfMass(floorIndex).x > weakPoint.x) {
                    return {
                        isBlance: false,
                        brick: topBrick,
                        direction: direction,
                        floorIndex: floorIndex,
                        weakPoint: weakPoint
                    };
                }
            }

            prevDirection = direction;
        }

        return {isBlance: true};
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

    getLeftWeakPoint()
    {
        const clone = this.bricks.slice(0);

        const sortedBricks = clone.sort(function(a, b) {
            return b.x - a.x;
        });

        const brick = sortedBricks[0];

        const info = {
            x: brick.x - brick.width / 2,
            brick: brick,
            index: brick.index
        };

        // DEBUG 코드
        if (this.weakPoint) {
            this.weakPoint.x = info.x;
            this.weakPoint.y = info.brick.y;
            this.world.bringToTop(this.weakPoint);
            //console.log('weakPoint[', Utils.digit(this.weakPoint.x), Utils.digit(this.weakPoint.y), ']');
        }

        return info;
    }

    getRightWeakPoint()
    {
        const clone = this.bricks.slice(0);

        const sortedBricks = clone.sort(function(a, b) {
            return (a.x + a.width) - (b.x + b.width);
        });

        const brick = sortedBricks[0];

        const info = {
            brick: brick,
            index: brick.index,
            x: brick.x + brick.width / 2
        };

        // DEBUG 코드
        if (this.weakPoint) {
            this.weakPoint.x = info.x;
            this.weakPoint.y = info.brick.y;
            this.world.bringToTop(this.weakPoint);
            //console.log('weakPoint[', Utils.digit(this.weakPoint.x), Utils.digit(this.weakPoint.y), ']');
        }

        return info;
    }

    getCenterOfMass(bottomIndex = 0)
    {
        const n = this.bricks.length,
            bottomBrick = this.bricks[bottomIndex];

        let brick,
            sumx = bottomBrick.x,
            sumy = bottomBrick.y;

        for (let i = bottomIndex + 1; i < n; i++) {
            brick = this.bricks[i];
            sumx += brick.x;
            sumy += brick.y;
        }

        const count = (n - bottomIndex),
            centerOfMassX = sumx / count,
            centerOfMassY = sumy / count;

        // DEBUG 코드
        if (this.centerPoint) {
            this.centerPoint.x = centerOfMassX;
            this.centerPoint.y = centerOfMassY;
            this.world.bringToTop(this.centerPoint);
            //console.log('cm[', Utils.digit(centerOfMassX), Utils.digit(centerOfMassY), ']', 'centerPonit[', Utils.digit(this.centerPoint.x), Utils.digit(this.centerPoint.y), ']');
        }

        return new Phaser.Point(centerOfMassX, centerOfMassY);
    }

    gameOver(result)
    {
        console.log('------------------------------------------------------');
        console.log('GAME OVER');
        console.log('------------------------------------------------------');


        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.gravity.y = 400;

        const brick = result.brick;

        if (result.isBlance === false) {
            if (result.weakPoint) {
                console.log('[CASE 1]: center of mass problem');

                const n = this.numBricks;
                const direction = result.direction;
                const weakIndex = result.weakPoint.index;

                for (let i = 0; i < n; i++) {
                    const brick = this.bricks[i];

                    this.game.physics.p2.enable(brick);
                    brick.body.mass = 100;
                }

                const weakBrick = this.bricks[weakIndex + 1];

                if (weakBrick) {
                    weakBrick.body.mass = 100;
                    weakBrick.body.angle = 360;
                    weakBrick.body.angularForce = 360;
                }
            }
            else {
                console.log('[CASE 2]: overhang problem');
            }
        }
        else {
            console.log('[CASE 3]: No Hit');
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////
    //
    // Getter & Setter
    //
    /////////////////////////////////////////////////////////////////////////////////////


    get startCameraY()
    {
        return this.world.height - this.camera.height;
    }

    get topY()
    {
        return this.camera.view.y;
    }

    set limitY(value)
    {
        this._limitY = value;

        if (this.limitLine) {
            this.limitLine.y = value;
            //console.log('limitY:', Utils.digit(this._limitY));
        }
    }

    get limitY()
    {
        return this._limitY;
    }

    set cameraY(value)
    {
        if (this.cameraTween) {
            this.cameraTween.stop();
        }

        //this.camera.y = value;
        this.cameraTween = this.game.add.tween(this.game.camera).to( {y: value}, 250, Phaser.Easing.Quadratic.In, true);

        if (this.cameraPoint) {
            this.cameraPoint.y = value + this.cameraPoint.height;
            this.cameraPoint.x = config.CAMERA_VIEW_WIDTH - this.cameraPoint.width;
        }
    }

    get cameraY()
    {
        return this.camera.y;
    }


    get firstBrick()
    {
        return this.bricks[this.bricks.length - 2];
    }


    get viewCenterY()
    {
        return this.camera.view.y + this.camera.view.height / 2;
    }

    get numBricks()
    {
        return this.bricks.length;
    }

}
