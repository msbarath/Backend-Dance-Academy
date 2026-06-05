const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Attendance = require("../Models/AttendanceModel");
const Student = require("../Models/StudentModel");

const getAttendance = async (req, res) => {
    try {
        const filter = {};
        if (req.query.date) filter.date = req.query.date;
        const records = await Attendance.find(filter).sort({ date: -1, createdAt: -1 });
        res.json({ data: records });
    } catch (err) {
        console.error("getAttendance:", err);
        res.status(500).json({ message: "Error fetching attendance" });
    }
};

const markAttendance = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { studentId, date, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(studentId)) return res.status(400).json({ message: "Invalid student ID" });
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: "Student not found" });

        const existing = await Attendance.findOne({ student: studentId, date });
        if (existing) return res.status(409).json({ message: "Attendance already marked for this student on this date." });

        const record = await Attendance.create({
            student:     studentId,
            studentName: student.name,
            course:      student.course,
            date,
            status: status || "Present",
        });
        res.status(201).json({ message: "Attendance marked", data: record });
    } catch (err) {
        console.error("markAttendance:", err);
        res.status(500).json({ message: "Error marking attendance" });
    }
};

const updateAttendance = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const { status } = req.body;
        if (!["Present", "Absent"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const record = await Attendance.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!record) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "Attendance updated", data: record });
    } catch (err) {
        console.error("updateAttendance:", err);
        res.status(500).json({ message: "Error updating attendance" });
    }
};

const deleteAttendance = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const record = await Attendance.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "Attendance deleted" });
    } catch (err) {
        console.error("deleteAttendance:", err);
        res.status(500).json({ message: "Error deleting attendance" });
    }
};

module.exports = { getAttendance, markAttendance, updateAttendance, deleteAttendance };
