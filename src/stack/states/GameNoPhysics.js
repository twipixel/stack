import Utils from '../utils/Utils';
import Config from '../config/Config';
import Ruler from '../controls/Ruler';
import LevelRuler from '../controls/LevelRuler';

const BRICK_WIDTH = 200
    , BRICK_HEIGHT = 40
    , FLOOR_HEIGHT = 100
    , SCORE_JUMP_HEIGHT = 200
    , BRICK_TOP_MARGIN_Y = 300
    , CAMERA_BRICK_SPACE = 250
    , SCORE_PERPECT_WIDTH = 1
    , SCORE_GOOD_WIDTH = 20
    , SCORE_EXCELLENT_WIDTH = SCORE_GOOD_WIDTH / 2
    , SCORE_PREPECT = 10
    , SCORE_EXCELLENT = 5
    , SCORE_GOOD = 2
    , SOCRE_NORMAL = 1
    , LEVEL_LABEL = ['READY', 'EASY', 'NORMAL', 'HARD', 'CRAZY']
    //, LEVEL_LABEL = ['LEVEL1', 'LEVEL2', 'LEVEL3', 'LEVEL4', 'LEVEL5']
    , LEVEL_COLOR = ['#9E9E9E', '#03A9F4', '#4CAF50', '#FF5722', '#E91E63']
    , LEVEL_GRADE = LEVEL_LABEL.length
    , CAMERA_VIEW_WIDTH = Config.CAMERA_VIEW_WIDTH
    , CAMERA_VIEW_HEIGHT = Config.CAMERA_VIEW_HEIGHT
    , WORLD_BOUNDS_WIDTH = Config.WORLD_BOUNDS_WIDTH
    , WORLD_BOUNDS_HEIGHT = Config.WORLD_BOUNDS_HEIGHT
    , DEBUG_MODE = (Config.DEBUG_MODE) ? Config.DEBUG_MODE : false;


export default class GameNoPhysics extends Phaser.State
{
    /**
     * 맨 바닥 블럭을 제외하고 무게 중심 점을 구합니다.
     *
     * 무게 중심이 좌우 weakPoint 를 넘어가면 쓰러지는 것으로 계산식을 만듭니다.
     *
     * 무게 중심 공식 (OverHang 계산식)
     * https://medium.com/@indecs/stacking-books-debd97dd21ed
     * 블럭 길이 / 2 * (n + 1)
     */
    init()
    {
        console.log('@@@@@@@@@@@@ init!');
        console.log('[GAME NO PHYSICS], DEBUG MODE:', DEBUG_MODE);
        console.log('[Game]:', this.game);
        console.log('[Stage]:', this.stage);
        console.log('[World]:', this.world);
        console.log('[Camera]:', this.camera);
        console.log('[Input]:', this.input);
        console.log('[Debug]:', this.game.debug);

        this.initialize();
    }


    preload()
    {
        console.log('@@@@@@@@@@@@ preload!');

        // 카메라 설정을 여기서 해줘야 topY 가 정상 동작합니다.
        this.camera.y = this.startCameraY;
        this.levelHeight = (this.world.height - this.camera.height) / LEVEL_GRADE;
    }


    create()
    {
        console.log('@@@@@@@@@@@@ create!');

        this.start();
        this.addEvent();
        this.setDebug(DEBUG_MODE);
    }


