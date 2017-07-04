import Utils from '../utils/Utils';
import Config from '../config/Config';
import Ruler from '../controls/Ruler';
import LevelRuler from '../controls/LevelRuler';

const BRICK_WIDTH = 200;
const BRICK_HEIGHT = 40;
const FLOOR_HEIGHT = 100;
const SCORE_JUMP_HEIGHT = 200;
const BRICK_TOP_MARGIN_Y = 300;
const CAMERA_BRICK_SPACE = 250;
const SCORE_PERPECT_WIDTH = 1;
const SCORE_GOOD_WIDTH = 20;
const SCORE_EXCELLENT_WIDTH = SCORE_GOOD_WIDTH / 2;
const SCORE_PREPECT = 10;
const SCORE_EXCELLENT = 5;
const SCORE_GOOD = 2;
const SOCRE_NORMAL = 1;
const LEVEL_LABEL = ['READY', 'EASY', 'NORMAL', 'HARD', 'CRAZY'];
//const LEVEL_LABEL = ['LEVEL1', 'LEVEL2', 'LEVEL3', 'LEVEL4', 'LEVEL5'];
const LEVEL_COLOR = ['#9E9E9E', '#03A9F4', '#4CAF50', '#FF5722', '#E91E63'];
const LEVEL_GRADE = LEVEL_LABEL.length;
const CAMERA_VIEW_WIDTH = Config.CAMERA_VIEW_WIDTH;
const CAMERA_VIEW_HEIGHT = Config.CAMERA_VIEW_HEIGHT;
const WORLD_BOUNDS_WIDTH = Config.WORLD_BOUNDS_WIDTH;
const WORLD_BOUNDS_HEIGHT = Config.WORLD_BOUNDS_HEIGHT;
const DEBUG_MODE = (Config.DEBUG_MODE) ? Config.DEBUG_MODE : false;


