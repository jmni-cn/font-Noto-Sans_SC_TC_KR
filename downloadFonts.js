const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
const cliProgress = require('cli-progress');
const { promisify } = require('util');
const download = require('download');
const https = require('https');

// 配置
const FONTS_DIR = path.join(__dirname, 'fonts');
const FONT_FAMILIES = ['Noto+Sans', 'Noto+Sans+KR', 'Noto+Sans+SC', 'Noto+Sans+TC'];

// 创建进度条
const progressBar = new cliProgress.SingleBar({
    format: '{bar} {percentage}% | {value}/{total} | {title}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});

// 创建自定义 HTTPS 代理
const httpsAgent = new https.Agent({
    rejectUnauthorized: false // 禁用证书验证
});

/**
 * 获取浏览器请求头
 * @returns {Object} 请求头对象
 */
function getBrowserHeaders() {
    return {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'zh-CN,zh;q=0.9,ko;q=0.8,zh-TW;q=0.7,en-US;q=0.6,en;q=0.5,ja;q=0.4,en-GB;q=0.3,ar;q=0.2,az;q=0.1,cs;q=0.1,de;q=0.1,eo;q=0.1,es-AR;q=0.1,es;q=0.1,et;q=0.1,fa;q=0.1,fr;q=0.1,id;q=0.1,it;q=0.1,nb;q=0.1,nl;q=0.1,pl;q=0.1,pt;q=0.1,pt-BR;q=0.1,be;q=0.1,sk;q=0.1,sv;q=0.1,th;q=0.1,tr;q=0.1,uk;q=0.1,uz;q=0.1,vi;q=0.1',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Host': 'fonts.gstatic.com',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'X-Browser-Channel': 'stable',
        'X-Browser-Copyright': 'Copyright 2025 Google LLC. All rights reserved.',
        'X-Browser-Validation': 'wTKGXmLo+sPWz1JKKbFzUyHly1Q=',
        'X-Browser-Year': '2025',
        'X-Client-Data': 'CJa2yQEIo7bJAQipncoBCOqIywEIkqHLAQiKo8sBCIWgzQEIusjNAQj9pc4BCL7VzgEIgNbOAQjz484BCK7kzgEI4OTOAQiM5c4BGKfmzgE=',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
    };
}

/**
 * 递归查找所有 index.css 文件
 * @param {string} dir 目录路径
 * @returns {Promise<string[]>} index.css 文件路径数组
 */
async function findIndexCssFiles(dir) {
    const files = await fs.readdir(dir);
    const cssFiles = [];

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
            const subFiles = await findIndexCssFiles(fullPath);
            cssFiles.push(...subFiles);
        } else if (file === 'index.css') {
            cssFiles.push(fullPath);
        }
    }

    return cssFiles;
}

/**
 * 从 CSS 文件中提取字体 URL
 * @param {string} cssContent CSS 文件内容
 * @returns {Array<{url: string, fontFamily: string}>} 字体 URL 和字体系列信息
 */
function extractFontUrls(cssContent) {
    const fontFaces = cssContent.match(/@font-face\s*{[^}]*}/g) || [];
    const fontUrls = [];

    for (const fontFace of fontFaces) {
        const urlMatch = fontFace.match(/url\(['"]?(https:\/\/[^'")]+\.woff2)['"]?\)/);
        const fontFamilyMatch = fontFace.match(/font-family:\s*['"]([^'"]+)['"]/);

        if (urlMatch && fontFamilyMatch) {
            fontUrls.push({
                url: urlMatch[1],
                fontFamily: fontFamilyMatch[1]
            });
        }
    }

    return fontUrls;
}

/**
 * 下载字体文件
 * @param {string} url 字体文件 URL
 * @param {string} outputPath 输出路径
 * @returns {Promise<void>}
 */
async function downloadFont(url, outputPath) {
    try {
        const response = await fetch(url, {
            headers: getBrowserHeaders(),
            agent: httpsAgent
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const buffer = await response.buffer();
        await fs.writeFile(outputPath, buffer);
    } catch (error) {
        console.error(`下载失败: ${url}`, error);
        throw error;
    }
}

/**
 * 更新 CSS 文件中的字体 URL
 * @param {string} cssContent CSS 文件内容
 * @param {string} fontDir 字体目录
 * @returns {string} 更新后的 CSS 内容
 */
function updateCssUrls(cssContent, fontDir) {
    return cssContent.replace(
        /url\(['"]?(https:\/\/[^'")]+\.woff2)['"]?\)/g,
        (match, url) => {
            const fileName = path.basename(url);
            return `url('./font/${fileName}')`;
        }
    );
}

/**
 * 主函数
 */
async function main() {
    try {
        console.log('开始处理字体文件...');

        // 查找所有 index.css 文件
        const cssFiles = await findIndexCssFiles(FONTS_DIR);
        console.log(`找到 ${cssFiles.length} 个 index.css 文件`);

        // 处理每个 CSS 文件
        for (const cssFile of cssFiles) {
            console.log(`\n处理文件: ${cssFile}`);
            
            // 读取 CSS 内容
            const cssContent = await fs.readFile(cssFile, 'utf8');
            
            // 提取字体 URL
            const fontUrls = extractFontUrls(cssContent);
            console.log(`找到 ${fontUrls.length} 个字体文件`);

            if (fontUrls.length === 0) continue;

            // 创建字体目录
            const fontDir = path.join(path.dirname(cssFile), 'font');
            await fs.ensureDir(fontDir);

            // 下载字体文件
            progressBar.start(fontUrls.length, 0, { title: '下载字体文件' });
            
            for (const [index, { url }] of fontUrls.entries()) {
                const fileName = path.basename(url);
                const outputPath = path.join(fontDir, fileName);

                // 检查文件是否已存在
                if (!await fs.pathExists(outputPath)) {
                    await downloadFont(url, outputPath);
                }

                progressBar.update(index + 1);
            }
            
            progressBar.stop();

            // 更新 CSS 文件
            const updatedCss = updateCssUrls(cssContent, fontDir);
            await fs.writeFile(cssFile, updatedCss, 'utf8');
            console.log('CSS 文件已更新');
        }

        console.log('\n所有字体文件处理完成！');
    } catch (error) {
        console.error('处理过程中发生错误:', error);
        process.exit(1);
    }
}

// 运行主函数
main();