    initialize()
    {
        // 배트에 야구공 맞는 소리
        this.soundHit = this.game.add.audio('baseball-bat');

        // 실로폰 소리
        this.soundHit0 = this.game.add.audio('xylophone-a');
        this.soundHit1 = this.game.add.audio('xylophone-b');
        this.soundHit2 = this.game.add.audio('xylophone-c');
        this.soundHit3 = this.game.add.audio('xylophone-c2');
        this.soundHit4 = this.game.add.audio('xylophone-d1');
        this.soundHit5 = this.game.add.audio('xylophone-e1');
        this.soundHit6 = this.game.add.audio('xylophone-f');
        this.soundHit7 = this.game.add.audio('xylophone-g');
        this.hitSounds = [this.soundHit0, this.soundHit1, this.soundHit2, this.soundHit3, this.soundHit4, this.soundHit5, this.soundHit6, this.soundHit7, ];

        // 심장박동 소리
        this.soundHeartbeat = this.game.add.audio('heartbeat');

        // 볼링공 터지는 소리
        this.soundBowling = this.game.add.audio('bowling');

        // Boom ~~~
        this.soundBoom = this.game.add.audio('boom');

        // 물방울 떨어지는 소리
        this.soundDripping = this.game.add.audio('dripping');

        this.bricks = [];
        this.brickColors = [0xF44336, 0xE91E63, 0x9C27B0, 0x673AB7, 0x3F51B5, 0x2196F3, 0x03A9F4, 0x00BCD4, 0x009688, 0x4CAF50, 0x8BC34A, 0xCDDC39, 0xFFEB3B, 0xFFC107, 0xFF9800, 0xFF5722, 0x795548, 0x9E9E9E, 0x607D8B];
        this.swingXAngle = 0;
        this.swingYAngle = 0;
        this.defaultXSpeed = 0.05;
        this.defaultYSpeed = 0.08;
        this.levelXSpeed = 0.02;
        this.levelYSpeed = 0.05;
        this.swingXSpeed = this.defaultXSpeed;
        this.swingYSpeed = this.defaultYSpeed;
        this.defaultXRadius = (this.world.width - 300) / 2;
        this.defaultYRadius = 40;
        this.levelXRadius = 10;
        this.levelYRadius = 4;
        this.swingXRadius = this.defaultXRadius;
        this.swingYRadius = this.defaultYRadius;
        this.maxXSpeed = this.defaultXSpeed + this.levelXSpeed * LEVEL_GRADE;
        this.maxYSpeed = this.defaultYSpeed + this.levelYSpeed * LEVEL_GRADE;
        this.maxXRadius = this.defaultXRadius + this.levelXRadius * LEVEL_GRADE;
        this.maxYRadius = this.defaultYRadius + this.levelYRadius * LEVEL_GRADE;
        this.timeFactor = 0;
        this.remainXSpeed = 0;
        this.remainYSpeed = 0;
        this.remainXRadius = 0;
        this.remainYRadius = 0;
        this.isRandomBrickWidth = false;
        this._totalScore = 0;

        /**
         * 블럭을 쌓을 수 있는지 여부 (drop 중이면 false)
         * @type {boolean}
         */
        this.canIBuild = true;
        this.isGameOver = false;
        this.isGameOverTriggered = false;
        this.limitY = WORLD_BOUNDS_HEIGHT + BRICK_HEIGHT / 2;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.world.setBounds(0, 0, WORLD_BOUNDS_WIDTH, WORLD_BOUNDS_HEIGHT);
    }


    start()
    {
        //this.createFloor();
        this.createBrick();
        this.createRuler();
    }


    addEvent()
    {
        this.input.onDown.add(this.click, this);
        this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(() => {
            this.drop(this.currentBrick);
        }, this);

        this.input.keyboard.addKey(Phaser.Keyboard.Q).onDown.add(() => {
            this.enablePhysics();
        }, this);

        this.input.keyboard.addKey(Phaser.Keyboard.W).onDown.add(() => {
            this.disablePhysics();
        }, this);

        this.input.keyboard.addKey(Phaser.Keyboard.CONTROL).onDown.add(() => {
            this.slowMotion();
        }, this);

        // world 높이를 500px 증가 시키기
        this.input.keyboard.addKey(Phaser.Keyboard.A).onDown.add(() => {
            this.setWorldBounds(this.world.width, this.world.height + 500);
        }, this);

        // world 높이를 500px 감소 시키기
        this.input.keyboard.addKey(Phaser.Keyboard.Z).onDown.add(() => {
            this.setWorldBounds(this.world.width, this.world.height - 500);
        }, this);
    }


