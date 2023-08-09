const express = require("express");
const app = express();
const http = require("http");
const port = 4080;
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const tf = require("@tensorflow/tfjs-node");
var model;
async function predictWithModel(models, imagePath, targetWidth, targetHeight) {
    try {
        // 이미지 불러오기
        const imageBuffer = fs.readFileSync(imagePath);
        const image = await tf.node.decodeImage(imageBuffer, 3);

        // 이미지 크기 변경 및 정규화
        const resizedImage = tf.image.resizeBilinear(image, [
            targetHeight,
            targetWidth,
        ]);
        const normalizedImage = resizedImage.div(255.0);

        // 배치 차원 추가
        const batchedImage = normalizedImage.expandDims(0);

        // 모델에 예측 요청
        const predictions = await models.predict(batchedImage);
        console.log(predictions.arraySync());
        return predictions.arraySync();
    } catch (error) {
        throw error;
    }
}

const upload = multer({
    storage: multer.diskStorage({
        filename(req, file, done) {
            done(null, file.originalname);
        },
        destination(req, file, done) {
            clearDestination(() => {
                done(null, path.join(__dirname, "public/files"));
            });
        },
    }),
});
function clearDestination(callback) {
    const destinationDir = path.join(__dirname, "public/files");
    fs.readdir(destinationDir, (err, files) => {
        if (err) {
            console.error("목적지 디렉터리 읽기 오류:", err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(destinationDir, file);
            fs.unlinkSync(filePath); // 디렉터리 내의 각 파일 삭제
        });

        callback();
    });
}

const uploadMiddleware = upload.single("myFile");

app.use(uploadMiddleware);

app.use("/public", express.static(__dirname + "/public"));

app.get("/", async function (req, res) {
    try {
        model = await tf.loadLayersModel(
            "file://" + __dirname + "/public/model_json/model.json"
        );
        model.predict();
    } catch (error) {
        console.error("Error:", error);
    }
    console.log("Model loaded successfully:", model.summary());

    clearDestination(() => console.log("start"));
    res.sendFile(__dirname + "/public/a.html");
});
app.get("/main", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/upload", (req, res) => {
    console.log(req.file);
    res.status(200).send('uploaded<script>location.href="/main";</script>');
});

app.get("/getimage", (req, res) => {
    const destinationDir = path.join(__dirname, "public/files");
    fs.readdir(destinationDir, (err, files) => {
        if (err) {
            console.error("목적지 디렉터리 읽기 오류:", err);
            return;
        }
        res.json(files);
    });
});
app.get("/ai", async (req, res) => {
    var imagePath;
    const destinationDir = path.join(__dirname, "public/files");
    fs.readdir(destinationDir, async (err, files) => {
        if (err) {
            console.error("목적지 디렉터리 읽기 오류:", err);
            return;
        }
        imagePath = path.join(__dirname, "public/files", files[0]);
        const predictions = await predictWithModel(model, imagePath, 512, 512);
        res.json(predictions);
    });
});

app.listen(port);
