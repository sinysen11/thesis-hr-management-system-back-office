const ContentImage = require('../models/image');
const { logUserAction } = require('../middlewares/activityLogger');

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