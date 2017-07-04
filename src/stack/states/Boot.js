import Config from '../config/Config';

const PREFIX_IMAGE_URL = Config.PREFIX_IMAGE_URL;
const GAME_STAGE_BACKGROUND_COLOR = Config.GAME_STAGE_BACKGROUND_COLOR;

export default class Boot extends Phaser.State
{
    preload()
    {
        //this.game.stage.backgroundColor = '#8BC34A';
        this.game.stage.backgroundColor = GAME_STAGE_BACKGROUND_COLOR;

        this.load.image('loaderBg', PREFIX_IMAGE_URL + 'loader-bg.png');
        this.load.image('loaderBar', PREFIX_IMAGE_URL + 'loader-bar.png');
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
