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

        const today = new Date();

        const visitDate =
            today.toLocaleDateString("en-IN");

        const dayName =
            today.toLocaleDateString(
                "en-US",
                { weekday: "long" }
            );

        const count =
            await Patient.countDocuments({
                visitDate: visitDate
            });

        const age = parseInt(req.body.age);
        if (isNaN(age) || age < 0) {
            return res.status(400).json({
                message: "Age cannot be negative"
            });
        }

        const phone = req.body.phone ? String(req.body.phone).trim() : "";
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({
                message: "Mobile number must be exactly 10 digits"
            });
        }

        const patient =
            new Patient({

                tokenNumber:
                    `T${count + 1}`,

                name:
                    req.body.name,

                age:
                    age,

                phone:
                    phone,

                priority:
                    req.body.priority,

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

        const today =
            new Date().toLocaleDateString(
                "en-IN"
            );

        const patients =
            await Patient.find({
                visitDate: today
            }).sort({
                createdAt: 1
            });

        res.json(patients);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

router.post("/call-next", async (req, res) => {

    try {

        const today =
            new Date().toLocaleDateString(
                "en-IN"
            );

        let nextPatient =
            await Patient.findOne({
                visitDate: today,
                status: "Waiting",
                priority: "Emergency"
            }).sort({
                createdAt: 1
            });

        if (!nextPatient) {

            nextPatient =
                await Patient.findOne({
                    visitDate: today,
                    status: "Waiting",
                    priority: "Urgent"
                }).sort({
                    createdAt: 1
                });

        }

        if (!nextPatient) {

            nextPatient =
                await Patient.findOne({
                    visitDate: today,
                    status: "Waiting",
                    priority: "Normal"
                }).sort({
                    createdAt: 1
                });

        }

        if (!nextPatient) {

            return res.status(404).json({
                message:
                    "No patients waiting"
            });

        }

        nextPatient.status =
            "Called";
        nextPatient.calledAt = new Date();

        await nextPatient.save();

        let queue =
            await Queue.findOne();

        if (!queue) {

            queue =
                new Queue();

        }

        queue.currentToken =
            nextPatient.tokenNumber;

        await queue.save();

        const io = req.app.get("io");

        console.log(
            "EMITTING TOKEN:",
            queue.currentToken
        );

        io.emit(
            "tokenUpdated",
            {
                currentToken:
                    queue.currentToken
            }
        );

        res.json({

            currentToken:
                queue.currentToken,

            patient:
                nextPatient

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message:
                error.message
        });

    }

});

router.get("/current-token", async (req, res) => {

    try {

        const today =
            new Date().toLocaleDateString("en-IN");

        const currentPatient = await Patient.findOne({
            visitDate: today,
            status: { $in: ["Called", "Completed"] }
        }).sort({ calledAt: -1 });

        if (currentPatient) {
            return res.json({
                currentToken: currentPatient.tokenNumber
            });
        }

        res.json({
            currentToken: ""
        });

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

            await Patient.updateMany(
                {
                    visitDate: today
                },
                {
                    clinicClosed: true
                }
            );

            const queue = await Queue.findOne();

            if (queue) {

                queue.currentToken = "";

                await queue.save();

            }

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


router.put("/complete/:id", async (req, res) => {

    try {

        const patient =
            await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        patient.status = "Completed";
        patient.completedAt = new Date();

        await patient.save();

        res.json(patient);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

router.get("/patients-ahead", async (req, res) => {

    try {
        const todayStr = new Date().toLocaleDateString("en-IN");

        const count = await Patient.countDocuments({
            visitDate: todayStr,
            status: "Waiting"
        });

        const completedPatients = await Patient.find({
            visitDate: todayStr,
            status: "Completed",
            calledAt: { $exists: true },
            completedAt: { $exists: true }
        });

        let dynamicAvgTime = null;
        if (completedPatients.length > 0) {
            const totalDuration = completedPatients.reduce((sum, p) => {
                const diffMs = p.completedAt - p.calledAt;
                return sum + (diffMs / 60000); // convert to minutes
            }, 0);
            dynamicAvgTime = Math.round((totalDuration / completedPatients.length) * 10) / 10;
        }

        res.json({
            patientsAhead: count,
            dynamicAvgTime: dynamicAvgTime
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


router.get("/analytics", async (req, res) => {

    try {

        const totalPatients =
            await Patient.countDocuments();

        const waiting =
            await Patient.countDocuments({
                status: "Waiting"
            });

        const called =
            await Patient.countDocuments({
                status: "Called"
            });

        const completed =
            await Patient.countDocuments({
                status: "Completed"
            });

        const skipped =
            await Patient.countDocuments({
                status: "Skipped"
            });

        const emergency =
            await Patient.countDocuments({
                priority: "Emergency"
            });

        const urgent =
            await Patient.countDocuments({
                priority: "Urgent"
            });

        const normal =
            await Patient.countDocuments({
                priority: "Normal"
            });

        res.json({

            totalPatients,

            waiting,

            called,

            completed,

            skipped,

            emergency,

            urgent,

            normal

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

router.put("/skip/:id", async (req, res) => {

    try {

        const patient =
            await Patient.findById(
                req.params.id
            );

        if (!patient) {

            return res.status(404).json({
                message:
                    "Patient not found"
            });

        }

        patient.status =
            "Skipped";

        await patient.save();

        res.json(patient);

    } catch (error) {

        res.status(500).json({
            message:
                error.message
        });

    }

});

router.get("/history", async (req, res) => {

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

router.put("/recall/:id", async (req, res) => {

    try {

        const patient =
            await Patient.findById(
                req.params.id
            );

        if (!patient) {

            return res.status(404).json({
                message:
                    "Patient not found"
            });

        }

        patient.status =
            "Waiting";

        await patient.save();

        res.json(patient);

    } catch (error) {

        res.status(500).json({
            message:
                error.message
        });

    }

});

router.get("/session-status", async (req, res) => {
    try {
        const today = new Date().toLocaleDateString("en-IN");
        const session = await ClinicSession.findOne({ visitDate: today });
        res.json({
            status: session ? session.status : "OPEN"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.post("/open-clinic", async (req, res) => {
    try {
        const today = new Date().toLocaleDateString("en-IN");
        let session = await ClinicSession.findOne({ visitDate: today });
        if (!session) {
            session = new ClinicSession({
                visitDate: today,
                dayName: new Date().toLocaleDateString("en-US", { weekday: "long" }),
                status: "OPEN"
            });
        } else {
            session.status = "OPEN";
        }
        await session.save();

        await Patient.updateMany(
            { visitDate: today },
            { clinicClosed: false }
        );

        res.json({ message: "Clinic session opened successfully", status: "OPEN" });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.delete("/reset-today", async (req, res) => {
    try {
        const today = new Date().toLocaleDateString("en-IN");
        await Patient.deleteMany({ visitDate: today });
        const queue = await Queue.findOne();
        if (queue) {
            queue.currentToken = "";
            await queue.save();
        }

        const io = req.app.get("io");
        io.emit("tokenUpdated", { currentToken: "" });

        res.json({ message: "Today's clinic data has been reset successfully." });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;