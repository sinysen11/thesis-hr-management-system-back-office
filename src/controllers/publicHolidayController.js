const PublicHoliday = require('../models/publicHoliday');

exports.createPublicHoliday = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    const holiday = new PublicHoliday({ name, startDate, endDate: endDate || startDate });
    await holiday.save();
    res.status(201).json({ status: 1, data: holiday });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};

exports.getPublicHolidays = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const holidays = await PublicHoliday.find({
      startDate: {
        $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
        $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
      }
    }).sort({ startDate: 1 });

    res.json({ status: 1, data: holidays });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};


exports.getPublicHolidayById = async (req, res) => {
  try {
    const holiday = await PublicHoliday.findById(req.params.id);
    if (!holiday) return res.status(404).json({ status: 0, message: 'Holiday not found' });
    res.json({ status: 1, message: 'successfully', data: holiday });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};

exports.updatePublicHoliday = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    const holiday = await PublicHoliday.findByIdAndUpdate(
      req.params.id,
      { name, startDate, endDate: endDate || startDate },
      { new: true }
    );
    if (!holiday) return res.status(404).json({ status: 0, message: 'Holiday not found' });
    res.json({ status: 1, data: holiday });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};

exports.deletePublicHoliday = async (req, res) => {
  try {
    const holiday = await PublicHoliday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ status: 0, message: 'Holiday not found' });
    res.json({ status: 1, message: 'Holiday deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 0, message: error.message });
  }
};

exports.getHolidayDates = async (req, res) => {
  try {
    const holidays = await PublicHoliday.find({}, { _id: 0, startDate: 1, endDate: 1 }).lean();

    const dates = [];
    holidays.forEach(h => {
      const start = new Date(h.startDate);
      const end = new Date(h.endDate || h.startDate);
      let d = new Date(start);

      while (d <= end) {
        dates.push(d.toISOString().slice(0, 10));
        d.setDate(d.getDate() + 1);
      }
    });

    res.json({status: 1, message: 'successfully', dates});
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
};