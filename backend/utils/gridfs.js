// const mongoose = require('mongoose');
// const Grid = require('gridfs-stream');  // Add this: Imports the Grid constructor

// let gfs, gridfsBucket;

// mongoose.connection.once("open", () => {
//   // Create the GridFS bucket
//   gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
//     bucketName: "pdfs"
//   });

//   // Initialize gridfs-stream
//   gfs = Grid(mongoose.connection.db, mongoose.mongo);

//   // Set the root collection to the metadata files (required for proper streaming)
//   gfs.collection("pdfs.files");
// });

// module.exports = { gfs, gridfsBucket };