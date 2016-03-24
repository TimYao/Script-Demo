/*
*   ���ﻹ������������·������
*
*  ����zepto ��֧�� animate �µ�scrollTop��������
*  �˷�����ʵ�����ַ�ʽ
*     1��scrollAnimation
*
*
*/

(function($,global,udf){

    var g = global === window ? global : window;

    //�¼�����
    $("#btn").on('click',function(){
        $(g).scrollAnimation();
    });

    //����ʵ��
    $.fn.scrollAnimation= function(opt){
        var opt = opt || {};
        var options = $.extend(opt,{"target":0,"t":500,"d":30});
        var target = options.target || 0;   //Ŀ�Ĵﵽ
        var time = options.t || 1000;       //����ִ��ʱ��
        var dely = options.d || 500;        //�����ӳ�ִ��ʱ��
        var to = null;
        var flg = true;

        to=setInterval(function(){
            var h = parseFloat($(g).scrollTop(),10);

            //----------------------------����һ ���ñ�������
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

            //-----------------------------���������þ����ֵ    �ڶ��ַ����е�dely�����Լ�ȥ����
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

        //��ֹ ����������������   �ص�ѧϰλ��Ŷ
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