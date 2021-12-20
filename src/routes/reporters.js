const Reporter = require("../models/reporters");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const multer = require("multer");


router.post("/reporters" , async function(req , res)
{
    try
    {
        const reporter = new Reporter(req.body);
        const token = await reporter.generateToken();
        res.status(200).send({reporter , token});
    }
    catch(error)
    {
        res.status(400).send(error.message);
    }
})

router.get("/reporters" , auth , async function(req , res)
{
    try
    {
        const reporter = await Reporter.find({});
        if(!reporter)
        {
            return res.status(404).send("reporter not found");
        }
        res.status(200).send(reporter);
    }
    catch(error)
    {
        res.status(500).send(error.message);
    }
})

router.get("/reporters/:id" , auth , async function(req , res)
{
    try
    {
        const id = req.params.id;
        const reporter = await Reporter.findById(id);
        if(!reporter)
        {
            return res.status(404).send("reporter not found");
        }
        res.status(200).send(reporter);
    }
    catch(error)
    {
        res.status(500).send(error.message);
    }
})

router.patch("/reporters/:id" , auth , async function(req , res)
{
    const reporterKeys = Object.keys(req.body);
    
    if(reporterKeys.indexOf("email") != -1 || reporterKeys.indexOf("password") != -1)
    {
        res.status(400).send("can't update email or password");
    }


    try
    {
        const id = req.params.id;
        const reporter = await Reporter.findById(id);
        if(!reporter)
        {
            return res.status(404).send("this reporter does not exist");
        }

        for(var i = 0; i < reporterKeys.length; i++)
        {
            reporter[reporterKeys[i]] = req.body[reporterKeys[i]];
        }

        await reporter.save();
        res.status(200).send(reporter);
    }
    catch(error)
    {
        res.status(500).send(error.message);
    }
})

router.delete("/reporters/:id" , auth , async function(req , res)
{
    try
    {
        const id = req.params.id;
        const reporter = await Reporter.findOneAndDelete({_id: id});
        if(!reporter)
        {
            return res.status(404).send("this user does not exist");
        }
        //Reporter.deleteOne({_id: id})
        res.status(200).send(reporter);
    }
    catch(error)
    {
        res.status(500).send(error.message);
    }
})

router.post("/login" , async function(req , res)
{
    try
    {
        const reporter = await Reporter.findByCredentials(req.body.email , req.body.password);
        const token = await reporter.generateToken();
        res.status(200).send({reporter , token});
    }
    catch(error)
    {
        res.status(500).send(error.message);
    }
})

router.get("/profile" , auth , async function(req , res)
{
    res.status(200).send(req.reporter);
})

router.get("/profile" , auth , async function(req , res)
{
    res.status(200).send(req.reporter);
})

router.delete("/logout" , auth , async function(req , res)
{
    try
    {
        const allTokens = req.reporter.tokens;

        for(var i = 0; i < allTokens.length; i++)
        {
            if(allTokens[i] == req.token)
            {
                req.reporter.tokens.splice(i , 1);
                break;
            }
        }

        await req.reporter.save();

        res.status(200).send("logged out successfully");
    }
    catch(error)
    {
        res.status(500).send(error.message);
    }
})

router.delete("/logoutall" , auth , async function(req , res)
{
    try
    {
        req.reporter.tokens = [];
        await req.reporter.save();
        //console.log("length = " + req.reporter.tokens.length)
    }
    catch(error)
    {
        res.status(500).send(error.message);
    }
})

const uploads = multer(
    {
        limits:
        {
            fileSize: 1000000
        },
        fileFilter(req , file , cb)
        {
            if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/))
            {
                cb(new Error("please upload an image"));
            }
            cb(null , true);
        }
    }
)

router.post("/profile/avatar" , auth , uploads.single("avatar") , async function(req , res)
{
    try
    {
        req.reporter.avatar = req.file.buffer;
        await req.reporter.save();
        res.status(200).send();
    }
    catch(e)
    {
        res.status(400).send(e.message);
    }
})

module.exports = router