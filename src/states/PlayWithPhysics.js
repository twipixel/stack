import config from './../config/config';

const BRICK_COLOR = ['blue', 'red', 'yellow'];

export default class PlayWithPhysics extends Phaser.State
{
    init()
    {
        this.limitY = config.GAME_BOUNDS_HEIGHT;
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.gravity.y = 400;
    }

    preload()
    {
        //
    }

    create()
    {
        this.game.world.setBounds(0, 0, config.GAME_BOUNDS_WIDTH, config.GAME_BOUNDS_HEIGHT);
        let worldMaterial = this.worldMaterial = this.game.physics.p2.createMaterial('worldMaterial');
        this.game.physics.p2.setWorldMaterial(worldMaterial, false, false, false, true);


        //let g = new Phaser.Graphics(this.game);
        //let sprite = this.game.add.sprite(brickX, 100, 'bricks', this.getRandomBrickColor());
        //this.game.physics.p2.enable(sprite);

        this.start();
        this.addInputEvent();
    }

    update()
    {
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

        //console.log(this.game.camera.y);
    }

    start()
    {
        this.getNextBrick();
    }

    getNextBrick()
    {
        if (this.brick && this.brick.body) {
            //this.brick.body.static = true;
        }

        let brick = this.brick = this.getBrick();
        this.game.camera.follow(brick, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
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
            contactMaterial.stiffness = 1e7;
            contactMaterial.relaxation = 3;
            contactMaterial.frictionStiffness = 1e7;
            contactMaterial.frictionRelaxation = 1;
            contactMaterial.surfaceVelocity = 0;
        }

        sprite.body.mass = 100;
        //sprite.body.allowSleep = true;
        //sprite.body.sleepSpeedLimit = 1;

        sprite.halfWidth = sprite.width / 2;
        sprite.halfHeight = sprite.height / 2;

        this.limitY = this.limitY + sprite.height;
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

    get cameraY()
    {
        return this.limitY - 400;
    }
}
