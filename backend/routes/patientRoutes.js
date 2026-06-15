const express = require("express");
const Patient = require("../models/Patient");
const Queue = require("../models/Queue");

const router = express.Router();

const today = new Date();

const visitDate = today.toLocaleDateString("en-IN");

const ClinicSession =
require("../models/ClinicSession");

const dayName = today.toLocaleDateString(
    "en-US",
    { weekday: "long" }
);

router.post("/add", async (req, res) => {

    try {

        const count = await Patient.countDocuments();

        const patient = new Patient({
            tokenNumber: `T${count + 1}`,
            name: req.body.name,
            age: req.body.age,
            phone: req.body.phone,
            priority: req.body.priority,

            visitDate,
            dayName
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

router.post("/call-next", async (req, res) => {
    try {

        const nextPatient = await Patient.findOne({
            status: "Waiting"
        }).sort({ createdAt: 1 });

        if (!nextPatient) {
            return res.status(404).json({
                message: "No patients waiting"
            });
        }

        nextPatient.status = "Called";

        await nextPatient.save();

        let queue = await Queue.findOne();

        if (!queue) {
            queue = new Queue();
        }

        queue.currentToken = nextPatient.tokenNumber;

        await queue.save();

        res.json({
            currentToken: queue.currentToken,
            patient: nextPatient
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.get("/current-token", async (req, res) => {

    try {

        const queue = await Queue.findOne();

        res.json(queue);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

router.post("/end-clinic",
async (req, res) => {

  try {

    const today =
    new Date().toLocaleDateString("en-IN");

    let session =
    await ClinicSession.findOne({
      visitDate: today
    });

    if (!session) {

      session =
      new ClinicSession({

        visitDate: today,

        dayName:
        new Date().toLocaleDateString(
          "en-US",
          { weekday: "long" }
        ),

        status: "CLOSED"
      });

    }

    session.status = "CLOSED";

    await session.save();

    res.json({
      message:
      "Clinic closed successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

router.get("/history",
async (req, res) => {

  try {

    const history =
    await Patient.find()
      .sort({
        createdAt: -1
      });

    res.json(history);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

module.exports = router;