import Prop from "./Prop";
import Mathf from "../Mathf";
import Point = Laya.Point;
import Random from "../Helpers/Random";

export default class ChartPolygonPropertyView extends Laya.Sprite
{
    /** 属性数据 */
    data: Prop[] = [];
    /** 数据 最后绘制的 */
    private lastData: Prop[] = [];
    /** 数据 当前绘制的 */
    private props: Prop[] = [];
    
    /** 点 */
    private points: Laya.Point[] = [];

    /** 中心点 */
    center: Point = new Point();


    /** 角度偏远 */
    angleOffset = -15;
    /** 最大半径 */
    radius: number = 200;
    /** 值最大半径比例 */
    radiusValueRate: number = 1;
    /** 文本半径比例 */
    radiusTextRate: number = 1.2;

    /** 刻度几等分 */
    mark: number = 3;

    markRadiusRate: number[] = [1,  0.7, 0.4];
    markFillColors: string[] = ['#9e97daFF', '#8c84dbFF', '#7b71dbFF'];
    markLineColors: string[] = ['#FFFFFF33', '#bcb6edFF', '#bcb6edFF'];
    markLineWidths: number[] = [6, 2, 2];
    lineColor = '#bcb6edFF';
    lineWidth = 6;
    fillColor = '#FFFFFF66'
    pointSize = 6;
    pointColor = '#b8f0d0FF';
    valueFillColor = '#b8f0d066';
    valueLineColor = '#b8f0d0FF';
    valueLineWidth = 2;


    constructor()
    {
        super();
        window['c'] = this;

        this.test();
    }

    testMin = 100;
    testMax = 500;

    test()
    {
        this.testData();
        Laya.stage.on(Laya.Event.CLICK, this, this.testData);
    }

    testData()
    {
        this.data.length = 0;
        let prop;
        prop = new Prop();
        prop.id = 1;
        prop.val = Random.range(this.testMin, this.testMax);
        prop.name = "口才"
        this.data.push(prop);

        
        prop = new Prop();
        prop.id = 2;
        prop.val = Random.range(this.testMin, this.testMax);
        prop.name = "娱乐"
        this.data.push(prop);

        
        prop = new Prop();
        prop.id = 3;
        prop.val = Random.range(this.testMin, this.testMax);
        prop.name = "表演"
        this.data.push(prop);
        
        prop = new Prop();
        prop.id = 4;
        prop.val = Random.range(this.testMin, this.testMax);
        prop.name = "才艺"
        this.data.push(prop);
        
        prop = new Prop();
        prop.id = 5;
        prop.val = Random.range(this.testMin, this.testMax);
        prop.name = "魅力"
        this.data.push(prop);
        this.setData(this.data);
    }

    private isFirst = true;
    /** 设置数据 */
    setData(props: Prop[])
    {
        this.data = props;

        if(this.data.length != this.props.length)
        {
            for(let i = 0; i < props.length; i ++)
            {
                if(i < this.props.length)
                {
                    this.props[i].copyValue(props[i]);

                }
                else
                {
                    this.props.push(props[i].clone());
                }
            }
        }

        if(this.data.length != this.lastData.length)
        {
            for(let i = 0; i < props.length; i ++)
            {
                if(i < this.lastData.length)
                {
                    this.lastData[i].copyValue(props[i]);

                }
                else
                {
                    this.lastData.push(props[i].clone());
                }
            }
        }

        if(this.isFirst)
        {
            this.draw();
            this.isFirst = false;
        }
        else
            this.tweenDraw();
    }



    public tweenDuration = 1000;
    private tweenMax = 100;
    private _tweenIndex = 0;

    private  get tweenIndex(): number
    {
        return this._tweenIndex ;
    }

    private set tweenIndex(val: number)
    {
        this._tweenIndex = val;
        let count = this.props.length;
        let prop: Prop;
        let rate = this._tweenIndex / this.tweenMax;
        for(let i = 0; i < count; i ++)
        {
            prop = this.props[i];
            prop.val =  Laya.MathUtil.lerp(this.lastData[i].val, this.data[i].val, rate);
        }

        if(rate >= 1)
        {
            for(let i = 0; i < this.lastData.length; i ++)
            {
                this.lastData[i].val = this.data[i].val;
            }
        }
        this.draw();
    }

