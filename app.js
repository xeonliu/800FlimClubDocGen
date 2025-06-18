import express from 'express';
import * as docx from 'docx';

const app = express();
const port = 3000;

// 解析表单数据
app.use(express.urlencoded({ extended: true }));

// 首页路由
app.get('/', (req, res) => {
  res.send(`
    <form action="/generate" method="post">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name"><br><br>
      <label for="email">Email:</label>
      <input type="email" id="email" name="email"><br><br>
      <input type="submit" value="Generate Word">
    </form>
  `);
});

// 生成 Word 文件的路由
app.post('/generate', async (req, res) => {
  const { name, email } = req.body;
  console.log(name, email);

// 创建一个新的 Word 文档
  const doc = new docx.Document({
    creator: "Your Name",
    title: "Document Title",
    description: "Document description",
    sections: []
  });

  // 添加段落
  doc.addSection({
    children: [
      new docx.Paragraph({
        children: [
          new docx.TextRun(`Name: ${name}`),
        ],
      }),
      new docx.Paragraph({
        children: [
          new docx.TextRun(`Email: ${email}`),
        ],
      }),
    ],
  });

  // 将文档保存到内存中
  const buffer = await docx.Packer.toBuffer(doc);

  // 设置响应头，提示浏览器下载文件
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', 'attachment; filename="output.docx"');
  res.end(buffer);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});