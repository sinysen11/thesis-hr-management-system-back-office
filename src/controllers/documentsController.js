const Document = require('../models/documents');
const { logUserAction } = require('../middlewares/activityLogger');

exports.uploadDocuments = async (req, res) => {
  try {
    if (!req.headers['content-type'] || req.headers['content-type'] !== 'application/pdf') {
      return res.status(400).json({ status: -1, message: 'Only PDF files are allowed' });
    }

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));

    req.on('end', async () => {
      const fileBuffer = Buffer.concat(chunks);
      const filename = Date.now() + '-' + Math.round(Math.random() * 1e9) + '.pdf';

      const doc = new Document({
        filename,
        originalname: filename,
        data: fileBuffer,  // <--- save the actual PDF here
        size: fileBuffer.length
      });

      await doc.save();

      res.status(200).json({ status: 1, message: 'PDF stored successfully', document: doc });
    });
  } catch (error) {
    res.status(500).json({ status: -1, message: error.message });
  }
};


exports.getDocumentById = async (req, res) => {
  try {
    const { _id } = req.params;
    const doc = await Document.findById(_id);

    if (!doc) return res.status(404).json({ status: -1, message: 'Document not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalname}"`);
    res.send(doc.data); 
  } catch (error) {
    res.status(500).json({ status: -1, message: error.message });
  }
};
