const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const Grid = require('gridfs-stream');
const { ObjectID } = require('mongodb');
const path = require('path');

const app = express();
const port = 3001;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const conn = mongoose.connection;
let gfs;

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { originalname, buffer } = req.file;

  if (!gfs) {
    return res.status(500).json({ message: 'GridFS not initialized' });
  }

  const ObjectID = mongoose.Types.ObjectId;

  const writeStream = gfs.createWriteStream({
    filename: originalname,
    metadata: { /* Add additional metadata if needed */ },
    _id: new ObjectID(),
  });

  writeStream.write(buffer);
  writeStream.end();

  writeStream.on('finish', () => {
    res.json({ message: 'File uploaded successfully' });
  });

  writeStream.on('error', (err) => {
    console.error('Error uploading file:', err);
    res.status(500).json({ message: 'Internal server error' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
// ------------------------------------------
// const express = require('express');
// const multer = require('multer');
// const cors = require('cors')
// const app = express();
// const port = 3001;

// app.use(cors()); // Enable CORS for all routes

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Destination folder for uploaded files
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname); // Unique file name
//   },
// });

// const upload = multer({ storage });

// app.post('/upload', upload.single('file'), (req, res) => {
//   res.json({ message: 'File uploaded successfully' });
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });