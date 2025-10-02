const ContentImage = require('../models/image');
const { logUserAction } = require('../middlewares/activityLogger');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

exports.uploadImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ status: -1, message: 'No image uploaded' });

    const imageDoc = new ContentImage({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size
    });
    await imageDoc.save();
    await logUserAction({ req, action: "upload_image" });

    res.status(200).json({ status: 1, message: 'Image uploaded successfully', data: imageDoc });
  } catch (error) {
    await logUserAction({ req, responseMessage: error.message, action: "upload_image" });
    res.status(500).json({ status: -1, message: 'Server error', error: error.message });
  }
};

exports.getImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await ContentImage.findById(id);

    if (!image) {
      return res.status(404).json({ status: 0, message: 'Image not found' });
    }
       console.log(image)
    const imagePath = path.resolve(image.path);
 
    // Check if image file exists before piping
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ status: 0, message: 'Image file not found' });
    }

    // Set headers BEFORE creating PDF
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${image.originalname}.pdf`
    );
    res.setHeader('Content-Type', 'application/pdf');

    const doc = new PDFDocument({ autoFirstPage: false });

    // Handle stream errors
    doc.on('error', (err) => {
      console.error('PDF Stream Error:', err);
      if (!res.headersSent) {
        res.status(500).json({ status: -1, message: 'PDF generation error' });
      }
    });

    doc.pipe(res);

    // Add image page
    doc.addPage({ size: 'A4', margin: 50 });
    doc.image(imagePath, { fit: [500, 700], align: 'center', valign: 'center' });

    doc.end(); // End stream after adding all content

    await logUserAction({ req, action: 'get_image_by_id_as_pdf' });
  } catch (error) {
    console.error('Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ status: -1, message: 'Server error', error: error.message });
    }
    await logUserAction({
      req,
      responseMessage: error.message,
      action: 'get_image_by_id_as_pdf',
    });
  }
};