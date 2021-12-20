var mongoose = require("mongoose");
var validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//const { report } = require("../routes/reporters");

const reporterShcema = mongoose.Schema(
    {
        name:
        {
            type: String,
            required: true,
            trim: true
        },
        email:
        {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value)
            {
                if(!validator.isEmail(value))
                {
                    throw new Error("email is invalid");
                }
            }
        },
        age:
        {
            type: Number,
            required: true,
            validate(value)
            {
                if(value < 0)
                {
                    throw new Error("age must be positive");
                }
            }
        },
        phoneNumber:
        {
            type: String,
            required: true,
            unique: true,
            validate(value)
            {
                var phoneRegex = /^01[0125][0-9]{8}$/;
                if(!phoneRegex.test(value))
                {
                    throw new Error("invalid phone number");
                }
            }
        },
        password:
        {
            type: String,
            required: true,
            trim: true,
            minlength: 6
        },
        tokens:
        [
            {
                type: String,
                required: true
            }
        ],
        avatar:
        {
            type: Buffer
        }
    }
)

reporterShcema.pre("save" , async function(next)
{

    const reporter = this;
    if(reporter.isModified("password"))
    {
        reporter.password = await bcrypt.hash(reporter.password , 8);
    }
    next();
})

reporterShcema.statics.findByCredentials = async function(email , password)
{
    const reporter = await Reporter.findOne({email});

    if(!reporter)
    {
        throw new Error("couldn't login... check email or password");
    }

    const isFoundPassword = await bcrypt.compare(password , reporter.password);
    
    if(!isFoundPassword)
    {
        throw new Error("couldn't login... check email or password");
    }

    return reporter;
}

reporterShcema.methods.generateToken = async function()
{
    const reporter = this;

    const token = jwt.sign({_id: reporter._id.toString()} , "nodecourse");
    
    reporter.tokens = reporter.tokens.concat(token);

    await reporter.save();

    return token;
}

reporterShcema.methods.toJSON = function()
{
    const reporter = this;
    const reporterObject = reporter.toObject();

    delete reporterObject.password;
    delete reporterObject.tokens;

    return reporterObject;
}

reporterShcema.virtual("news" ,
{
    ref: "News",
    localField: "_id",
    foreignField: "reporter"
})

const Reporter = mongoose.model("Reporter" , reporterShcema);

module.exports = Reporter;