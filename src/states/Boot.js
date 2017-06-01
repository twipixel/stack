import config from './../config/config';

const PREFIX_ASSET_URL = config.PREFIX_ASSET_URL;

export default class Boot extends Phaser.State
{
    preload()
    {
        this.game.stage.backgroundColor = '#8BC34A';

        this.load.image('loaderBg', PREFIX_ASSET_URL + '/image/loader-bg.png');
        this.load.image('loaderBar', PREFIX_ASSET_URL + '/image/loader-bar.png');
    }

    create()
    {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        this.scale.pageAlignVertically = true;
        this.scale.pageAlignHorizontally = true;

        this.state.start('Preload');
    }
}
