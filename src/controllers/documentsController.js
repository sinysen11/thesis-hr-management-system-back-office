const Document = require('../models/documents');
const fs = require('fs');
const path = require('path');
const { logUserAction } = require('../middlewares/activityLogger');

exports.uploadDocuments = async (req, res) => {
  try {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    if (req.headers['content-type'] !== 'application/pdf') {
      return res.status(400).json({ status: -1, message: 'Only PDF files are allowed' });
    }

    const filename = Date.now() + '-' + Math.round(Math.random() * 1e9) + '.pdf';
    const filePath = path.join(uploadDir, filename);

    const fileStream = fs.createWriteStream(filePath);
    req.pipe(fileStream);

    fileStream.on('finish', async () => {
      const stats = fs.statSync(filePath);

      const doc = new Document({
        filename,
        originalname: filename,
        path: filePath,
        size: stats.size
      });
      await logUserAction({ req, action: "upload_document",});
      await doc.save();

      res.status(200).json({ status: 1, message: 'PDF uploaded successfully', document: doc });
    });

    fileStream.on('error', (err) => {
      res.status(500).json({ status: -1, message: 'Failed to save PDF', error: err.message });
    });

  } catch (error) {
    await logUserAction({ req, responseMessage: error.message, action: "upload_document",});
    res.status(500).json({ status: -1, message: 'Server error', error: error.message });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const { _id } = req.params;
    const doc = await Document.findById(_id);
    if (!doc) return res.status(404).json({ status: -1, message: 'Document not found' });

    const fs = require('fs');
    if (!fs.existsSync(doc.path)) {
      return res.status(404).json({ status: -1, message: 'PDF file not found on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalname}"`);
    
    const fileStream = fs.createReadStream(doc.path);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      res.status(500).json({ status: -1, message: 'Error reading PDF file', error: err.message });
    });

  } catch (error) {
    res.status(500).json({ status: -1, message: 'Server error', error: error.message });
  }
};
