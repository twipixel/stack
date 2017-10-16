

const singleton = Symbol();
const singletoneEnforcer = Symbol();


export default class Logic
{
    constructor(enforcer)
    {
        if (enforcer !== singletoneEnforcer) {
            throw new Error('The Logic class is a singleton. Use Logic.instance to access.');
        }
    }


    static get instance()
    {
        if (!this[singleton]) {
            this[singleton] = new Logic(singletoneEnforcer);
        }
        return this[singleton];
    }
}