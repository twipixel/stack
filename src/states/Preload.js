export default class Preload extends Phaser.State
{
    preload()
    {
        this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg');
        this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar');
        this.loaderBg.anchor.setTo(0.5);
        this.loaderBar.anchor.setTo(0.5);

        this.load.setPreloadSprite(this.loaderBar);

        this.load.atlasJSONArray('bricks', '../../assets/spritesheet/bricks.png', '../../assets/spritesheet/bricks.json');

        this.load.audio('menuOver', ['../../assets/sound/menu-over.mp3']);
        this.load.audio('menuOut', ['../../assets/sound/menu-out.mp3']);
        this.load.audio('menuDown', ['../../assets/sound/menu-click.mp3']);
    }

    create()
    {
        this.state.start('Title');
    }
}
