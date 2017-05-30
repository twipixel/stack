import config from './../config/config';

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
    }

    create()
    {
        this.state.start('Title');
    }
}
