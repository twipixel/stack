
export default class Utils
{
    constructor()
    {

    }

    /**
     * 소숫점을 잘라줍니다.
     * @param num 넘버
     * @param power 표현하고 싶은 소숫점 자리 수
     * @returns {number}
     */
    static digit(num, power = 2)
    {
        var n = Math.pow(10, power);
        return parseInt(num * n) / n;
    }


    static getCircle(game, x = 0, y = 0, diameter = 10, fillColor = 0xFFFFFF, lineThickness = 0, lineColor = 0xFFFFFF)
    {
        const g = game.add.graphics(x, y);
        g.beginFill(fillColor);
        g.lineStyle(lineThickness, lineColor);
        g.drawCircle(0, 0, diameter);
        g.endFill();
        return g;
    }

    static getLine(game, x = 0, y = 0, width = 10, color = 0xFFFFFF)
    {
        const g = game.add.graphics(x, y);
        g.beginFill(color);
        g.drawRect(0, 0, width, 1);
        g.endFill();
        return g;
    }
}