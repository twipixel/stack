import config from './../config/config';

const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;
const BRICK_COLOR = ['blue', 'red', 'yellow'];

export default class Play extends Phaser.State
{
    init()
    {
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.gravity.y = 400;
    }

    preload()
    {
        //
    }

    create()
    {
        //this.bricks = this.game.add.physicsGroup(Phaser.Physics.P2JS);

        let worldMaterial = this.worldMaterial = this.game.physics.p2.createMaterial('worldMaterial');
        this.game.physics.p2.setWorldMaterial(worldMaterial, false, false, false, true);

        this.addInputEvent();
        this.start();
    }

    update()
    {
        if (this.brick) {
            let b = this.brick;
            //b.body.velocity.x += b.direction * b.speed;
            //b.body.velocity.y = this.brickY + Math.sin(this.brickWaveAngle) * this.brickWave;
            //if (b.x < 0 || b.x > this.game.world.width) {
            //    b.direction *= -1;
            //}

        }
    }

    start()
    {
        this.brick = this.getNextBrick();
    }

    getNextBrick()
    {
        if (this.brick && this.brick.body) {
            this.brick.body.static = true;
            this.brick.body.sleep();
        }

        let brick = this.getBrick();
        return brick;
    }

    getBrick()
    {
        const W = 209,
            HW = W / 2,
            H = 46,
            SPACE = 2;

        //let brickX = this.game.world.randomX;
        let brickX = this.game.input.x;
        const START_X = HW + SPACE;
        const LIMIT_X = this.game.world.width - HW - SPACE;
        brickX = (brickX < START_X ) ? START_X : brickX;
        brickX = (brickX > LIMIT_X) ? LIMIT_X : brickX;

        //let sprite = this.bricks.create(randomX, 100, 'bricks', randomFrame, true);
        let sprite = this.game.add.sprite(brickX, 100, 'bricks', this.getRandomBrickColor());
        this.game.physics.p2.enable(sprite);

        if (this.currentMaterial) {
            this.prevMaterial = this.currentMaterial;
        }

        this.currentMaterial = this.game.physics.p2.createMaterial('spriteMaterial', sprite.body);

        if (this.prevMaterial) {
            let contactMaterial = this.game.physics.p2.createContactMaterial(this.prevMaterial, this.currentMaterial);
            contactMaterial.friction = 10;
            contactMaterial.restitution = 0;
            //contactMaterial.stiffness = 1e7;
            //contactMaterial.relaxation = 3;
            //contactMaterial.frictionStiffness = 1e7;
            //contactMaterial.frictionRelaxation = 1;
            //contactMaterial.surfaceVelocity = 0;
        }

        sprite.body.mass = 1;
        sprite.body.allowSleep = true;
        sprite.body.sleepSpeedLimit = 1;

        sprite.halfWidth = sprite.width / 2;
        sprite.halfHeight = sprite.height / 2;
        return sprite;
    }

    getRandomBrickColor()
    {
        const randomIndex = parseInt(Math.random() * BRICK_COLOR.length);
        return BRICK_COLOR[randomIndex];
    }

    addInputEvent()
    {
        this.game.input.onDown.add(this.getNextBrick, this);
        this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(this.getNextBrick, this);
    }




}
