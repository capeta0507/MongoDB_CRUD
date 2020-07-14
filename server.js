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