    /** 缓动绘制 */
    tweenDraw()
    {
        this.tweenIndex = 0;
        Laya.Tween.clearAll(this);
        Laya.Tween.to(this, {tweenIndex: this.tweenMax}, this.tweenDuration, Laya.Ease.linearNone);
    }


    /** 绘制 */
    draw()
    {
        this.graphics.clear();
        // 绘制刻度
        for(let i =0; i < this.mark; i ++)
        {
            this.drawMark(this.markRadiusRate[i] * this.radius, this.markFillColors[i], this.markLineColors[i], this.markLineWidths[i]);
        }


        // 绘制经线
        this.drawLongitude();

        // 绘制值
        this.drawValue();

        // 绘制文本
        this.drawText();

    }

    /** 计算点 */
    calculationPoints(radius?: number)
    {
        if(!radius || radius <= 0)
            radius = this.radius;

        let count = this.props.length;
        let averageAngle = 360 / count;
        for(let i = 0; i < count; i ++)
        {
            let angle = this.angleOffset + averageAngle * i;

            let point: Point;
            if(i < this.points.length)
            {
                point = this.points[i];
            }
            else
            {
                point = new Point();
                this.points.push(point);
            }

            point.x = Mathf.anglePointX(angle, radius, this.center.x);
            point.y = Mathf.anglePointY(angle, radius, this.center.y);
        }
    }

    /** 绘制文本 */
    private drawText()
    {
        let count = this.props.length;
        this.calculationPoints();
    }

    
    /** 绘制值 */
    private drawValue()
    {
        let count = this.props.length;
        let averageAngle = 360 / count;

        
        let maxPropVal = 0;
        for(let i = 0; i < count; i ++)
        {
            maxPropVal = Math.max(this.props[i].val, maxPropVal);
        }



        let point: Point;
        for(let i = 0; i < count; i ++)
        {
            let angle = this.angleOffset + averageAngle * i;

            if(i < this.points.length)
            {
                point = this.points[i];
            }
            else
            {
                point = new Point();
                this.points.push(point);
            }

            let radius = maxPropVal <= 0 ? 0 : this.props[i].val /  maxPropVal * this.radiusValueRate * this.radius;

            point.x = Mathf.anglePointX(angle, radius, this.center.x);
            point.y = Mathf.anglePointY(angle, radius, this.center.y);
        }

        let pointArray = this.pointsToArray(this.points, count);
        
        // 绘制多边形
        this.graphics.drawPoly(this.center.x, this.center.y, pointArray, this.valueFillColor, this.valueLineColor, this.valueLineWidth);

        // 绘制点
        for(let i = 0; i < count; i ++)
        {
            point = this.points[i];
            this.graphics.drawCircle(point.x, point.y, this.pointSize, this.pointColor);
        }

    }

    /** 绘制经线 */
    drawLongitude()
    {
        let count = this.props.length;
        this.calculationPoints(this.radius);
        for(let i = 0; i < count; i ++)
        {
            let point: Point = this.points[i];
            this.graphics.drawLine(this.center.x, this.center.y, point.x, point.y, this.lineColor, this.lineWidth);
        }
    }

    /** 绘制刻度 */
    private drawMark(radius: number, fillColor: any, lineColor?: any, lineWidth?: number)
    {
        let count = this.props.length;
        this.calculationPoints(radius);

        let pointArray = this.pointsToArray(this.points, count);

        
        this.graphics.drawPoly(this.center.x, this.center.y, pointArray, fillColor, lineColor, lineWidth);
    }

    private pointsToArray(points: Point[], count?: number): number[]
    {
        (count === void 0) && (count = points.length);

        count = Math.min(count, this.points.length);

        let arr = [];
        arr.length = 0;
        let point: Point;
        for(let i = 0; i < count; i ++)
        {
            point = points[i];
            arr.push(point.x, point.y);
        }
        return arr;
    }


}