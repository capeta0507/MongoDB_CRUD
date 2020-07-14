# MongoDB CRUD 方法2
###### tags: `Node.js` `MongoDB` `CRUD`

根據 async await 方法來建置 MongoDB CRUD RESTFul API 技巧 (2020/07/14)\

參考：
1. 影片教學 [Quick Start: How to Perform the CRUD Operations Using MongoDB & Node.js](https://www.youtube.com/watch?v=ayNI9Q84v8g)
2. 文章 [Connect to a MongoDB Database Using Node.js](https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb--how-to-get-connected-to-your-database)
3. 課程簡介 [How to Perform the CRUD Operations Using MongoDB and Node.js?](https://morioh.com/p/fc1d775dc648?f=5c21fb01c16e2556b555ab32&fbclid=IwAR3JgfyQjycTjYmqOde6kgjJPsG9ubenyjf6W6xbxyFvUURvmySRgB7zHyg)

### Server.js
```javascript=
const express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser');
// create application/json parser (POST 傳送 JOSN 資料過來的bodyParser)
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser  (POST 傳送 client表單 資料過來的bodyParser)
var urlencodedParser = bodyParser.urlencoded({ extended: false })
// MongoDB Client
const {MongoClient} = require('mongodb');
var {mongodb_url,databaseName} = require('./mongodb_altas');  // Mongodb Altas

const app = express();
const PORT = process.env.PORT || 5500;

// 允許跨平台request (cors)
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
  res.send('Home ... Mongodb Test...');
})

// mongodb router (CURD)
var db_router = require('./db_router');
app.use('/db',db_router);

serverStart();    // 啟動：連上MongoDB之後，啟動app listen。

async function serverStart(){
  const uri = mongodb_url;
  const client = new MongoClient(uri,{useNewUrlParser: true,useUnifiedTopology: true,connectTimeoutMS: 5000,serverSelectionTimeoutMS: 5000});
  try {
    await client.connect();
    const databaseList = await client.db().admin().listDatabases();
    console.log('Database List : ');
    databaseList.databases.forEach(db =>{
      console.log(` - ${db.name}`);   // 顯示 所有資料庫名稱
    });
    dbo = client.db(databaseName);  // 指向 資料庫
    console.log(`MongoDB 連線 ${databaseName}...成功`);
    // 資料庫 連線OK , 進行 PORT Listen
    app.listen(PORT,()=>{
    console.log(`Running on http://localhost:${PORT}`);
  });
  }catch (err){
    console.log('MongoDB 無法連線 ...');
    console.log(err);
    console.log('.........................');
    console.log('系統監聽 ... 停止');
  }finally {
    await client.close();
  }
}

