const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Course = require("../Models/CourseModel");

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json({ data: courses });
    } catch (err) {
        console.error("getCourses:", err);
        res.status(500).json({ message: "Error fetching courses" });
    }
};

const createCourse = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { name, instructor, schedule, fee } = req.body;
        const course = await Course.create({ name, instructor, schedule, fee: Number(fee) });
        res.status(201).json({ message: "Course created", data: course });
    } catch (err) {
        console.error("createCourse:", err);
        res.status(500).json({ message: "Error creating course" });
    }
};

const updateCourse = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const { name, instructor, schedule, fee } = req.body;
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { name, instructor, schedule, fee: Number(fee) },
            { new: true, runValidators: true }
        );
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.json({ message: "Course updated", data: course });
    } catch (err) {
        console.error("updateCourse:", err);
        res.status(500).json({ message: "Error updating course" });
    }
};

const deleteCourse = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.json({ message: "Course deleted" });
    } catch (err) {
        console.error("deleteCourse:", err);
        res.status(500).json({ message: "Error deleting course" });
    }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse };
