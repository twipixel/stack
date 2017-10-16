

const singleton = Symbol();
const singletonEnforcer = Symbol();


export default class Sound
{
    constructor(enforcer)
    {
        if (enforcer !== singletonEnforcer) {
            throw new Error('The Sound class is a singleton. Use Sound.instance to access.');
        }
    }


    static get instance()
    {
        if (!this[singleton]) {
            this[singleton] = new Sound(singletonEnforcer);
        }
        return this[singleton];
    }


    initialize(game)
    {
        this.game = game;

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
    }


    /**
     * 블럭이 쌓일 때 나는 소리
     */
    randomStackSoundPlay()
    {
        this.hitSounds[parseInt(Math.random() * this.hitSounds.length)].play();
    }


    /**
     * 컨트롤 키 눌렀을 때 블럭이 느려질 때 나는 소리 (심장 소리)
     */
    slowMotionSoundPlay()
    {
        this.soundHeartbeat.play();
    }


    slowMotionSoundStop()
    {
        this.soundHeartbeat.stop();
    }


    /**
     * 게임 종료 시 물방울 소리
     */
    gameOverSoundPlay()
    {
        this.soundDripping.play();
    }


    /**
     * 게임 오버 시 블럭 빠르게 떨어져서 부딪히는 소리
     */
    boomSoundPlay()
    {
        this.soundBowling.play();
    }
}