```

### 啟動 server.js 監聽
見下圖
![Node server.js](https://i.imgur.com/e7yJwhu.png)


### 引用 mongodb_altas.js
這是設定所需要的功用變數
1. mongodb_url：Mongodb Altas 連線設定
2. databaseName：資料庫名稱
3. collecionName：Collection Name

### RESTful API 程序
程式碼：https://github.com/capeta0507/MongoDB_CRUD/blob/master/db_router.js

### 執行 POST 資料建檔
URL：POST http://localhost:5500/db/createone
Body 寄送
```jsonld=
{
    "db_name": "Marvel_db",
    "colloction_name": "Todos",
    "create_data":{
        "userId": 2,
        "id": 201,
        "title": "資料庫維護 Node.js + Express + Mongodb",
        "completed": false,
        "user_name": ""
    }
}
```
#### 結果
```json=
{
    "success": true,
    "status": "Ok",
    "db_name": "Marvel_db",
    "colloction_name": "Todos",
    "create_data": {
        "userId": 2,
        "id": 201,
        "title": "資料庫維護 Node.js + Express + Mongodb",
        "completed": false,
        "user_name": "",
        "_id": "5f0d9433e3bd080aa05f212f"
    },
    "data": {
        "result": {
            "n": 1,
            "opTime": {
                "ts": "6849293559359602689",
                "t": 14
            },
            "electionId": "7fffffff000000000000000e",
            "ok": 1,
            "$clusterTime": {
                "clusterTime": "6849293559359602689",
                "signature": {
                    "hash": "SHykGROqZ8nG2XadTn24H1c8Raw=",
                    "keyId": "6828761463906107395"
                }
            },
            "operationTime": "6849293559359602689"
        },
        "connection": {
            "_events": {},
            "_eventsCount": 4,
            "id": 1,
            "address": "35.185.134.119:27017",
            "bson": {},
            "socketTimeout": 360000,
            "monitorCommands": false,
            "closed": false,
            "destroyed": false,
            "lastIsMasterMS": 26
        },
        "ops": [
            {
                "userId": 2,
                "id": 201,
                "title": "資料庫維護 Node.js + Express + Mongodb",
                "completed": false,
                "user_name": "",
                "_id": "5f0d9433e3bd080aa05f212f"
            }
        ],
        "insertedCount": 1,
        "insertedId": "5f0d9433e3bd080aa05f212f",
        "n": 1,
        "opTime": {
            "ts": "6849293559359602689",
            "t": 14
        },
        "electionId": "7fffffff000000000000000e",
        "ok": 1,
        "$clusterTime": {
            "clusterTime": "6849293559359602689",
            "signature": {
                "hash": "SHykGROqZ8nG2XadTn24H1c8Raw=",
                "keyId": "6828761463906107395"
            }
        },
        "operationTime": "6849293559359602689"
    }
}
```

### 執行 GET 資料查詢
URL：GET http://localhost:5500/db/readlist
Body 寄送
```json=
{
    "db_name": "Marvel_db",
    "colloction_name": "Todos",
    "skip": 0,
    "limit": 5,
    "query":{
        "userId": 2
    }
}
```
直接在 JSON 資料上指名 db_name , collection_name , skip , limit , query條件
skip : 0 , 從最前面開始讀。
limit : 5 , 取得符合條件的前5筆紀錄。

#### 結果
```json=
{
    "success": true,
    "status": "Ok",
    "db_name": "Marvel_db",
    "colloction_name": "Todos",
    "query": {
        "userId": 2
    },
    "skip": 0,
    "limit": 5,
    "datacount": 21,
    "data": [
        {
            "_id": "5ee3435166a7e943543a87d0",
            "userId": 2,
            "id": 27,
            "title": "repudiandae totam in est sint facere fuga",
            "completed": false,
            "user_name": "詹森安David"
        },
        {
            "_id": "5ee3435166a7e943543a87cf",
            "userId": 2,
            "id": 26,
            "title": "aliquam aut quasi",
            "completed": true
        },
        {
            "_id": "5ee3435166a7e943543a87db",
            "userId": 2,
            "id": 38,
            "title": "totam quia non",
            "completed": false
        },
        {
            "_id": "5ee3435166a7e943543a87da",
            "userId": 2,
            "id": 37,
            "title": "sunt cum tempora",
            "completed": false
        },
        {
            "_id": "5ee3435166a7e943543a87dc",
            "userId": 2,
            "id": 39,
            "title": "doloremque quibusdam asperiores libero corrupti illum qui omnis",
            "completed": false
        }
    ]
}
```
datacount : 代表符合條件的筆數。
data : 陣列，顯示索取得的紀錄。

見下圖
![](https://i.imgur.com/XNbbGqb.png)

### 執行 GET 單筆資料查詢
URL：GET http://localhost:5500/db/readone/5f0c641f3b1da52f18e05738
Body 寄送
```json=
{
    "db_name": "Marvel_db",
    "colloction_name": "Todos"
}
```
#### 結果
```json=
{
    "success": true,
    "status": "Ok",
    "db_name": "Marvel_db",
    "colloction_name": "Todos",
    "query": {
        "_id": "5f0c641f3b1da52f18e05738"
    },
    "datacount": 1,
    "data": [
        {
            "_id": "5f0c641f3b1da52f18e05738",
            "userId": 2,
            "id": 201,
            "title": "NODE MONGODB CRUD",
            "completed": false,
            "user_name": "DavidTPE"
        }
    ]
}
```

### 執行 PUT 單筆資料維護
URL：PUT http://localhost:5500/db/updateone/5f0c641f3b1da52f18e05738
Body 寄送
```json=
{
    "db_name": "Marvel_db",
    "colloction_name": "Todos",
    "update_data":{
        "title": "NODE MONGODB CRUD",
        "completed": false,
        "user_name" : "DavidTPE"
    }
}
```
#### 結果
```json=
{
    "success": true,
    "status": "Ok",
    "db_name": "Marvel_db",
    "colloction_name": "Todos",
    "query": {
        "_id": "5f0c641f3b1da52f18e05738"
    },
    "datacount": 1,
    "data": {
        "result": {
            "n": 1,
            "nModified": 0,
            "opTime": {
                "ts": "6849292154905296897",
                "t": 14
            },
            "electionId": "7fffffff000000000000000e",
            "ok": 1,
            "$clusterTime": {
                "clusterTime": "6849292154905296897",
                "signature": {
                    "hash": "bU5TbZ52ctKSBaMYd5+X7UlwC0g=",
                    "keyId": "6828761463906107395"
                }
            },
            "operationTime": "6849292154905296897"
        },
        "connection": {
            "_events": {},
            "_eventsCount": 4,
            "id": 1,
            "address": "35.185.134.119:27017",
            "bson": {},
            "socketTimeout": 360000,
            "monitorCommands": false,
            "closed": false,
            "destroyed": false,
            "lastIsMasterMS": 21
        },
        "modifiedCount": 0,
        "upsertedId": null,
        "upsertedCount": 0,
        "matchedCount": 1,
        "n": 1,
        "nModified": 0,
        "opTime": {
            "ts": "6849292154905296897",
            "t": 14
        },
        "electionId": "7fffffff000000000000000e",
        "ok": 1,
        "$clusterTime": {
            "clusterTime": "6849292154905296897",
            "signature": {
                "hash": "bU5TbZ52ctKSBaMYd5+X7UlwC0g=",
                "keyId": "6828761463906107395"
            }
        },
        "operationTime": "6849292154905296897"
    }
}
```

### 執行 DELETE 單筆資料刪除
URL：DELETE http://localhost:5500/db/deleteone/5f0c641f3b1da52f18e05738
Body 寄送
```json=
{
    "db_name": "Marvel_db",
    "colloction_name": "Todos"
}
```
#### 結果
```json=
{
    "success": true,
    "status": "Ok",
    "db_name": "Marvel_db",
    "colloction_name": "Todos",
    "query": {
        "_id": "5f0c641f3b1da52f18e05738"
    },
    "datacount": 1,
    "data": {
        "result": {
            "n": 1,
            "opTime": {
                "ts": "6849292988128952321",
                "t": 14
            },
            "electionId": "7fffffff000000000000000e",
            "ok": 1,
            "$clusterTime": {
                "clusterTime": "6849292988128952321",
                "signature": {
                    "hash": "HgxesKg/cwzGV7dWR9H+M4KcVos=",
                    "keyId": "6828761463906107395"
                }
            },
            "operationTime": "6849292988128952321"
        },
        "connection": {
            "_events": {},
            "_eventsCount": 4,
            "id": 1,
            "address": "35.185.134.119:27017",
            "bson": {},
            "socketTimeout": 360000,
            "monitorCommands": false,
            "closed": false,
            "destroyed": false,
            "lastIsMasterMS": 28
        },
        "deletedCount": 1,
        "n": 1,
        "opTime": {
            "ts": "6849292988128952321",
            "t": 14
        },
        "electionId": "7fffffff000000000000000e",
        "ok": 1,
        "$clusterTime": {
            "clusterTime": "6849292988128952321",
            "signature": {
                "hash": "HgxesKg/cwzGV7dWR9H+M4KcVos=",
                "keyId": "6828761463906107395"
            }
        },
        "operationTime": "6849292988128952321"
    }
}
```
