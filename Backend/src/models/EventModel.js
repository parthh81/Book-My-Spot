const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelSchema = new Schema(
    {
        name: {
            type: String,
            required: false,
            unique: true
        },
        cityId: {
            type: Schema.Types.ObjectId,
            ref: "City",
        },
        stateId: {
            type: Schema.Types.ObjectId,
            ref: "State",
        },
        areaId: {
            type: Schema.Types.ObjectId,
            ref: "Area",
        },
        imageUrl: {
           type: String,
           required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('EventModel', modelSchema);
