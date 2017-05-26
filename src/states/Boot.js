export default class Boot extends Phaser.State
{
    preload()
    {
        console.log('preload()');
    }

    create()
    {
        console.log('create()');
        //this.state.start('Preload');
    }
}
