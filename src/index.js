import 'p2';
import 'pixi';
import 'phaser';

import Boot from './states/Boot';
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
        //GAME.state.add('Preload', Preload, false);
        //GAME.state.add('Menu', Menu, false);
        //GAME.state.add('Game', Game, false);
        //GAME.state.add('Result', Result, false);

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