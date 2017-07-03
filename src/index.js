//import 'p2';
//import 'pixi';
//import 'phaser';

import Boot from './stack/states/Boot';
import Preload from './stack/states/Preload';
import Title from './stack/states/Title';
import PlayNoPhysics from './stack/states/PlayNoPhysics';
import PlayWithPhysics from './stack/states/PlayWithPhysics';
import Score from './stack/states/Score';

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
        this.state.add('Title', Title, false);
        this.state.add('PlayNoPhysics', PlayNoPhysics, false);
        //this.state.add('PlayWithPhysics', PlayWithPhysics, false);
        this.state.add('Score', Score, false);

        this.state.start('Boot')
    }
}

function startGame()
{
    // There are a few more options you can set if needed, just take a look at Phaser.IGameConfig
    let gameConfig = {
        width: config.CAMERA_VIEW_WIDTH,
        height: config.CAMERA_VIEW_HEIGHT,
        renderer: Phaser.AUTO,
        parent: 'content',
        resolution: 1
    };

    let game = new Game(gameConfig);
}

window.onload = () => {
    startGame();
};