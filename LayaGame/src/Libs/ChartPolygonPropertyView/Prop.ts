
export default class Prop
{
    id: number = 0;
    val: number = 0;
    name: string = "";

    clone():Prop
    {
        let d = new Prop();
        d.id = this.id;
        d.val = this.val;
        d.name = this.name;
        return d;
    }

    copyValue(p: Prop): Prop
    {
        this.id = p.id;
        this.val = p.val;
        this.name = p.name;
        return this;
    }
}