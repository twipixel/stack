import config from '../config/config';

const PREFIX_ASSET_URL = config.PREFIX_ASSET_URL;

export default class Preload extends Phaser.State
{
    preload()
    {
        this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg');
        this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar');
        this.loaderBg.anchor.setTo(0.5);
        this.loaderBar.anchor.setTo(0.5);

        this.load.setPreloadSprite(this.loaderBar);

        this.load.atlasJSONArray('bricks', PREFIX_ASSET_URL + '/spritesheet/bricks.png', PREFIX_ASSET_URL + '/spritesheet/bricks.json');

        this.load.audio('menuOver', [PREFIX_ASSET_URL + '/sound/menu-over.mp3']);
        this.load.audio('menuOut', [PREFIX_ASSET_URL + '/sound/menu-out.mp3']);
        this.load.audio('menuDown', [PREFIX_ASSET_URL + '/sound/menu-click.mp3']);

        this.load.audio('baseball-bat', [PREFIX_ASSET_URL + '/sound/baseball-bat.mp3']);
        this.load.audio('xylophone-a', [PREFIX_ASSET_URL + '/sound/xylophone-a.wav']);
        this.load.audio('xylophone-b', [PREFIX_ASSET_URL + '/sound/xylophone-b.wav']);
        this.load.audio('xylophone-c', [PREFIX_ASSET_URL + '/sound/xylophone-c.wav']);
        this.load.audio('xylophone-c2', [PREFIX_ASSET_URL + '/sound/xylophone-c2.wav']);
        this.load.audio('xylophone-d1', [PREFIX_ASSET_URL + '/sound/xylophone-d1.wav']);
        this.load.audio('xylophone-e1', [PREFIX_ASSET_URL + '/sound/xylophone-e1.wav']);
        this.load.audio('xylophone-f', [PREFIX_ASSET_URL + '/sound/xylophone-f.wav']);
        this.load.audio('xylophone-g', [PREFIX_ASSET_URL + '/sound/xylophone-g.wav']);
        this.load.audio('heartbeat', [PREFIX_ASSET_URL + '/sound/heartbeat-all.mp3']);
        this.load.audio('bowling', [PREFIX_ASSET_URL + '/sound/bowling.mp3']);
        this.load.audio('boom', [PREFIX_ASSET_URL + '/sound/boom.wav']);
        this.load.audio('dripping', [PREFIX_ASSET_URL + '/sound/dripping.mp3']);
    }

    create()
    {
        this.state.start('Title');
    }
}
