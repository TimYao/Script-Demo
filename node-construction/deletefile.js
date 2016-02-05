/*
*
*  delete mod_ ext[.html,.css]
*  压缩css,js
*
*  配置介绍：
*            root      文件相对目录
*            optdir    操作目录，从哪个目录开始遍历
*            deltag    删除标签配置 filename 删除文件标注 ,fileext 文件后缀
*            uglify    压缩文件路径 目前支持 js目录 jsdir / css目录 cssdir   -----该配置暂时支持单文件项目，多支持文件待完善
*            min       压缩投放到目录
*
* 支持并行运行  clearfile(清除指定文件) compress(压缩指定文件) 双重任务并行执行
*
* exp  node deletefile.js clearfile compress
*/

//配置
var paths = {
        root:'./',
        opdir:['web','css'],
        deltag:[{
            filename:'mod_',
            fileext : '.html'
        },{
            filename:'mod_',
            fileext : '.css'
        },{
            filename:'layout',
            fileext : '.html'
        }],
        uglify:{
            jsdir:'js',
            cssdir:'css'
        },
        min:'min'
    },
    fs = require('fs'),
    path = require('path'),
    uglifyjs = require('uglify-js'),
    cleancss = require('clean-css'),
    diroot = __dirname,
    deldir = paths['opdir'],
    matchtag = paths.deltag,
    matchlength = matchtag.length,
    tasklen = process.argv.slice(2).length,
    argvs = process.argv.slice(2),
    commands = {
        clearfile:clearfun,
        compress:compressfun
    };

//命令控制运行
if(process.argv.slice(2).length>0)
{
    nextTask();
}else{
    processinfors();
}

//控制任务执行顺序，这里为串形控制
function nextTask()
{
    var command = argvs.shift();
    if(command)
    {
        commands[command](function(){
            nextTask();
        });
    }
}
//清楚废弃不需要文件
function clearfun(cb)
{
    var ifile = lasti = 0,i=0,l=deldir.length;
    for(i;i<l;i++)
    {
        var mdir = paths.root+deldir[i];
        readDir(mdir,cb);
    }
    function readDir(dir,cb)
    {
        fs.stat(dir,function(err,d){
            if(d.isDirectory())
            {
                if(fs.existsSync(dir))
                {
                    readfiles(dir,cb);
                }
            }else if(d.isFile())
            {
                deleteFile(dir,cb);
            }
        });
    }
    function readfiles(d,cb)
    {
        fs.readdir(d,function(err,files){
            files.forEach(function(f){
                var file = path.join(d,'/',f);
                deleteFile(file,cb);
            });
        });
    }
    function deleteFile(file,cb)
    {
        (function next(file){
            fs.stat(file,function(err,f){
                if(f.isDirectory())
                {
                    readfiles(file,cb);
                }else if(f.isFile()){
                    var filename = path.basename(file),
                        filextname = path.extname(file);
                    for(var j =0;j<matchlength;j++)
                    {
                        filematchname = matchtag[j].filename;
                        filematchext = matchtag[j].fileext;
                        (filename.indexOf(filematchname)>-1 && filename.indexOf(filematchname)==0 && filextname.indexOf(filematchext)>-1) ? (ifile++,fs.unlink(file,function(err){
                            if(err)
                            {
                                console.log("error is "+ err);
                                return false;
                            }
                            if(lasti>=ifile-1)
                            {
                                //通知结束回调
                                cb();
                                return false;
                            }
                            lasti++;
                        })) : (cb());
                    }
                }else{
                    return false;
                }
            });
        })(file);
    }
}

//压缩CSS,JS
function compressfun(cb)
{
    var m= 0,k= 0,n=0;
    for(var a in paths['uglify'])
    {
        if(paths['uglify'][a])
        {
            var d = path.join(paths['root'],'/',paths['uglify'][a]);
            uglifyfile(d);
        }
    }
    function mkdir(callback)
    {
        fs.readdir(paths.root,function(err,d){
            if(!fs.existsSync(paths.min))
            {
                fs.mkdir(paths.min,0777,function(err){
                    if(err)
                    {
                        console.log(err);
                    }else{
                        console.log("create "+paths.min+" dir success!");
                        callback();
                    }
                });
            }else{
                callback();
            }
        });
    }
    function uglifyfile(d)
    {
        if(fs.existsSync(d))
        {
            fs.stat(d,function(err,s){
                if(s.isDirectory())
                {
                    fs.readdir(d,function(err,f){
                        (function next(i){
                            if(i>= f.length)
                            {
                                return false;
                            }
                            uglifyfile(path.join(d,f[i]));
                            i++;
                            next(i);
                        })(0);
                    });
                }else if(s.isFile()){
                    var extname = path.extname(d),
                        basename = path.basename(d);
                    if((basename.indexOf('.min')<0 && /.js$/ig.test(extname) && basename.indexOf('_dev')<0) || (basename.indexOf('.min')<0 && /.css$/ig.test(extname) && basename.indexOf('_dev')<0))
                    {
                        k++;
                        compresses(d,basename);
                    }

                }
            });
        }
        function compresses(dir,basename)
        {
            //目录创建成功
            mkdir(function(){
                var filename = path.basename(basename,path.extname(basename)),
                    r = (Math.random()*100).toString().split(".").join(''),
                    min = path.join('./',paths.min,'/',filename);//生成随机数 ----待完善中......

                if(/.js$/gi.test(basename))
                {
                    var ug = uglifyjs.minify(dir),
                        codes = ug.code,
                        flg = '.min.js',
                        errtext = filename+'.js compress  is error';
                }else if(/.css$/gi.test(basename))
                {
                    var cug = new cleancss({target:'./min/',relativeTo:'./'}).minify([dir]),
                        codes = cug.styles,
                        flg = '.min.css',
                        errtext = filename+'.css compress  is error';
                }
                //删除生成新文件
                (function(cb){
                    fs.unlink(min + flg,function(err){
                        if(m<=0)
                        {
                            cb(m);
                        }else{
                            m--;
                        }
                        //去除用fs.existsSync方法来排除重复问题,这里是引起问题的关键位置
                        //if(!fs.existsSync(min+flg))
                        //{
                        //    createFile(min,flg,codes,errtext);
                        //}else{
                        //    if(err)
                        //    {
                        //        console.log('delete '+filename+flg+' is error!');
                        //        return false;
                        //    }
                        //}
                    });
                })(function(){
                    createFile(min,flg,codes,errtext,function(m){
                        if(m>=k)
                        {
                            infors();
                            return false;
                        }
                    });
                });
            });
            //异步任务监测完成消息
            function infors()
            {
                 console.log('Complete compression!');
                 cb();
            }
            function createFile(min,flg,codes,errtext,cb)
            {
                fs.appendFile(min + flg, codes, function (err) {
                    if (err) {
                       console.log(errtext);
                       return false;
                    }
                    ++m;
                    cb(m);
                });
            }
        }
    }
}

//命令提示
function processinfors()
{
    var m = 0,arrcomds="";
    for(var a in commands)
    {
         m++;
         arrcomds += '----'+a+"\n\t";
    }
    if(m>0)
    {
        process.stdout.write('\n');
        process.stdout.write('Please enter the following command: \n\t'+arrcomds.slice(0,arrcomds.lastIndexOf('|')));
        process.stdout.write('\n');
        process.stdout.write('example : node filename '+arrcomds.slice(4).split('\n')[0]);
        process.stdout.write('\n');
    }
}


