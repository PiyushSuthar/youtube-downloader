const express = require("express")
const ytdl = require("ytdl-core")
const app = express()
const PORT = process.env.PORT || 3000

const defaultResponse = {
    "mp3": {
        "path": "/mp3",
        "options": ["url"],
        "example": "/mp3?url=https://www.youtube.com/watch?v=X5uQxM_OoXY"
    },
    "mp4": {
        "path": "/mp4",
        "options": ["url", "quality"],
        "example": "/mp4?url=https://www.youtube.com/watch?v=X5uQxM_OoXY&quality=18",
        "quality": {
            "info": "Quality can be an iTag or highest and lowest",
            "available": [18, 137, 248, 136, 247, 135, 134, 140, "highest", "lowest"]
        }
    }
}

app.get("/", (req, res) => {
    res.json(defaultResponse)
})

app.get("/mp4", async (req, res) => {
    if (req.query.url === undefined) {
        res.json(defaultResponse.mp4)
        return;
    }
    if (isYoutube(req.query.url)) {
        try {
            var title = "video"
            let url = req.query.url
            await ytdl.getBasicInfo(url, {
                format: 'mp4'
            }, (err, info) => {
                title = info.player_response.videoDetails.title.replace(/[^\x00-\x7F]/g, "");
            });

            res.header('Content-Disposition', `attachment; filename="video.mp4"`);
            res.setHeader('Content-type', 'video/mp4');
            ytdl(url, {
                format: "mp4",
                quality: req.query.quality ? req.query.quality : "highest"
            }).pipe(res)

        } catch (err) {
            console.error(err)
        }
    } else {
        res.send("Link Not Allowed")
    }
})

app.get("/mp3", async (req, res) => {
    if (req.query.url === undefined) {
        res.json(defaultResponse.mp3)
        return;
    }
    if (isYoutube(req.query.url)) {
        try {
            var title = "audio"
            let url = req.query.url

            await ytdl.getBasicInfo(url, {
                format: 'mp4'
            }, (err, info) => {
                title = info.player_response.videoDetails.title.replace(/[^\x00-\x7F]/g, "");
            });

            res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
            res.setHeader('Content-type', 'audio/mpeg');
            ytdl(url, {
                format: "mp3",
                filter: 'audioonly'
            }).pipe(res)

        } catch (err) {
            console.error(err)

        }
    } else {
        res.send("Link Not Allowed")
    }
})



function isYoutube(url) {
    if (url.includes("youtube.com/watch?v=")) {
        return true;
    } else if (url.includes("youtu.be")) {
        return true;
    } else {
        return false;
    }
}

app.listen(PORT, () => console.log(`server at ${PORT}`))