const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
        tokenNumber: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        age: {
            type: Number,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        priority: {
            type: String,
            enum: [
                "Emergency",
                "Urgent",
                "Normal"
            ],
            default: "Normal"
        },

        status: {
            type: String,
            enum: ["Waiting", "Called", "Completed", "Skipped"],
            default: "Waiting"
        },

        visitDate: {
            type: String
        },

        dayName: {
            type: String
        },

        clinicClosed: {
            type: Boolean,
            default: false
        },

        calledAt: {
            type: Date
        },

        completedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    });

module.exports = mongoose.model("Patient", patientSchema);