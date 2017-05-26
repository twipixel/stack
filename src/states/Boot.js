export default class Boot extends Phaser.State
{
    preload()
    {
        this.game.stage.backgroundColor = '#8BC34A';
        this.load.image('loaderBg', '../../assets/image/loader-bg.png');
        this.load.image('loaderBar', '../../assets/image/loader-bar.png');
    }

    create()
    {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        this.scale.pageAlignVertically = true;
        this.scale.pageAlignHorizontally = true;

        //this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.state.start('Preload');
    }
}
