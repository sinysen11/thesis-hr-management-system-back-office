const Position = require('../models/positions');
const { logUserAction } = require('../middlewares/activityLogger');

exports.createPosition = async (req, res) => {
  try {
    const position = new Position(req.body);
    const data = await position.save();
    await logUserAction({
      req,
      action: "create_position",
      description: `Position created: ${data.title}`
    });

    await logUserAction({ req, action: "create_position",});
    res.status(201).json({ status: 1, message: "Create Successfully", data });
  } catch (error) {
    await logUserAction({ req, responseMessage: error.message, action: "create_position",});
    res.status(400).json({ status: 0, message: error.message });
  }
};

exports.getPositions = async (req, res) => {
  try {
    const positions = await Position.find()
      .populate('department');
    res.json({ positions, status: 1, message: 'get position successfully' });
  } catch (err) {
    res.status(500).json({ status: 0, message: err.message });
  }
};

exports.getPositionById = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id)
      .populate('department')
    if (!position)
      return res.status(404).json({ status: -1, message: 'Position not found' });
    res.json({ status: 1, message: "Successfully", position });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};

exports.updatePosition = async (req, res) => {
  try {
    const data = await Position.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!data)
    return res.status(404).json({ status: -1, message: 'Position not found' });
    await logUserAction({ req, action: "update_position",});
    res.json({ status: 1, message: "Position updated successfully", data });
  } catch (error) {
    await logUserAction({ req, responseMessage: error.message, action: "update_position",});
    res.status(400).json({ status: 0, message: error.message });
  }
};

exports.deletePosition = async (req, res) => {
  try {
    const deletedPosition = await Position.findByIdAndDelete(req.params.id);
    if (!deletedPosition)
    return res.status(404).json({ status: -1, message: 'Position not found' });
    await logUserAction({ req, action: "delete_position",});
    res.json({ status: 1, message: 'Position deleted successfully' });
  } catch (error) {
    await logUserAction({ req, responseMessage: error.message, action: "delete_position",});
    res.status(500).json({ status: 0, message: error.message });
  }
};