export default class GameNoPhysics extends Phaser.State
{
    init()
    {
        console.log('[GAME NO PHYSICS], DEBUG MODE:', DEBUG_MODE);
        console.log('[Game]:', this.game);
        console.log('[Stage]:', this.stage);
        console.log('[World]:', this.world);
        console.log('[Camera]:', this.camera);
        console.log('[Input]:', this.input);
        console.log('[Debug]:', this.game.debug);

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

    preload()
    {
        // 카메라 설정을 여기서 해줘야 topY 가 정상 동작합니다.
        this.camera.y = this.startCameraY;
        this.levelHeight = (this.world.height - this.camera.height) / LEVEL_GRADE;
    }

    create()
    {
        this.start();
        this.addEvent();
        this.setDebug(DEBUG_MODE);
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
            this.weakPoint = Utils.getCircle(this.game, 10, y, 10, 0xFFEB3B, 0, 0xFFFFFF);
            this.weakPoint.x = this.world.centerX;
            this.weakPoint.y = this.viewBottomY + 100;
            this.weakPoint.tx = this.weakPoint.x;
            this.weakPoint.ty = this.weakPoint.y;

            // 무게 중심 디버그 포인트 생성
            this.centerPoint = Utils.getCircle(this.game, 20, y, 10, 0xFF3300, 0, 0xFFFFFF);
            this.centerPoint.x = this.world.centerY;
            this.centerPoint.y = this.viewBottomY + 100;
            this.centerPoint.tx = this.centerPoint.x;
            this.centerPoint.ty = this.centerPoint.y;

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

        // 게임 오버인데 특정 시간이 지나도 GameOver 로 안넘가는 케이스를 처리 필요 (1분 타임아웃 처리)
        if (this.isGameOver) {

            if (this.prevDropBrickX) {
                const diffX = Math.abs(this.dropBrick.x - this.prevDropBrickX);
                const diffY = Math.abs(this.dropBrick.y - this.prevDropBrickY);

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

            this.prevDropBrickX = this.dropBrick.x;
            this.prevDropBrickY = this.dropBrick.y;
        }
    }

    render()
    {
        if (Phaser.Device.desktop && DEBUG_MODE) {

            /*this.game.debug.cameraInfo(this.camera, 420, 32);

            const dropBrick = this.bricks[this.bricks.length - 1],
                lastBrick = this.bricks[this.bricks.length - 2];

            if (dropBrick) {
                this.game.debug.spriteCoords(dropBrick, 32, 32);
            }

            if (lastBrick) {
                this.game.debug.spriteCoords(lastBrick, 32, 80);
            }*/

            const weakPoint = this.weakPoint,
                centerPoint = this.centerPoint,
                limitLine = this.limitLine;

            if (this.isGameOver === false) {
                weakPoint.x += 0.1 * (weakPoint.tx - weakPoint.x);
                weakPoint.y += 0.1 * (weakPoint.ty - weakPoint.y);
                centerPoint.x += 0.1 * (centerPoint.tx - centerPoint.x);
                centerPoint.y += 0.1 * (centerPoint.ty - centerPoint.y);
            }
            else {
                weakPoint.vy += weakPoint.velocityY;
                weakPoint.y += weakPoint.vy;
                centerPoint.vy += centerPoint.velocityY;
                centerPoint.y += centerPoint.vy;
                limitLine.vy += limitLine.velocityY;
                limitLine.y += limitLine.vy;
            }
        }
    }

    shutdown()
    {
        if (this.ruler) {
            this.world.removeChild(this.ruler);
            this.ruler.destroy();
            this.ruler = null;
        }
    }

    updateLevel()
    {
        const level = this.level,
            halfLevel = Math.floor(LEVEL_GRADE / 2);

        //console.log('level', level, 'limitY', this.limitY);
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

        const firstBrick = this.firstBrick;
        const nextBrickY = firstBrick.y + firstBrick.height;
        const diffY = nextBrickY - this.viewCenterY - CAMERA_BRICK_SPACE;

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

        const speedX = this.swingXSpeed;
        const speedY = this.swingYSpeed;
        const slowX = speedX / 10;
        const slowY = speedY / 10;
        const fastX = speedX * 2.5;
        const fastY = speedY * 2.5;

        this.slowTween = this.game.add.tween(this).to({swingXSpeed:slowX, swingYSpeed:slowY}, 2000, Phaser.Easing.Exponential.Out, true);
        this.slowTween.onComplete.add(() => {

            this.slowTween = this.game.add.tween(this).to({swingXSpeed:fastX, swingYSpeed:fastY}, 200, Phaser.Easing.Exponential.Out, true);
            this.slowTween.onComplete.add(() => {

                this.slowTween = this.game.add.tween(this).to({swingXSpeed:speedX, swingYSpeed:speedY}, 200, Phaser.Easing.Exponential.Out, true);
                this.slowTween.onComplete.add(() => {
                    this.soundHeartbeat.stop();
                    this.isSlowMotion = false;
                });
            });

        }, this);

        this.soundHeartbeat.play();
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
        this.resetSlowMotion();

        this.canIBuild = true;
        this.brick = this.addBrick();

        this.startTimeFactor();
        this.updateLevel();
        this.updateCamera();

        /*this.world.forEach((child) => {
            console.log(child === this.brick);
        });*/

        return this.brick;
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
        /*this.ruler = new Ruler(this.game, WORLD_BOUNDS_HEIGHT);
        this.ruler.x = CAMERA_VIEW_WIDTH;
        this.world.addChild(this.ruler);*/

        this.ruler = new LevelRuler(this.game, LEVEL_LABEL, LEVEL_COLOR, this.world.height, this.camera.height);
        //this.ruler.x = CAMERA_VIEW_WIDTH;
        //this.world.addChild(this.ruler);
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
        const w = (this.isRandomBrickWidth === false) ? BRICK_WIDTH : (150 + Math.random() * 50);
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

            if (Phaser.Device.desktop && DEBUG_MODE) {
                this.setBrickXToMouseX(brick);
            }

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
        if (!brick || this.canIBuild === false) {
            return;
        }

        this.canIBuild = false;
        brick.isLanding = true;

        const limitY = this.limitY - BRICK_HEIGHT,
            lastBrick = this.bricks[this.bricks.length - 2],
            isOverlap = this.checkOverlap(brick, lastBrick);

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

                        const tweenTime = this.gameOverSlowMotoin(brick, limitY);

                        setTimeout(() => {
                            this.gameOver(result);
                        }, tweenTime)
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
        const firstBrick = (this.numBricks === 1) ? this.dropBrick : this.firstBrick;
        const scoreText = this.game.add.text(firstBrick.x, firstBrick.y - firstBrick.height, score, { font: "65px Arial", fill: "#FFFFFF", align: "center" });

        const sign = (Math.random() < 0.5) ? -1 : 1;
        const toX = firstBrick.x + (sign * (Math.random() * firstBrick.width));

        const toY = this.viewBottomY - 300 - (Math.random() * (this.camera.view.height - 300));

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

        const tweenTime = 1000;
        brick.y = limitY - brick.height;
        this.camera.shake(0.00001, tweenTime);
        this.gameOverTween = this.game.add.tween(brick).to({y:limitY}, tweenTime, Phaser.Easing.Back.Out, true);
        this.soundDripping.play();
        return tweenTime;
    }

    checkCrossedLimit(brick)
    {
        return (brick.y + brick.height > this.limitY);
    }

    checkOverlap(brick, lastBrick)
    {

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
        clone.x = brick.x;
        clone.y = brick.y + brick.height / 2;

        const height = clone.y - this.cameraY,
            motionTime = 120 + Math.random() * 120;
        this.guideLightTween = this.game.add.tween(clone).to( {height: height, alpha:0.05}, motionTime, Phaser.Easing.Elastic.Out, true);
        this.guideLight = clone;

        //this.soundHit.play();
        this.hitSounds[parseInt(Math.random() * this.hitSounds.length)].play();
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

                overhangRatio = (i === 0) ? 0 : ((offsetX / topWidth) * 100) / 100;
            }

            // 방향이 바뀌거나 정가운데 (Perfect)가 되면 overhang 을 리셋합니다.
            if (prevDirection === 'none' || prevDirection !== direction) {
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

    getScore()
    {
        if (this.numBricks === 1) {
            return 1;
        }

        const topBrick = this.dropBrick;
        const bottomBrick = this.firstBrick;
        const diffX = Math.abs(bottomBrick.x - topBrick.x);

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
            /*this.weakPoint.x = info.x;
            this.weakPoint.y = info.brick.y;*/
            this.weakPoint.tx = info.x;
            this.weakPoint.ty = info.brick.y;
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
            /*this.weakPoint.x = info.x;
            this.weakPoint.y = info.brick.y;*/
            this.weakPoint.tx = info.x;
            this.weakPoint.ty = info.brick.y;
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
            /*this.centerPoint.x = centerOfMassX;
            this.centerPoint.y = centerOfMassY;*/
            this.centerPoint.tx = centerOfMassX;
            this.centerPoint.ty = centerOfMassY;
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
        this.camera.follow(this.dropBrick);
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

        // 맨 위 블럭도 꽈광!
        if (this.firstBrick) {
            this.firstBrick.body.velocity.x = (Math.random() < 0.5) ? -Math.random() * 100 : Math.random() * 100;
            this.firstBrick.body.velocity.y = 5000;
        }

        this.soundBowling.play();

        // 30초 안에 종료되지 않으면 GameOver 씬으로 자동으로 넘어갑니다.
        setTimeout(() => {
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


    set totalScore(value)
    {
        this._totalScore = value;
        //console.log('[SCORE]', '[', value, ']');
    }

    get totalScore()
    {
        return this._totalScore;
    }
}
