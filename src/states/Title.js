import TextButton from '../controls/TextButton';

export default class Title extends Phaser.State
{
    create()
    {
        this.title = new Phaser.Text(this.game, this.game.world.centerX, 100, 'Stack', {
            font: '36px Tahoma',
            fill: 'white',
            align: 'center'
        });
        this.title.anchor.setTo(0.5);

        this.start = new TextButton({
            game: this.game,
            x: this.game.world.centerX,
            y: this.game.world.centerY - 300,
            asset: 'bricks',
            overFrame: 2,
            outFrame: 1,
            downFrame: 0,
            upFrame: 1,
            label: 'Start',
            style: {
                font: '16px Verdana',
                fill: 'white',
                align: 'center'
            }
        });

        this.btnOverSound = this.add.sound('menuOver');
        this.btnOutSound = this.add.sound('menuOut');
        this.btnDownSound = this.add.sound('menuDown');

        this.start.setOverSound(this.btnOverSound);
        this.start.setOutSound(this.btnOutSound);
        this.start.setDownSound(this.btnDownSound);

        this.start.onInputUp.add(()=>{
            this.state.start('Play');
        });

        this.menuPanel = this.add.group();
        this.menuPanel.add(this.title);
        this.menuPanel.add(this.start);

        if (this.state.states['PlayWithPhysics']) {
            this.state.start('PlayWithPhysics');
        }
        else {
            this.state.start('PlayNoPhysics');
        }
    }
}
