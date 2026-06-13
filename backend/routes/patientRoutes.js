const express = require("express");
const Patient = require("../models/Patient");

const router = express.Router();

router.post("/add", async (req, res) => {

    try {

        const count = await Patient.countDocuments();

        const patient = new Patient({
            tokenNumber: `T${count + 1}`,
            name: req.body.name,
            age: req.body.age,
            phone: req.body.phone,
            priority: req.body.priority
        });

        await patient.save();

        res.status(201).json(patient);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});

router.get("/", async (req, res) => {

    try {

        const patients = await Patient.find();

        res.json(patients);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});

module.exports = router;