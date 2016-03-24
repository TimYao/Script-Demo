/*
*   这里还会继续更新最新发掘代码
*
*  由于zepto 不支持 animate 下的scrollTop动画问题
*  此方法包实现两种方式
*     1、scrollAnimation
*
*
*/

(function($,global,udf){

    var g = global === window ? global : window;

    //事件触发
    $("#btn").on('click',function(){
        $(g).scrollAnimation();
    });

    //方法实现
    $.fn.scrollAnimation= function(opt){
        var opt = opt || {};
        var options = $.extend(opt,{"target":0,"t":500,"d":30});
        var target = options.target || 0;   //目的达到
        var time = options.t || 1000;       //动画执行时间
        var dely = options.d || 500;        //动画延迟执行时间
        var to = null;
        var flg = true;

        to=setInterval(function(){
            var h = parseFloat($(g).scrollTop(),10);

            //----------------------------方法一 利用比例清算
            var ic = (time/dely);
            var subs = (target-h);
            var speed = (subs/ic);
            speed = speed>0 ? Math.ceil(speed) : Math.floor(speed);
            if(h==target)
            {
                clearInterval(to);
                to=null;
            }else{
                $(g).scrollTop(h+speed);
                flg = false;
            }

            //-----------------------------方法二利用距离差值    第二种方法中的dely可以自己去设置
            var speed = (target-h)/5;
            speed = speed>0 ? Math.ceil(speed) : Math.floor(speed);
            if(h==target)
            {
                 clearInterval(to);
                 to=null;
            }else{
                $(g).scrollTop(h+speed);
                flg = false;
            }


        },dely);

        //防止 拉动继续滚动问题   重点学习位置哦
        $(g).on('scroll',function(){
            if(flg)
            {
                clearInterval(to);
            }else{
                flg = true;
            }
        });
    }
})(Zepto,window,undefined);