const express = require('express');

var router = express.Router();
var {mongodb_url,databaseName,collecionName} = require('./mongodb_altas');

// 處理 mongodb 的新增、修改、刪除、查詢
var {MongoClient,ObjectId} = require('mongodb');

let dbo;                        // db
let collectObj;                 // collection
let dataSkip = 0;               // skip
let dataLimit = 10;             // limit
let dataQuery = {"userId": 1};  // 條件
var dataCount = 0;              // 紀錄筆數

// CRUD - C 新增 // POST
router.post('/createone',(req,res)=>{
  if (req.body.db_name == undefined) {
    return res.json({
      success:false,
      status:"Error",
      message:"沒有提供資料庫 ...",
    })
  }
  if (req.body.colloction_name == undefined) {
    return res.json({
      success:false,
      status:"Error",
      message:"沒有提供 colloction ...",
    })
  }
  databaseName = req.body.db_name;
  collecionName = req.body.colloction_name;
  // 判斷要新增的資料 ... 是否存在
  if (req.body.create_data == undefined) {
    return res.json({
      success:false,
      status:"Error",
      message:"沒有提供要新增的資料內容 ...",
    })
  }
  createone(req,res);  // 新增一筆紀錄
})

// CRUD - R 讀取：根據 query 特定條件讀取資料，回傳 data 是 Array
router.get('/readlist',(req,res)=>{
  if (req.body.db_name == undefined) {
    return res.json({
      success:false,
      status:"Error",
      message:"沒有提供資料庫 ...",
    })
  }
  if (req.body.colloction_name == undefined) {
    return res.json({
      success:false,
      status:"Error",
      message:"沒有提供 colloction ...",
    })
  }
  databaseName = req.body.db_name;
  collecionName = req.body.colloction_name;
  if (req.body.query == undefined){    // 沒有 query 條件，視為 {}
    dataQuery = {};
  }else{
    dataQuery = req.body.query;
  }

  readlist(req,res);  // 讀取多筆紀錄(陣列)

})

router.get('/readone/:id',(req,res)=>{
  // console.log('get,readone id = ' + req.params.id);
  if (req.body.db_name == undefined) {
    return res.json({
      success:false,
      status:"Error",
      message:"沒有提供資料庫 ...",
    })
  }
  if (req.body.colloction_name == undefined) {
    return res.json({
      success:false,
      status:"Error",
      message:"沒有提供 colloction ...",
    })
  }

  databaseName = req.body.db_name;
  collecionName = req.body.colloction_name;
  // 判斷 id 格式是否正確
  try {
    dataQuery = {
      _id : ObjectId(req.params.id)
    };
  }catch(err){
    return res.json({
      success:false,
      status:"Error",
      message:req.params.id + " ->所提供的 id ...格式錯誤"
    })
  }

  readone(req,res);  // 讀取一筆紀錄(陣列)

})

// CRUD - U 修改：修改一筆紀錄
router.put('/updateone/:id',(req,res)=>{
  // console.log('PUT,updateone id = ' + req.params.id);
  if (req.body.db_name == undefined) {
    return res.json({
      success:false,
      status:"Error",
      message:"沒有提供資料庫 ...",
    })
  }
  if (req.body.colloction_name == undefined) {
    return res.json({
      success:false,
      status:"Error",
      message:"沒有提供 colloction ...",
    })
  }

  databaseName = req.body.db_name;
  collecionName = req.body.colloction_name;
  // 判斷 id 格式是否正確
  try {
    dataQuery = {
      _id : ObjectId(req.params.id)
    };
  }catch(err){
    return res.json({
      success:false,
      status:"Error",
      message:req.params.id + " ->所提供的 id ...格式錯誤"
    })
  }

  // 判斷要修正的資料 ... 是否存在
  if (req.body.update_data == undefined) {
    return res.json({
      success:false,
      status:"Error",
      message:"沒有提供要修正的資料內容 ...",
    })
  }

  updateone(req,res);  // 修改一筆紀錄(陣列)
})

// CRUD - D 刪除：刪除一筆紀錄
router.delete('/deleteone/:id',(req,res)=>{
  // console.log('DELETE,deleteone id = ' + req.params.id);
  if (req.body.db_name == undefined) {
    return res.json({
      success:false,
      status:"Error",
      message:"沒有提供資料庫 ...",
    })
  }
  if (req.body.colloction_name == undefined) {
    return res.json({
      success:false,
      status:"Error",
      message:"沒有提供 colloction ...",
    })
  }

  databaseName = req.body.db_name;
  collecionName = req.body.colloction_name;
  // 判斷 id 格式是否正確
  try {
    dataQuery = {
      _id : ObjectId(req.params.id)
    };
  }catch(err){
    return res.json({
      success:false,
      status:"Error",
      message:req.params.id + " ->所提供的 id ...格式錯誤"
    })
  }

  deleteone(req,res);   // 刪除一筆紀錄
})

// ------------ async function -------------------------------------------- //

// 新增一筆紀錄
async function createone(req,res){
  const uri = mongodb_url;
  const client = new MongoClient(uri,{useNewUrlParser: true,useUnifiedTopology: true,connectTimeoutMS: 5000,serverSelectionTimeoutMS: 5000});
  try {
    await client.connect();
    dbo = await client.db(databaseName);                // 指向 Database
    collectObj = await dbo.collection(collecionName);   // 指向 Collection
    var myobj = req.body.create_data;
    let result = await collectObj.insertMany(myobj);
    return res.json ({
      success:true,
      status:"Ok",
      db_name:databaseName,
      colloction_name:collecionName,
      create_data : myobj,
      data:result
    })
  }catch (err){
    console.log('async error ...(update one)');
    console.log(err.message);
  }finally{
    await client.close();
  }
}

