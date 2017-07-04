import TextButton from '../controls/TextButton';


export default class GameOver extends Phaser.State
{
    init(score)
    {
        this.score = score;
        console.log('GameOver.init(', score, ')');
    }


    create()
    {
        const scoreText = new Phaser.Text(this.game, this.game.world.centerX, this.viewCenterY - 150, 'YOUR SCORE\n' + this.score, {
            font: '36px Tahoma',
            fill: 'white',
            align: 'center'
        });

        console.log('center[', this.game.world.centerX, this.game.world.centerY, ']');

        scoreText.anchor.setTo(0.5);

        const retryButton = new TextButton({
            game: this.game,
            x: this.game.world.centerX,
            y: this.viewCenterY,
            asset: 'bricks',
            overFrame: 2,
            outFrame: 1,
            downFrame: 0,
            upFrame: 1,
            label: 'RETRY',
            style: {
                font: '16px Verdana',
                fill: 'white',
                align: 'center'
            }
        });

        const btnOverSound = this.add.sound('menuOver');
        const btnOutSound = this.add.sound('menuOut');
        const btnDownSound = this.add.sound('menuDown');

        retryButton.setOverSound(btnOverSound);
        retryButton.setOutSound(btnOutSound);
        retryButton.setDownSound(btnDownSound);

        retryButton.onInputUp.add(()=>{
            this.state.start('GameNoPhysics');
        });

        const menuPanel = this.add.group();
        menuPanel.add(scoreText);
        menuPanel.add(retryButton);
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
