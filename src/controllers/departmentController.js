const Department = require('../models/departments');
const { logUserAction } = require('../middlewares/activityLogger');

// Create a new department
exports.createDepartment = async (req, res) => {
  try {
    const department = new Department(req.body);
    const data = await department.save();
    await logUserAction({ req, action: "create_department",});
    res.status(201).json({status: 1, message: "Successfully", data});
  } catch (err) {
    await logUserAction({ req, responseMessage: err.message, action: "create_department",});
    res.status(400).json({status: 0,  error: err.message });
  }
};

// Get all
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json({
      departments,
      status: 1,
      message: 'get Department successfully'
    });
  } catch (err) {
    res.status(500).json({status: 0, message: err.message });
  }
};

// Get by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ error: 'Not found' });
    res.json({status: 1, message: "Successfully", department});
  } catch (err) {
    res.status(500).json({status: 1, error: err.message });
  }
};

// Update
exports.updateDepartment = async (req, res) => {
  try {
    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!updated) return res.status(404).json({status: -1,  error: 'Department not found' });
    res.json({status: 1, message: "Successfully", updated});
  } catch (err) {
    res.status(400).json({status: 0, error: err.message });
  }
};

// Delete
exports.deleteDepartment = async (req, res) => {
  try {
    const deleted = await Department.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({status: -1, error: 'Department not found' });
    res.json({status: 1,  message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({status: 0, error: err.message });
  }
};
