import Utils from './../utils/Utils';
import config from './../config/config';
import Ruler from './../controls/Ruler';


const BRICK_HEIGHT = 40;
const FLOOR_HEIGHT = 100;
const BRICK_TOP_MARGIN_Y = 300;
const LEVEL_GRADE = config.LEVEL_GRADE;
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


        this.soundHit = this.game.add.audio('hit');
        this.soundSlow = this.game.add.audio('heartbeat');
        this.soundGameOver = this.game.add.audio('gameOver');

        this.bricks = [];
        this.brickColors = [0xF44336, 0xE91E63, 0x9C27B0, 0x673AB7, 0x3F51B5, 0x2196F3, 0x03A9F4, 0x00BCD4, 0x009688, 0x4CAF50, 0x8BC34A, 0xCDDC39, 0xFFEB3B, 0xFFC107, 0xFF9800, 0xFF5722, 0x795548, 0x9E9E9E, 0x607D8B];
        this.swingXAngle = 0;
        this.swingYAngle = 0;
        this.swingXSpeed = 0.05;
        this.swingYSpeed = 0.08;
        this.swingXRadius = (this.world.width - 300) / 2;
        this.swingYRadius = 40;

        /**
         * 블럭을 쌓을 수 있는지 여부 (drop 중이면 false)
         * @type {boolean}
         */
        this.canIBuild = true;
        this.isGameOver = false;
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
        if (DEBUG_MODE) {
            this.cameraPoint.y = this.startCameraY + this.cameraPoint.height;
        }
    }

    start()
    {
        this.createBrick();
        this.createRuler();
    }

    addEvent()
    {
        this.input.onDown.add(this.click, this);
        this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(() => {
            this.drop(this.brick);
        }, this);

        this.input.keyboard.addKey(Phaser.Keyboard.Q).onDown.add(() => {
            this.enablePhysics();
        }, this);

        this.input.keyboard.addKey(Phaser.Keyboard.CONTROL).onDown.add(() => {
            this.slowMotion();
        }, this);
    }

    setDebug(isDebugMode)
    {
        if (isDebugMode && !this.weakPoint) {
            const y = CAMERA_VIEW_HEIGHT - 20;

            // 위크 디버그 포인트 생성
            this.weakPoint = Utils.getCircle(this.game, 10, y, 10, 0x3498db);

            // 무게 중심 디버그 포인트 생성
            this.centerPoint = Utils.getCircle(this.game, 20, y, 10, 0xc0392b);

            // 카메라 위치 디버그 포인트
            this.cameraPoint = Utils.getCircle(this.game, CAMERA_VIEW_WIDTH - 10, y, 10, 0xecf0f1);

            // 제한선 디버그 라인
            this.limitLine = Utils.getLine(this.game, 10, CAMERA_VIEW_HEIGHT - 10, CAMERA_VIEW_WIDTH, 0x8e44ad);
        }

        if (this.weakPoint) {
            this.weakPoint.visible = isDebugMode;
            this.centerPoint.visible = isDebugMode;
            this.cameraPoint.visible = isDebugMode;
            this.limitLine.visible = isDebugMode;
        }
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
        if (Phaser.Device.desktop && DEBUG_MODE) {
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

    shutdown()
    {
        this.world.removeChild(this.ruler);
        this.ruler.destroy;
        this.ruler = null;
    }

    updateCamera()
    {
        if (this.numBricks === 1) { return; }

        const firstBrick = this.firstBrick;
        const nextBrickY = firstBrick.y + firstBrick.height;
        const diffY = nextBrickY - this.viewCenterY - 200;

        console.log('viewCenterY:', this.viewCenterY);

        if (diffY < 0) {
            this.cameraY = this.cameraY + diffY;
        }
    }

    swing(brick)
    {
        if (brick && brick.isLanding === false) {
            brick.x = this.brickCenterX + Math.sin(this.swingXAngle) * this.swingXRadius;
            brick.y = this.brickCenterY + Math.cos(this.swingYAngle) * this.swingYRadius;

            this.swingXAngle += this.swingXSpeed;
            this.swingYAngle += this.swingYSpeed;
        }
    }

    slowMotion()
    {
        if (this.slowTween) {
            this.slowTween.stop();
        }

        const speedX = this.swingXSpeed;
        const speedY = this.swingYSpeed;
        const slowX = speedX / 10;
        const slowY = speedY / 10;

        this.slowTween = this.game.add.tween(this).to({swingXSpeed:slowX , swingYSpeed:slowY}, 200, Phaser.Easing.Sinusoidal.Out, true);

        setTimeout(() => {
            this.swingXSpeed = speedX;
            this.swingYSpeed = speedY;
        }, 800);

        this.soundSlow.play();
    }

    moveLeftRight(brick)
    {
        if (brick && brick.isLanding === false) {
            brick.x += brick.direction * brick.speed;

            const halfWidth = brick.width / 2;
            if (brick.x - halfWidth < 0 || brick.x + halfWidth > this.world.width) {
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
        this.canIBuild = true;
        this.brick = this.addBrick();

        //this.camera.follow(this.brick);
        this.updateCamera();

        /*this.world.forEach((child) => {
            console.log(child === this.brick);
        });*/

        return this.brick;
    }

    createRuler()
    {
        this.ruler = new Ruler(this.game, WORLD_BOUNDS_HEIGHT);
        this.ruler.x = CAMERA_VIEW_WIDTH;
        this.world.addChild(this.ruler);
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
        brick.autoCull = true;
        brick.checkWorldBounds = true;
        return brick;
    }

    getRandomBrick()
    {
        const randomTexture = this.getRandomTexture();
        const sprite = this.game.add.sprite(-100, -100, randomTexture.generateTexture());
        //randomTexture.destroy();
        sprite.randomTexture = randomTexture;
        sprite.x = this.brickCenterX;
        sprite.y = this.startDropBrickY;
        return sprite;
    }

    getRandomTexture()
    {
        //const w = parseInt(100 + Math.random() * 50);
        //const h = 20;
        const w = 150;
        const g = new Phaser.Graphics(this.game);
        const randomColorIndex = parseInt(Math.random() * this.brickColors.length);

        g.beginFill(this.brickColors[randomColorIndex], 1);
        g.drawRect(0, 0, w, BRICK_HEIGHT);
        g.endFill();
        return g;
    }

    click()
    {
        const brick = this.brick;

        if (brick) {
            this.setBrickXToMouseX(brick);
            this.drop(brick);
        }
    }

    setBrickXToMouseX(brick)
    {
        const halfWidth = brick.width / 2;
        let brickX = this.input.x;
        brickX = brickX < halfWidth ? halfWidth : brickX;
        brickX = brickX + halfWidth > WORLD_BOUNDS_WIDTH ? WORLD_BOUNDS_WIDTH - halfWidth : brickX;
        brick.x = brickX;
    }

    drop(brick)
    {
        if (!brick || this.canIBuild === false) { return; }

        this.canIBuild = false;
        brick.isLanding = true;

        const dropTo = this.world.height,
            lastBrick = this.bricks[this.bricks.length - 2],
            tween = this.dropTween = this.game.add.tween(brick).to({y: dropTo}, 1000, Phaser.Easing.Bounce.Out, true);

        tween.onUpdateCallback(() => {
            // 제한선을 넘으면 충돌감지 및 밸런스 체크
            if (this.checkCrossedLimit(brick) === true) {

                if (this.checkOverlap(brick, lastBrick) === true) {

                    tween.stop();

                    this.limitY = brick.y = this.limitY - BRICK_HEIGHT;

                    const result = this.checkBlance();

                    if (result.isBlance === true) {
                        this.hitAction(brick);
                        this.createBrick();
                    }
                    else {
                        this.gameOver(result);
                    }
                }
                else {
                    this.gameOver({brick: brick, isBlance: true, reason: 'No Hit'});
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

    hitAction(brick)
    {
        if (this.guideLight) {
            this.guideLight.destroy();
            this.guideLightTween.stop();
        }

        const clone = this.game.add.sprite(-100, -100, brick.randomTexture.generateTexture());
        clone.anchor.setTo(0.5, 1);
        //clone.alpha = 0.5;
        clone.x = brick.x;
        clone.y = brick.y + brick.height / 2;

        const height = clone.y - this.cameraY;
        this.guideLightTween = this.game.add.tween(clone).to( {height: height, alpha:0.05}, 240, Phaser.Easing.Elastic.Out, true);
        this.guideLight = clone;
        this.soundHit.play();
    }

    checkBlance()
    {
        const n = this.bricks.length;

        if (n === 1 || this.isGameOver) {
            this.camera.shake(0.002, Math.random() * 250);
            return {isBlance: true};
        }

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
                const weakPoint = (direction === 'left') ? this.getLeftWeakPoint() : this.getRightWeakPoint();
                return {
                    brick: topBrick,
                    isBlance: false,
                    direction: direction,
                    weakPoint: weakPoint,
                    floorIndex: floorIndex,
                    reason: 'Maximum Overhang is Over'
                };
            }

            if (direction === 'left') {
                const weakPoint = this.getLeftWeakPoint();
                if (this.getCenterOfMass(floorIndex).x < weakPoint.x) {
                    return {
                        brick: topBrick,
                        isBlance: false,
                        direction: direction,
                        weakPoint: weakPoint,
                        floorIndex: floorIndex,
                        reason: 'Bricks Collapse'
                    };
                }
            }
            else {
                const weakPoint = this.getRightWeakPoint();
                if (this.getCenterOfMass(floorIndex).x > weakPoint.x) {
                    return {
                        brick: topBrick,
                        isBlance: false,
                        direction: direction,
                        weakPoint: weakPoint,
                        floorIndex: floorIndex,
                        reason: 'Bricks Collapse'
                    };
                }
            }

            prevDirection = direction;
        }

        this.camera.shake(0.002, Math.random() * 250);

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
        if (DEBUG_MODE) {
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
        if (DEBUG_MODE) {
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
        if (DEBUG_MODE) {
            this.centerPoint.x = centerOfMassX;
            this.centerPoint.y = centerOfMassY;
            this.world.bringToTop(this.centerPoint);
            //console.log('cm[', Utils.digit(centerOfMassX), Utils.digit(centerOfMassY), ']', 'centerPonit[', Utils.digit(this.centerPoint.x), Utils.digit(this.centerPoint.y), ']');
        }

        return new Phaser.Point(centerOfMassX, centerOfMassY);
    }

    gameOver(result)
    {
        if (this.isGameOver) {
            return;
        }

        if (this.guideLight) {
            this.guideLight.destroy();
            this.guideLightTween.stop();
        }

        console.log('------------------------------------------------------');
        console.log('GAME OVER', result.reason ? '( ' + result.reason + ' )' : '');
        console.log('------------------------------------------------------');

        this.isGameOver = true;
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.gravity.y = 400;

        const n = this.numBricks;

        for (let i = 0; i < n; i++) {
            const brick = this.bricks[i];

            this.game.physics.p2.enable(brick);
            brick.body.mass = 100;
        }

        // 꽈꽝!
        this.camera.shake(0.2, 1000);
        this.camera.follow(result.brick);
        this.dropBrick.body.velocity.y = 5000;

        if (result.isBlance === false) {

            const weakPoint = result.weakPoint;

            if (weakPoint) {
                const weakIndex = weakPoint.index;
                const weakBrick = this.bricks[weakIndex + 1];

                if (weakBrick) {
                    weakBrick.body.mass = 100;
                    weakBrick.body.angle = 360;
                    weakBrick.body.angularForce = 360;
                }
            }
        }

        this.soundGameOver.play();
    }

    /**
     * 디버그 함수
     * 모든 블럭에 물리 적용
     */
    enablePhysics()
    {
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.gravity.y = 400;

        const n = this.numBricks;

        for (let i = 0; i < n; i++) {
            const brick = this.bricks[i];
            this.game.physics.p2.enable(brick);
            brick.body.mass = 100;
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////
    //
    // Getter & Setter
    //
    /////////////////////////////////////////////////////////////////////////////////////


    /**
     * 시작 시 맨 바닥이 보이도록 설정
     * @returns {number}
     */
    get startCameraY()
    {
        return this.world.height - this.camera.height;
    }

    /**
     * 현재 보이는 화면의 가장 상단
     * preload 에서 camera.y = startCameraY 로 설정 해줘야 정상 동작합니다.
     * @returns {number}
     */
    get topY()
    {
        return this.camera.view.y;
    }

    /**
     * 충돌검사를 제한선을 넘었을 때 하게 됩니다.
     * @param value
     */
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

    /**
     * 카메라를 모션과 함께 이동 시킵니다.
     * @param value
     */
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

    get dropBrick()
    {
        return this.bricks[this.bricks.length - 1];
    }

    /**
     * 현재 떨어질 블럭 말고 stacking 된 최상단의 블럭을 반환합니다.
     * @returns {*}
     */
    get firstBrick()
    {
        return this.bricks[this.bricks.length - 2];
    }

    /**
     * 현재 보이는 화면의 중앙
     * @returns {number}
     */
    get viewCenterY()
    {
        return this.camera.view.y + this.camera.view.height / 2;
    }

    /**
     * 총 블럭의 개수
     * @returns {Number}
     */
    get numBricks()
    {
        return this.bricks.length;
    }

    /**
     * swing 시 brick의 센터 x
     * @returns {number}
     */
    get brickCenterX()
    {
        return this.world.centerX;
    }

    /**
     * swing 시 brick 의 센터 y
     * @returns {number}
     */
    get brickCenterY()
    {
        return this.startDropBrickY;
    }

    /**
     * 드랍 벽돌 시작 위치
     * @returns {number}
     */
    get startDropBrickY()
    {
        return this.topY + BRICK_TOP_MARGIN_Y;
    }

}
