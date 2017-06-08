
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
}