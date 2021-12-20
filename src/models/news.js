const mongoose = require("mongoose");
const validator = require("validator");

const newsSchema = mongoose.Schema(
    {
        title:
        {
            type: String,
            required: true,
            unique: true
        },
        description:
        {
            type: String,
            required: true
        },
        date:
        {
            type: String,
            required: true,
            validate(value)
            {
                const dateRegex = /^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[\/\-]\d{4}$/;
                if(!dateRegex.test(value))
                {
                    throw new Error("invalid date input");
                }
            }
        },
        reporter:
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Reporter"
        },
        avatar:
        {
            type: Buffer
        }
    }
)

const News = mongoose.model("News" , newsSchema);

module.exports = News