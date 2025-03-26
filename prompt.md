
编写一个Node.js脚本，完成以下流程：

递归遍历项目根目录下的fonts目录，定位所有的index.css文件。

从每个index.css文件中，提取所有@font-face规则中字体文件的URL（格式为.woff2）。

将提取到的URL字体文件，逐一下载到本地的/fonts/{{name}}/font目录，name指的是字体Noto+Sans或者Noto+Sans+KR或者Noto+Sans+SC或者Noto+Sans+TC

下载完成后，自动把CSS文件中的远程字体URL替换为本地路径（例如：/fonts/Noto+Sans/fontname.woff2），fontname要符合语义。


示例：/fonts/Noto+Sans/index.css中的某一原始数据为

/* cyrillic */
@font-face {
  font-family: 'Noto Sans';
  font-style: normal;
  font-weight: 400;
  font-stretch: 100%;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/notosans/v39/o-0bIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5ardu2ui.woff2) format('woff2');
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}

要求把url(https://fonts.gstatic.com/s/notosans/v39/o-0bIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5ardu2ui.woff2)下载到/fonts/Noto+Sans/font/o-0bIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5ardu2ui.woff2

并把原始数据更改为
/* cyrillic */
@font-face {
  font-family: 'Noto Sans';
  font-style: normal;
  font-weight: 400;
  font-stretch: 100%;
  font-display: swap;
  src: url('./font/o-0bIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5ardu2ui.woff2') format('woff2');
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}


文件目录结构示意：

project/
├── fonts/
│   ├── Noto+Sans/
│   │   └── index.css
│   │   └── font/ (下载字体到这里)
│   ├── Noto+Sans+KR/
│   │   └── index.css
│   │   └── font/ (下载字体到这里)
│   ├── Noto+Sans+SC/
│   │   └── index.css
│   │   └── font/ (下载字体到这里)
│   └── Noto+Sans+TC/
│       └── index.css
│       └── font/ (下载字体到这里)

要求：
脚本清晰易读，有良好的注释和错误处理。

支持重复执行（如果字体文件已存在则跳过下载，避免重复下载）。
下载后的文件名从原URL中提取,但是要求要符合语义。

请你：
提供完整的、可以立即运行的脚本代码。

指导如何安装所需依赖（例如node-fetch）。

提供运行脚本的明确命令。

现在，请开始完成以上任务。