import Config from '../config/Config';

const PREFIX_SOUND_URL = Config.PREFIX_SOUND_URL;
const PREFIX_SPRITESHEET_URL = Config.PREFIX_SPRITESHEET_URL;

export default class Preload extends Phaser.State
{
    preload()
    {
        this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg');
        this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar');
        this.loaderBg.anchor.setTo(0.5);
        this.loaderBar.anchor.setTo(0.5);

        this.load.setPreloadSprite(this.loaderBar);

        this.load.atlasJSONArray('bricks', PREFIX_SPRITESHEET_URL + 'bricks.png', PREFIX_SPRITESHEET_URL + 'bricks.json');

        this.load.audio('menuOver', [PREFIX_SOUND_URL + 'menu-over.mp3']);
        this.load.audio('menuOut', [PREFIX_SOUND_URL + 'menu-out.mp3']);
        this.load.audio('menuDown', [PREFIX_SOUND_URL + 'menu-click.mp3']);

        this.load.audio('baseball-bat', [PREFIX_SOUND_URL + 'baseball-bat.mp3']);
        this.load.audio('xylophone-a', [PREFIX_SOUND_URL + 'xylophone-a.wav']);
        this.load.audio('xylophone-b', [PREFIX_SOUND_URL + 'xylophone-b.wav']);
        this.load.audio('xylophone-c', [PREFIX_SOUND_URL + 'xylophone-c.wav']);
        this.load.audio('xylophone-c2', [PREFIX_SOUND_URL + 'xylophone-c2.wav']);
        this.load.audio('xylophone-d1', [PREFIX_SOUND_URL + 'xylophone-d1.wav']);
        this.load.audio('xylophone-e1', [PREFIX_SOUND_URL + 'xylophone-e1.wav']);
        this.load.audio('xylophone-f', [PREFIX_SOUND_URL + 'xylophone-f.wav']);
        this.load.audio('xylophone-g', [PREFIX_SOUND_URL + 'xylophone-g.wav']);
        this.load.audio('heartbeat', [PREFIX_SOUND_URL + 'heartbeat-all.mp3']);
        this.load.audio('bowling', [PREFIX_SOUND_URL + 'bowling.mp3']);
        this.load.audio('boom', [PREFIX_SOUND_URL + 'boom.wav']);
        this.load.audio('dripping', [PREFIX_SOUND_URL + 'dripping.mp3']);
    }

    create()
    {
        this.state.start('Title');
    }
}
