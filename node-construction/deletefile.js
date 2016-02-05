/*
*
*  delete mod_ ext[.html,.css]
*  ѹ��css,js
*
*  ���ý��ܣ�
*            root      �ļ����Ŀ¼
*            optdir    ����Ŀ¼�����ĸ�Ŀ¼��ʼ����
*            deltag    ɾ����ǩ���� filename ɾ���ļ���ע ,fileext �ļ���׺
*            uglify    ѹ���ļ�·�� Ŀǰ֧�� jsĿ¼ jsdir / cssĿ¼ cssdir   -----��������ʱ֧�ֵ��ļ���Ŀ����֧���ļ�������
*            min       ѹ��Ͷ�ŵ�Ŀ¼
*
* ֧�ֲ�������  clearfile(���ָ���ļ�) compress(ѹ��ָ���ļ�) ˫��������ִ��
*
* exp  node deletefile.js clearfile compress
*/

//����
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

//�����������
if(process.argv.slice(2).length>0)
{
    nextTask();
}else{
    processinfors();
}

//��������ִ��˳������Ϊ���ο���
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
//�����������Ҫ�ļ�
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
                                //֪ͨ�����ص�
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

//ѹ��CSS,JS
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
            //Ŀ¼�����ɹ�
            mkdir(function(){
                var filename = path.basename(basename,path.extname(basename)),
                    r = (Math.random()*100).toString().split(".").join(''),
                    min = path.join('./',paths.min,'/',filename);//��������� ----��������......

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
                //ɾ���������ļ�
                (function(cb){
                    fs.unlink(min + flg,function(err){
                        if(m<=0)
                        {
                            cb(m);
                        }else{
                            m--;
                        }
                        //ȥ����fs.existsSync�������ų��ظ�����,��������������Ĺؼ�λ��
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
            //�첽�����������Ϣ
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

//������ʾ
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


