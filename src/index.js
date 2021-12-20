const express = require("express");

//const multer = require("multer");



require("./db/mongoose");

const reporterRoute = require("./routes/reporters");
const newsRoute = require("./routes/news");

const app = express();
const port = process.env.PORT || 3000;




app.use(express.json());

app.use(reporterRoute);

app.use(newsRoute);


/*
const uploads = multer(
    {
        dest: "images",
        limits:
        {
            // 1mg = 1000000 byte 
            fileSize: 1000000
        },
        fileFilter(req , file , cb)
        {
            if(!file.originalname.endsWith(".pdf"))
            {
                cb(new Error("only pdf files are allowed"));
            }
            cb(null , true);
        }
    }
)


app.post("/uploads" , uploads.single("avatar") , function(req , res)
{
    res.send("File uploaded successfully");
})
*/

app.listen(port , function()
{
    console.log("listening on port " + port);
})