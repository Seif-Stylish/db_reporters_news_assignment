const News = require("../models/news");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const multer = require("multer");



router.post("/news" , auth , async function(req , res)
{
    try
    {
        const news = new News({...req.body , reporter: req.reporter._id});
        await news.save();
        res.status(201).send(news)
    }
    catch(error)
    {
        res.status(500).send(error.message);
    }
})

/*router.get("/news" , async function(req , res)
{
    try
    {
        const news = await News.find({});
        if(!news)
        {
            return res.status(404).send("no news found");
        }
        res.status(200).send(news);
    }
    catch(error)
    {
        res.status(500).send(error.message);
    }
})*/



router.get("/news" , auth , async function(req , res)
{
    try
    {
        await req.reporter.populate("news");
        res.send(req.reporter.news);
    }
    catch(error)
    {
        res.status(500).send(error.message);
    }
})



router.get("/news/:id" , auth , async function(req , res)
{
    try
    {
        const _id = req.params.id;
        const news = await News.findOne({_id , reporter: req.reporter._id});
        if(!news)
        {
            return res.status(404).send("task not found");
        }
        res.status(200).send(news);
    }
    catch(error)
    {
        res.status(500).send(error.message);
    }
})

router.patch("/news/:id" , auth , async function(req , res)
{
    const newsKeys = Object.keys(req.body);
    if(newsKeys.indexOf("title") != -1)
    {
        return res.status(400).send("cannot update the title");
    }

    try
    {
        const _id = req.params.id;
        const news = await News.findOne({_id , reporter: req.reporter._id});
        if(!news)
        {
            return res.status(404).send("news not found");
        }
        for(var i = 0; i < newsKeys.length; i++)
        {
            news[newsKeys[i]] = req.body[newsKeys[i]];
        }
        await news.save();
        res.status(200).send(news);
    }
    catch(error)
    {
        res.status(500).send(error.message);
    }
})

router.delete("/news/:id" , auth , async function(req , res)
{
    try
    {
        const _id = req.params.id;
        const news = await News.findOneAndDelete({_id , reporter: req.reporter._id});
        if(!news)
        {
            return res.status(404).send("news not found");
        }
        res.status(200).send(news);
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

router.post("/profile/avatar/news/:id" , auth , uploads.single("avatar") , async function(req , res)
{
    try
    {
        const _id = req.params.id
        const news = News.findOne({_id , reporter: req.reporter._id});
        news.avatar = req.file.buffer;
        await news.save();
        res.status(200).send();
    }
    catch(e)
    {
        res.status(400).send(e.message);
    }
})











module.exports = router