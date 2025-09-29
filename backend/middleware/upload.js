const multer = require("multer");

const storage = multer.memoryStorage(); // temporary memory storage
const upload = multer({ storage });

module.exports = upload;
