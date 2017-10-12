//import 'p2';
//import 'pixi';
//import 'phaser';

import Boot from './stack/states/Boot';
import Preload from './stack/states/Preload';
import GameTitle from './stack/states/GameTitle';
import GameNoPhysics from './stack/states/GameNoPhysics';
import GameWithPhysics from './stack/states/GameWithPhysics';
import GameOver from './stack/states/GameOver';

import config from './stack/config/config'

class Game extends Phaser.Game
{
    /**
     * @param config {Phaser.IGameConfig}
     */
    constructor(config)
    {
        super(config);

        this.state.add('Boot', Boot, false);
        this.state.add('Preload', Preload, false);
        this.state.add('GameTitle', GameTitle, false);
        this.state.add('GameNoPhysics', GameNoPhysics, false);
        //this.state.add('GameWithPhysics', GameWithPhysics, false);
        this.state.add('GameOver', GameOver, false);

        this.state.start('Boot')
    }
}

function startGame()
{
    // There are a few more options you can set if needed, just take a look at Phaser.IGameConfig
    const gameConfig = {
        width: config.CAMERA_VIEW_WIDTH,
        height: config.CAMERA_VIEW_HEIGHT,
        renderer: Phaser.AUTO,
        parent: 'content',
        resolution: 1
    };

    const game = new Game(gameConfig);
}

window.onload = () => {
    startGame();
};