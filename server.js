var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); //解析json格式的请求体
app.listen(3000);
var fs = require('fs');
//当访问http://localhost:3000 要将首页进行返回
//静态服务中间件 以当前服务根目录作为静态服务根目录
app.use(express.static(__dirname));
app.get('/',function (req,res) {
    res.sendFile('./index.html',{root:__dirname});
});
function setBooks(books,callback) {
    //将我们存放好的书写入到json文件中
    fs.writeFile('./book.json',JSON.stringify(books),callback);
}
function getBooks(callback) {
    fs.readFile('./book.json','utf8',function (err,data) {
        var books = [];
        if(err){
            callback(books);//如果有错误默认为空数组
        }else{
            try{
                books = JSON.parse(data);
            }catch(e){
                books = [];
            }
            callback(books);
        }
    });
}
app.post('/books',function (req,res) {
    //我们想将增加的图书写到json文件中
    //获得请求体
    var book = req.body;
    //在写之前先读之前json文件b
    getBooks(function (data) {
        //将书写入到json中需要增加唯一id
        //空数组默认id为1  其他时递增
        book.id = data.length?data[data.length-1].id+1:1;
        data.push(book);
        setBooks(data,function () {
            res.send(book);//增加的时候默认返回增加的那一项
        });
    });
});
app.get('/books',function (req,res) {
   //返回所有书
    getBooks(function (data) {
        res.send(data);
    })
});

app.get('/books/:id',function (req,res) {
    var id = req.params.id;
    getBooks(function (data) {
        //在所有书中找到某一个 ，将某一本数返回给前台
        var book = data.find(function (item) {
            return item.id == id;
        });
        res.send(book);
    })
});
//删除方法
app.delete('/books/:id',function (req,res) {
    var id = req.params.id;
    getBooks(function (data) {
        var books = data.filter(function (item) {
            return item.id!=id;
        });
        setBooks(books,function () {
            res.send({}); //删除后默认返回空对象
        })
    })
});
app.put('/books/:id',function (req,res) {
    var id = req.params.id;
    var book = req.body;

    getBooks(function (data) {
        var books = data.map(function (item) {
            if(item.id == id){
                return book
            }else{
                return item
            }
        });
        setBooks(books,function () {
            res.send(book);//修改后 将修改的那一本身书返回
        })
    })


});
