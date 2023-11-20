const express = require('express');
const multer = require('multer');
const cors = require('cors')
const app = express();
const port = 3001;

app.use(cors()); // Enable CORS for all routes

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique file name
  },
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ message: 'File uploaded successfully' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});