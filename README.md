# 字体文件下载工具

这是一个用于下载和本地化 Google Fonts 字体文件的 Node.js 脚本。它可以自动下载 CSS 文件中引用的字体文件，并更新 CSS 文件中的字体路径为本地路径。

## 功能特点

- 递归遍历项目中的 `fonts` 目录，查找所有 `index.css` 文件
- 自动提取 CSS 文件中的字体 URL（.woff2 格式）
- 下载字体文件到对应的本地目录
- 自动更新 CSS 文件中的字体路径
- 支持重复执行（跳过已下载的字体文件）
- 显示下载进度条
- 完善的错误处理

## 目录结构

```
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
├── downloadFonts.js
└── package.json
```

## 安装依赖

```bash
npm install
```

## 使用方法

1. 确保你的项目目录结构符合上述要求
2. 在项目根目录下运行：

```bash
npm start
```

或者直接运行：

```bash
node downloadFonts.js
```

## 注意事项

- 脚本会自动创建必要的目录结构
- 如果字体文件已经存在，脚本会跳过下载
- 下载的字体文件会保持原始文件名
- CSS 文件中的字体路径会被更新为相对路径（例如：`./font/filename.woff2`）

## 错误处理

如果下载过程中出现错误，脚本会：
1. 显示详细的错误信息
2. 继续处理其他文件
3. 在完成时显示错误统计

## 依赖项

- node-fetch: 用于下载文件
- fs-extra: 用于文件系统操作
- cli-progress: 用于显示进度条
- download: 用于文件下载

## 许可证

MIT 