    setDebug(isDebugMode)
    {
        if (isDebugMode) {

            const y = CAMERA_VIEW_HEIGHT - 20;

            // 위크 디버그 포인트 생성
            this.weakPoint = Utils.getCircle(this.game, 10, y, 10, 0xFFEB3B, 2, 0xFFFFFF);
            this.weakPoint.x = this.world.centerX;
            this.weakPoint.y = this.viewBottomY + 100;

            // 무게 중심 디버그 포인트 생성
            this.centerPoint = Utils.getCircle(this.game, 20, y, 10, 0xFF3300, 2, 0xFFFFFF);
            this.centerPoint.x = this.world.centerY;
            this.centerPoint.y = this.viewBottomY + 100;

            // 제한선 디버그 라인
            this.limitLine = Utils.getLine(this.game, 10, CAMERA_VIEW_HEIGHT - 10, CAMERA_VIEW_WIDTH, 0x8e44ad);
        }

        if (this.weakPoint) {
            this.weakPoint.visible = isDebugMode;
            this.centerPoint.visible = isDebugMode;
            this.limitLine.visible = isDebugMode;
        }
    }


    update()
    {
        this.swing(this.currentBrick);

        if (DEBUG_MODE) {
            if (this.cursors.up.isDown) {
                this.camera.y -= 10;
            }
            else if (this.cursors.down.isDown) {
                this.camera.y += 10;
            }

            if (this.cursors.left.isDown) {
                this.camera.x -= 10;
            }
            else if (this.cursors.right.isDown) {
                this.camera.x += 10;
            }
        }

        // 게임 오버 함수에서 30초 타임 아웃이 설정되어 있어 여기서 트리거 안되더라도 게임오버로 넘어갑니다.
        if (this.isGameOver) {

            if (this.prevBrickX) {
                const diffX = Math.abs(this.currentBrick.x - this.prevBrickX)
                    , diffY = Math.abs(this.currentBrick.y - this.prevBrickY);

                if (diffX < 1 && diffY < 1) {

                    if (this.isGameOverTriggered === false) {
                        setTimeout(() => {
                            // start(key, clearWorld, clearCache, parameter);
                            this.state.start('GameOver', true, false, this.totalScore);
                        }, 3000);
                    }

                    this.isGameOverTriggered = true;
                }
            }

            this.prevBrickX = this.currentBrick.x;
            this.prevBrickY = this.currentBrick.y;
        }
    }


    render()
    {
        /*if (Phaser.Device.desktop && DEBUG_MODE) {

            this.game.debug.cameraInfo(this.camera, 420, 32);

            const currentBrick = this.currentBrick;
                , lastBrick = this.bricks[this.bricks.length - 2];

            if (currentBrick) {
                this.game.debug.spriteCoords(currentBrick, 32, 32);
            }

            if (lastBrick) {
                this.game.debug.spriteCoords(lastBrick, 32, 80);
            }
        }*/
    }


    shutdown()
    {
        if (this.ruler) {
            this.world.removeChild(this.ruler);
            this.ruler.destroy();
            this.ruler = null;
        }

        if (this.gameOverTimeOutId) {
            clearTimeout(this.gameOverTimeOutId);
        }
    }


    updateLevel()
    {
        const level = this.level
            , halfLevel = Math.floor(LEVEL_GRADE / 2);

        this.isRandomBrickWidth = (level > halfLevel) ? true : false;
        this.swingXSpeed = this.defaultXSpeed + this.levelXSpeed * level;
        this.swingYSpeed = this.defaultYSpeed + this.levelYSpeed * level;
        this.swingXRadius = this.defaultXRadius + this.levelXRadius * level;
        this.swingYRadius = this.defaultYRadius + this.levelYRadius * level;
        this.remainXSpeed = this.maxXSpeed - this.swingXSpeed;
        this.remainYSpeed = this.maxYSpeed - this.swingYSpeed;
        this.remainXRadius = this.maxXRadius - this.swingXRadius;
        this.remainYRadius = this.maxYRadius - this.swingYRadius;
    }


