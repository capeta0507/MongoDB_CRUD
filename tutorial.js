const {MongoClient} = require('mongodb');

async function main(){
  const uri = 'mongodb+srv://davidtpe:b2UP0XdnV52UD8ey@mcu-movies-vgmaf.gcp.mongodb.net?retryWrites=true&w=majority';
  const client = new MongoClient(uri,{useNewUrlParser: true,useUnifiedTopology: true,connectTimeoutMS: 5000,serverSelectionTimeoutMS: 5000});
  try {
    await client.connect();
    await listDatabase(client);
  }catch (err){
    console.log('Connect Error ...');
    console.log(err);
    console.log('.....................')
  }finally {
    await client.close();
  }
}

async function listDatabase(client) {
  const databaseList = await client.db().admin().listDatabases();
  console.log('Database LIst : ');
  // console.log(databaseList);
  databaseList.databases.forEach(db =>{
    console.log(` - ${db.name}`);
  })
}

main().catch(console.err);