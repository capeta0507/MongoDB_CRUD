// Mongodb Altas Movies 連線 要有 { useNewUrlParser: true } 選項 
var mongodb_url = 'mongodb+srv://davidtpe:b2UP0XdnV52UD8ey@mcu-movies-vgmaf.gcp.mongodb.net/Marvel_db?retryWrites=true&w=majority';
var databaseName = "Marvel_db";  // DB
var collecionName = 'Movies';    // Collection
module.exports = {
  mongodb_url,
  databaseName,
  collecionName
}