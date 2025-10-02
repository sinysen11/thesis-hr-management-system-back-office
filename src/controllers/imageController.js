const ContentImage = require('../models/image');
const { logUserAction } = require('../middlewares/activityLogger');

exports.uploadImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ status: -1, message: 'No image uploaded' });

    const imageDoc = new ContentImage({
      data: file.buffer,
      contentType: file.mimetype
    });
    await imageDoc.save();
    await logUserAction({ req, action: "upload_image" });

    res.status(200).json({
      status: 1,
      message: 'Image uploaded successfully',
      id: imageDoc._id
    });
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

    res.set('Content-Type', image.contentType);
    res.send(image.data);

    await logUserAction({ req, action: 'get_image_by_id' });
  } catch (error) {
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