    updateCamera()
    {
        if (this.numBricks === 1) {
            return;
        }

        const firstBrick = this.firstBrick
            , nextBrickY = firstBrick.y + firstBrick.height
            , diffY = nextBrickY - this.viewCenterY - CAMERA_BRICK_SPACE;

        if (diffY < 0) {
            this.cameraY = this.cameraY + diffY;
        }
    }


    swing(brick)
    {
        if (brick && brick.isLanding === false) {
            brick.x = this.brickCenterX + Math.sin(this.swingXAngle) * (this.swingXRadius + this.timeFactor * this.remainXRadius);
            brick.y = this.brickCenterY + Math.cos(this.swingYAngle) * (this.swingYRadius + this.timeFactor * this.remainYRadius);
            this.swingXAngle += (this.swingXSpeed + this.timeFactor * this.remainXSpeed);
            this.swingYAngle += (this.swingYSpeed + this.timeFactor * this.remainYSpeed);
        }
    }


    slowMotion()
    {
        if (this.isSlowMotion) {
            return;
        }

        const speedX = this.swingXSpeed
            , speedY = this.swingYSpeed
            , slowX = speedX / 10
            , slowY = speedY / 10
            , fastX = speedX * 2.5
            , fastY = speedY * 2.5;

        this.slowTween = this.game.add.tween(this).to({swingXSpeed:slowX, swingYSpeed:slowY}, 2000, Phaser.Easing.Exponential.Out, true);
        this.slowTween.onComplete.add(() => {

            this.slowTween = this.game.add.tween(this).to({swingXSpeed:fastX, swingYSpeed:fastY}, 200, Phaser.Easing.Exponential.Out, true);
            this.slowTween.onComplete.add(() => {

                this.slowTween = this.game.add.tween(this).to({swingXSpeed:speedX, swingYSpeed:speedY}, 200, Phaser.Easing.Exponential.Out, true);
                this.slowTween.onComplete.add(() => {
                    //this.soundHeartbeat.stop();
                    this.isSlowMotion = false;
                });
            });

        }, this);

        //this.soundHeartbeat.play();
        this.isSlowMotion = true;
    }


    resetSlowMotion()
    {
        if (this.slowTween) {
            this.slowTween.stop();
            this.soundHeartbeat.stop();
            this.isSlowMotion = false;
        }
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
        const floor = this.addFloor();
        this.limitY = floor.y;
    }


    addFloor()
    {
        const w = WORLD_BOUNDS_WIDTH
            , h = WORLD_BOUNDS_HEIGHT
            , y = h - FLOOR_HEIGHT
            , graphics = this.game.add.graphics(0, 0);

        graphics.beginFill(0x95a5a6);
        graphics.lineStyle(1, 0x95a5a6);
        graphics.drawRect(0, 0, w, FLOOR_HEIGHT);
        graphics.endFill();

        const sprite = this.game.add.sprite(0, y, graphics.generateTexture());
        graphics.destroy();
        return sprite;
    }


    createBrick()
    {
        this.resetSlowMotion();

        this.canIBuild = true;

        this.addBrick();

        this.startTimeFactor();
        this.updateLevel();
        this.updateCamera();

        return this.currentBrick;
    }


    startTimeFactor()
    {
        if (this.timeFactorTween) {
            this.timeFactorTween.stop();
        }

        this.timeFactor = 0;
        this.timeFactorTween = this.game.add.tween(this).to({timeFactor:1}, 120000, Phaser.Easing.Linear.None, true);
    }


    createRuler()
    {
        this.ruler = new Ruler(this.game);
        this.ruler.x = CAMERA_VIEW_WIDTH;
        this.world.addChild(this.ruler);

        //this.ruler = new LevelRuler(this.game, LEVEL_LABEL, LEVEL_COLOR);
    }


