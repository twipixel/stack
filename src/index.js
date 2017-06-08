//import 'p2';
//import 'pixi';
//import 'phaser';

import Boot from './states/Boot';
import Preload from './states/Preload';
import Title from './states/Title';
import PlayNoPhysics from './states/PlayNoPhysics';
import PlayWithPhysics from './states/PlayWithPhysics';
import Score from './states/Score';

import config from './config/config'

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
    let gameWidth = config.GAME_WIDTH;
    let gameHeight = config.GAME_HEIGHT;

    // There are a few more options you can set if needed, just take a look at Phaser.IGameConfig
    let gameConfig = {
        width: gameWidth,
        height: gameHeight,
        renderer: Phaser.AUTO,
        parent: 'content',
        resolution: 1
    };

    let game = new Game(gameConfig);
}

window.onload = () => {
    startGame();
};