// 讀取所需紀錄 (query條件)
// router.get('/readlist',(req,res) 呼叫
async function readlist(req,res) {
  const uri = mongodb_url;
  const client = new MongoClient(uri,{useNewUrlParser: true,useUnifiedTopology: true,connectTimeoutMS: 5000,serverSelectionTimeoutMS: 5000});
  try {
    await client.connect();
    dbo = await client.db(databaseName);                // 指向 Database
    collectObj = await dbo.collection(collecionName);   // 指向 Collection
    // 前端定義 skip
    if (req.body.skip == undefined){
      dataSkip = 0; // 前端沒有定義 skip，預設值 0
    }else{
      dataSkip = parseInt(req.body.skip);
    }
    // 前端定義 limit
    if (req.body.limit == undefined){
      dataLimit = 10; // 前端沒有定義 limit，預設值 10
    }else{
      dataLimit = parseInt(req.body.limit);
    }
    // 顯示記錄筆數 & 取得資料
    dataCount = await collectObj.countDocuments(dataQuery);
    let result = await collectObj.find(dataQuery).skip(dataSkip).limit(dataLimit).toArray();
    return res.json ({
      success:true,
      status:"Ok",
      db_name:databaseName,
      colloction_name:collecionName,
      query:dataQuery,
      skip:dataSkip,
      limit:dataLimit,
      datacount : dataCount,
      data:result
    })

  }catch (err){
    console.log('async error ...');
    console.log(err.message);
  }finally{
    await client.close();
  }
}

async function readone(req,res){
  const uri = mongodb_url;
  const client = new MongoClient(uri,{useNewUrlParser: true,useUnifiedTopology: true,connectTimeoutMS: 5000,serverSelectionTimeoutMS: 5000});
  try {
    await client.connect();
    dbo = await client.db(databaseName);                // 指向 Database
    collectObj = await dbo.collection(collecionName);   // 指向 Collection
    // 顯示記錄筆數 & 取得資料
    dataCount = await collectObj.countDocuments(dataQuery);
    if (dataCount == 0){
      return res.json ({
        success:false,
        status:"Error",
        db_name:databaseName,
        colloction_name:collecionName,
        query:dataQuery,
        datacount : dataCount,
        message:req.params.id + " ->所提供的 id ...資料不存在，無法讀取"
      })
    }else{
      let result = await collectObj.find(dataQuery).toArray();
      return res.json ({
        success:true,
        status:"Ok",
        db_name:databaseName,
        colloction_name:collecionName,
        query:dataQuery,
        datacount : dataCount,
        data:result
      })
    }
  }catch (err){
    console.log('async error ...');
    console.log(err.message);
  }finally{
    await client.close();
  }
}

// 修改一筆紀錄
async function updateone(req,res){
  const uri = mongodb_url;
  const client = new MongoClient(uri,{useNewUrlParser: true,useUnifiedTopology: true,connectTimeoutMS: 5000,serverSelectionTimeoutMS: 5000});
  try {
    await client.connect();
    dbo = await client.db(databaseName);                // 指向 Database
    collectObj = await dbo.collection(collecionName);   // 指向 Collection
    // 顯示記錄筆數 & 取得資料
    dataCount = await collectObj.countDocuments(dataQuery);
    if (dataCount == 0){
      return res.json ({
        success:false,
        status:"Error",
        db_name:databaseName,
        colloction_name:collecionName,
        query:dataQuery,
        datacount : dataCount,
        message:req.params.id + " ->所提供的 id ...資料不存在"
      })
    }else{
      var myobj = req.body.update_data;
      var newvalue = {$set:myobj};
      let result = await collectObj.updateOne(dataQuery,newvalue);
      return res.json ({
        success:true,
        status:"Ok",
        db_name:databaseName,
        colloction_name:collecionName,
        query:dataQuery,
        datacount : dataCount,
        data:result
      })
    }
  }catch (err){
    console.log('async error ...(update one)');
    console.log(err.message);
  }finally{
    await client.close();
  }
}

// 刪除一筆紀錄
async function deleteone(req,res) {
  const uri = mongodb_url;
  const client = new MongoClient(uri,{useNewUrlParser: true,useUnifiedTopology: true,connectTimeoutMS: 5000,serverSelectionTimeoutMS: 5000});
  try {
    await client.connect();
    dbo = await client.db(databaseName);                // 指向 Database
    collectObj = await dbo.collection(collecionName);   // 指向 Collection
    // 顯示記錄筆數 & 取得資料
    dataCount = await collectObj.countDocuments(dataQuery);
    if (dataCount == 0){
      return res.json ({
        success:false,
        status:"Error",
        db_name:databaseName,
        colloction_name:collecionName,
        query:dataQuery,
        datacount : dataCount,
        message:req.params.id + " ->所提供的 id ...資料不存在，無法刪除"
      })
    }else{
      let result = await collectObj.deleteOne(dataQuery);
      return res.json ({
        success:true,
        status:"Ok",
        db_name:databaseName,
        colloction_name:collecionName,
        query:dataQuery,
        datacount : dataCount,
        data:result
      })
    }

  }catch (err){
    console.log('async error ...(delete one)');
    console.log(err.message);
  }finally{
    await client.close();
  }
}

module.exports = router;