    addBrick()
    {
        if (this.isGameOver === true) {
            return;
        }

        const brick = this.getRandomBrick();
        brick.anchor.setTo(0.5);
        brick.index = this.bricks.length;
        brick.isLanding = false;
        brick.direction = (Math.random() < 0.5) ? -1 : 1;
        brick.speed = 4;
        brick.autoCull = true;
        brick.checkWorldBounds = true;
        this.bricks.push(brick);
        return brick;
    }


    getRandomBrick()
    {
        const randomTexture = this.getRandomTexture()
            , sprite = this.game.add.sprite(-100, -100, randomTexture.generateTexture());
        //randomTexture.destroy();
        sprite.randomTexture = randomTexture;
        sprite.x = this.brickCenterX;
        sprite.y = this.dropBrickY;
        return sprite;
    }


    getRandomTexture()
    {
        const w = (this.isRandomBrickWidth === false) ? BRICK_WIDTH : (160 + Math.random() * 40)
            , g = new Phaser.Graphics(this.game)
            , randomColorIndex = parseInt(Math.random() * this.brickColors.length);

        g.beginFill(this.brickColors[randomColorIndex], 1);
        g.drawRect(0, 0, w, BRICK_HEIGHT);
        g.endFill();
        return g;
    }


    click()
    {
        const currentBrick = this.currentBrick;

        if (currentBrick) {

            if (Phaser.Device.desktop && DEBUG_MODE) {
                this.setBrickXToMouseX(currentBrick);
            }

            this.drop(currentBrick);
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
        if (!brick || this.canIBuild === false) {
            return;
        }

        this.canIBuild = false;
        brick.isLanding = true;

        const limitY = this.limitY - BRICK_HEIGHT
            , lastBrick = this.bricks[this.bricks.length - 2]
            , isOverlap = this.checkOverlap(brick, lastBrick);

        if (isOverlap === true) {
            const tween = this.game.add.tween(brick).to({y: this.viewBottomY}, 1000, Phaser.Easing.Bounce.Out, true);

            tween.onUpdateCallback(() => {
                // 제한선을 넘으면 충돌감지 및 밸런스 체크
                if (this.checkCrossedLimit(brick) === true) {

                    tween.stop();

                    const result = this.checkBlance();

                    if (result.isBlance === true) {
                        this.limitY = brick.y = limitY;
                        this.hitAction(brick);
                        const score = this.getScore();
                        this.showScore(score);
                        this.totalScore += score;
                        this.createBrick();
                    }
                    else {

                        this.isGameOver = true;
                        const tweenTime = this.gameOverSlowMotoin(brick, limitY);

                        // setTimeout(() => {this.setPhysics();}, tweenTime)





                        //setTimeout(() => {this.gameOver(result);}, tweenTime)
                    }
                }
            });
        }
        else {
            const tween = this.game.add.tween(brick).to({y: this.viewBottomY}, 800, Phaser.Easing.Quartic.In, true);

            tween.onComplete.add(() => {
                this.gameOver({brick: brick, isBlance: true, reason: 'No Hit'});
            });
        }
    }


    showScore(score)
    {
        const firstBrick = (this.numBricks === 1) ? this.currentBrick : this.firstBrick
            , scoreText = this.game.add.text(firstBrick.x, firstBrick.y - firstBrick.height, score, { font: "65px Arial", fill: "#FFFFFF", align: "center" })
            , sign = (Math.random() < 0.5) ? -1 : 1
            , toX = firstBrick.x + (sign * (Math.random() * firstBrick.width))
            , toY = this.viewBottomY - 300 - (Math.random() * (this.camera.view.height - 300));

        scoreText.vy = 0;
        scoreText.velocityY = Config.GRAVITY;
        scoreText.toY = firstBrick.y - SCORE_JUMP_HEIGHT;
        scoreText.anchor.setTo(0.5, 0.5);

        const scoreTween = this.scoreTween = this.game.add.tween(scoreText).to({x: toX, alpha: 0}, 1000, Phaser.Easing.Exponential.Out, true);

        scoreTween.onUpdateCallback(() => {
            scoreText.vy += scoreText.velocityY;
            scoreText.y += 0.3 * (scoreText.toY - scoreText.y) + scoreText.vy;
            scoreText.scale.x += 0.3 * (1.5 - scoreText.scale.x);
            scoreText.scale.y += 0.3 * (1.5 - scoreText.scale.y);
        }, this);

        scoreTween.onComplete.add(() => {
            scoreText.destroy();
        }, this);
    }


    gameOverSlowMotoin(brick, limitY)
    {
        if (this.gameOverTween) {
            this.gameOverTween.stop();
        }

        const tweenTime = 5000;


        this.enablePhysics();

        /*brick.y = limitY - brick.height;
        this.camera.shake(0.00001, tweenTime);
        this.gameOverTween = this.game.add.tween(brick).to({y:limitY}, tweenTime, Phaser.Easing.Back.Out, true);*/
        //this.soundDripping.play();

        brick.y = limitY;
        return tweenTime;
    }


    checkCrossedLimit(brick)
    {
        return (brick.y + brick.height > this.limitY);
    }


    checkOverlap(brick, lastBrick)
    {
        if (brick && lastBrick) {

            const brickHalfWidth = brick.width / 2
                , left = brick.x - brickHalfWidth
                , right = brick.x + brickHalfWidth
                , lastBrickHalfWidth = lastBrick.width / 2
                , limitLeft = lastBrick.x - lastBrickHalfWidth
                , limitRight = lastBrick.x + lastBrickHalfWidth;

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
        clone.x = brick.x;
        clone.y = brick.y + brick.height / 2;

        const height = clone.y - this.cameraY
            , motionTime = 120 + Math.random() * 120;

        this.guideLightTween = this.game.add.tween(clone).to( {height: height, alpha:0.05}, motionTime, Phaser.Easing.Elastic.Out, true);
        this.guideLight = clone;

        //this.soundHit.play();
        //this.hitSounds[parseInt(Math.random() * this.hitSounds.length)].play();
    }


    /**
     *
     * @returns {*}
     */
    checkBlance()
    {
        const numBricks = this.numBricks;

        if (numBricks === 1 || this.isGameOver) {
            this.camera.shake(0.002, Math.random() * 250);
            return {isBlance: true};
        }

        let offsetX,
            topWidth, topBrick, topCenterX,
            bottomBrick, bottomCenterX,
            direction, prevDirection = 'none';

        // 여기서 마지막 블럭으로 좌, 우를 계산하도록 하자.
        for (let i = 1 ; i < numBricks; i++) {
            topBrick = this.bricks[i];
            bottomBrick = this.bricks[i - 1];

            if (topBrick) {
                topWidth = topBrick.width;

                topCenterX = topBrick.x + topBrick.width / 2;
                bottomCenterX = bottomBrick.x + bottomBrick.width / 2;

                if (topCenterX === bottomCenterX) {
                    direction = 'none';
                }
                else if (topCenterX < bottomCenterX) {
                    direction = 'left';
                    offsetX = bottomBrick.x - topBrick.x;
                }
                else {
                    direction = 'right';
                    offsetX = (topBrick.x + topBrick.width) - (bottomBrick.x + bottomBrick.width);
                }
            }


            if (direction === 'left') {
                const weakPoint = this.getLeftWeakPoint();
                if (this.getCenterOfMass().x < weakPoint.x) {

                    return {
                        brick: topBrick,
                        isBlance: false,
                        direction: direction,
                        weakPoint: weakPoint,
                        floorIndex: 0,
                        reason: 'Bricks Collapse'
                    };
                }
            }
            else {
                const weakPoint = this.getRightWeakPoint();
                if (this.getCenterOfMass().x > weakPoint.x) {


                    return {
                        brick: topBrick,
                        isBlance: false,
                        direction: direction,
                        weakPoint: weakPoint,
                        floorIndex: 0,
                        reason: 'Bricks Collapse'
                    };
                }
            }

            prevDirection = direction;
        }

        this.camera.shake(0.002, Math.random() * 250);
        return {isBlance: true};
    }





    getScore()
    {
        if (this.numBricks === 1) {
            return 1;
        }

        const topBrick = this.currentBrick
            , bottomBrick = this.firstBrick
            , diffX = Math.abs(bottomBrick.x - topBrick.x);

        if (diffX >= 0 && diffX <= SCORE_PERPECT_WIDTH) {
            return SCORE_PREPECT;
        }
        else if (diffX > SCORE_PERPECT_WIDTH && diffX <= SCORE_EXCELLENT_WIDTH) {
            return SCORE_EXCELLENT;
        }
        else if (diffX > SCORE_EXCELLENT_WIDTH && diffX <= SCORE_GOOD_WIDTH) {
            return SCORE_GOOD;
        }
        else {
            return SOCRE_NORMAL;
        }
    }


    /**
     * 블럭 방향이 바뀌면 바닥 위치를 변경합니다.
     * @returns {number}
     */
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
        const clone = this.bricks.slice(0)
            , sortedBricks = clone.sort(function(a, b) {return b.x - a.x;})
            , brick = sortedBricks[0]
            , info = {
                x: brick.x - brick.width / 2,
                brick: brick,
                index: brick.index
            };

        // DEBUG 코드
        if (DEBUG_MODE) {
            this.weakPoint.x = info.x;
            this.weakPoint.y = info.brick.y;
            this.world.bringToTop(this.weakPoint);
        }

        return info;
    }


    getRightWeakPoint()
    {
        const clone = this.bricks.slice(0)
            , sortedBricks = clone.sort(function(a, b) {return (a.x + a.width) - (b.x + b.width);})
            , brick = sortedBricks[0]
            , info = {
                brick: brick,
                index: brick.index,
                x: brick.x + brick.width / 2
            };

        // DEBUG 코드
        if (DEBUG_MODE) {
            this.weakPoint.x = info.x;
            this.weakPoint.y = info.brick.y;
            this.world.bringToTop(this.weakPoint);
        }

        return info;
    }


    /**
     * 맨 밑의 블럭을 제외하고 중심점 평균을 구합니다.
     * @param bottomIndex
     * @returns {Phaser.Point}
     */
    getCenterOfMass()
    {
        const numBricks = this.numBricks;
        let brick, sumx = 0, sumy = 0;

        for (let i = 1; i < numBricks; i++) {
            brick = this.bricks[i];
            sumx += brick.x;
            sumy += brick.y;
        }

        const count = numBricks - 1
            , centerOfMassX = sumx / count
            , centerOfMassY = sumy / count;

        // DEBUG 코드
        if (DEBUG_MODE) {
            this.centerPoint.x = centerOfMassX;
            this.centerPoint.y = centerOfMassY;
            this.world.bringToTop(this.centerPoint);
        }

        return new Phaser.Point(centerOfMassX, centerOfMassY);
    }



    getOverhang()
    {
        let l = 0;
        const numBricks = this.numBricks;

        for (let i = 1; i < numBricks; i++) {
            l += this.bricks[i].width;
        }

        return l / 2 * (numBricks - 1 + 1);
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

        if (this.weakPoint) {
            this.weakPoint.vy = 0;
            this.weakPoint.velocityY = 0.1 + Math.random() * 0.4;
            this.centerPoint.vy = 0;
            this.centerPoint.velocityY = 0.1 + Math.random() * 0.4;
        }

        if (this.limitLine) {
            this.limitLine.vy = 0;
            this.limitLine.velocityY = 0.1 + Math.random() * 0.4;
        }

        console.log('------------------------------------------------------');
        console.log('GAME OVER', result.reason ? '( ' + result.reason + ' )' : '');
        console.log('------------------------------------------------------');

        this.ruler.boom();

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
        this.camera.shake(0.16, 800);
        this.camera.follow(this.currentBrick);
        this.currentBrick.body.velocity.y = 5000;

        if (result.isBlance === false) {

            const weakPoint = result.weakPoint;

            if (weakPoint) {
                const weakIndex = weakPoint.index
                    , weakBrick = this.bricks[weakIndex + 1];

                if (weakBrick) {
                    weakBrick.body.mass = 100;
                    weakBrick.body.angle = 360;
                    weakBrick.body.angularForce = 360;
                }
            }
        }

        // 맨 위 블럭도 꽈광!
        if (this.firstBrick) {
            this.firstBrick.body.velocity.x = (Math.random() < 0.5) ? -Math.random() * 100 : Math.random() * 100;
            this.firstBrick.body.velocity.y = 5000;
        }

        //this.soundBowling.play();

        // 30초 안에 종료되지 않으면 GameOver 씬으로 자동으로 넘어갑니다.
        this.gameOverTimeOutId = setTimeout(() => {
            this.state.start('GameOver', true, false, this.totalScore);
        }, 30000);
    }


    /**
     * 디버그 함수
     * 모든 블럭에 물리 적용
     */
    enablePhysics()
    {
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.gravity.y = 100;

        const numBricks = this.numBricks;

        for (let i = 0; i < numBricks; i++) {
            const brick = this.bricks[i];
            this.game.physics.p2.enable(brick);
            brick.body.mass = 300;
        }
    }


    disablePhysics()
    {
        const numBricks = this.numBricks;

        for (let i = 0; i < numBricks; i++) {
            const brick = this.bricks[i];
            this.game.physics.p2.removeBody(brick.body);
        }
    }


    setWorldBounds(width, height)
    {
        const diffWidth = this.world.width - width;
        const diffHeight = this.world.height - height;
        this.world.setBounds(0, 0, width, height);
        this.changeWorldBounds(diffWidth, diffHeight);
    }


    changeWorldBounds(diffWorldWidth, diffWorldHeight)
    {
        let brick;
        const total = this.bricks.length;

        for(var i = 0; i < total; i++) {
            brick = this.bricks[i];
            brick.y -= diffWorldHeight;
        }

        this.camera.y -= diffWorldHeight;

        this.ruler.reset();

        this.limitY -= diffWorldHeight;


        if (this.guideLight) {
            this.guideLight.y -= diffWorldHeight;
        }

        if (this.weakPoint) {
            this.weakPoint.y -= diffWorldHeight;
        }

        if (this.centerPoint) {
            this.centerPoint.y -= diffWorldHeight;
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
        }
    }


    /**
     * 현재 제한선 위치
     * @returns {*}
     */
    get limitY()
    {
        return this._limitY;
    }


    /**
     * 블럭이 올라간 높이
     * @returns {number}
     */
    get climbY()
    {
        return this.world.height - this.limitY;
    }


    /**
     * 높이에 따른 레벨값
     * @returns {Number}
     */
    get level()
    {
        const level = parseInt(this.climbY / this.levelHeight);
        return (level > LEVEL_GRADE) ? LEVEL_GRADE : level;
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
    }


    get cameraY()
    {
        return this.camera.y;
    }


    get bottomBrick()
    {
        return this.bricks[0];
    }


    get currentBrick()
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
     * 현재 보이는 화면 맨 하단
     * @returns {number}
     */
    get viewBottomY()
    {
        return this.camera.view.y + this.camera.view.height;
    }


    /**
     * 총 블럭의 개
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
        return this.dropBrickY;
    }


    /**
     * 드랍 벽돌 시작 위치
     * @returns {number}
     */
    get dropBrickY()
    {
        return this.topY + BRICK_TOP_MARGIN_Y;
    }


    set totalScore(value)
    {
        this._totalScore = value;
    }


    get totalScore()
    {
        return this._totalScore;
    }
}
