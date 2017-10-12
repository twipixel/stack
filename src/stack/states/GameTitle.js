import TextButton from '../controls/TextButton';

export default class GameTitle extends Phaser.State
{
    create()
    {
        const gameTitleText = new Phaser.Text(this.game, this.game.world.centerX, this.viewCenterY - 150, 'STACK', {
            font: '36px Tahoma',
            fill: 'white',
            align: 'center'
        });

        gameTitleText.anchor.setTo(0.5);

        const startButton = new TextButton({
            game: this.game,
            x: this.game.world.centerX,
            y: this.viewCenterY,
            asset: 'bricks',
            overFrame: 2,
            outFrame: 1,
            downFrame: 0,
            upFrame: 1,
            label: 'START',
            style: {
                font: '16px Verdana',
                fill: 'white',
                align: 'center'
            }
        });

        const btnOverSound = this.add.sound('menuOver');
        const btnOutSound = this.add.sound('menuOut');
        const btnDownSound = this.add.sound('menuDown');

        startButton.setOverSound(btnOverSound);
        startButton.setOutSound(btnOutSound);
        startButton.setDownSound(btnDownSound);

        startButton.onInputUp.add(()=>{
            if (this.state.states['GameWithPhysics']) {
                this.state.start('GameWithPhysics');
            }
            else {
                this.state.start('GameNoPhysics');
            }
        });

        const menuPanel = this.add.group();
        menuPanel.add(gameTitleText);
        menuPanel.add(startButton);
    }


    /**
     * 현재 보이는 화면의 중앙
     * @returns {number}
     */
    get viewCenterY()
    {
        return this.camera.view.y + this.camera.view.height / 2;
    }

    /**
     * 현재 보이는 화면 맨 하단
     * @returns {number}
     */
    get viewBottomY()
    {
        return this.camera.view.y + this.camera.view.height;
    }
}
