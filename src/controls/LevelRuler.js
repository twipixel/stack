export default class LevelRuler extends Phaser.Sprite
{
    constructor(game, levelLabel, worldHeight, cameraHeight)
    {
        super(game);

        this.levelLabel = levelLabel;
        this.worldHeight = worldHeight;
        this.cameraHeight = cameraHeight;

        this.initialize();
    }

    initialize()
    {

    }
}