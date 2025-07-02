const Department = require('../models/departments');

// Create a new department
exports.createDepartment = async (req, res) => {
    try {
        const department = new Department(req.body);
        const saved = await department.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.json(departments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get by ID
exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) return res.status(404).json({ error: 'Not found' });
        res.json(department);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update
exports.updateDepartment = async (req, res) => {
    try {
        const updated = await Department.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updated) return res.status(404).json({ error: 'Not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete
exports.deleteDepartment = async (req, res) => {
    try {
        const deleted = await Department.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Department deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
