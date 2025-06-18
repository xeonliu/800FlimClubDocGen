const express = require('express');
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 渲染表单页面
app.get('/', (req, res) => {
    res.render('form');
});

// 处理表单提交，生成 output.html 和 Word
app.post('/generate', async (req, res) => {
    const data = req.body;
    // 生成 HTML
    const html = await ejs.renderFile(path.join(__dirname, 'views', 'template.ejs'), data, {async: true});
    fs.writeFileSync('output.html', html, 'utf8');

    res.send('<h2>生成成功！</h2><a href="/output.html" target="_blank">下载HTML</a>');
});

// 提供 output.html 和 output.docx 下载
app.use(express.static('.'));

app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});