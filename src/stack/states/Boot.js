import config from '../config/config';

const PREFIX_ASSET_URL = config.PREFIX_ASSET_URL;

export default class Boot extends Phaser.State
{
    preload()
    {
        //this.game.stage.backgroundColor = '#8BC34A';
        this.game.stage.backgroundColor = '#1f1f1f';

        this.load.image('loaderBg', PREFIX_ASSET_URL + '/image/loader-bg.png');
        this.load.image('loaderBar', PREFIX_ASSET_URL + '/image/loader-bar.png');
    }

    create()
    {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.setShowAll();
        this.game.scale.refresh();

        this.state.start('Preload');
    }
}
