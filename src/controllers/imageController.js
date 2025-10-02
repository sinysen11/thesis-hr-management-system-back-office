const ContentImage = require('../models/image');
const { logUserAction } = require('../middlewares/activityLogger');
const path = require('path');
const fs = require('fs');

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

    console.log(image);

    const imagePath = path.resolve(image.path);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ status: 0, message: 'Image file not found' });
    }

    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ status: -1, message: 'Failed to send image' });
        }
      }
    });

    await logUserAction({ req, action: 'get_image_by_id' });
  } catch (error) {
    console.error('Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ status: -1, message: 'Server error', error: error.message });
    }
    await logUserAction({
      req,
      responseMessage: error.message,
      action: 'get_image_by_id',
    });
  }
};