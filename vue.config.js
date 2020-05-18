const path = require('path');
const fs = require('fs');
const resolve = dir => path.resolve(__dirname, dir)

function getEntries(p) {
    let files = fs.readdirSync(resolve(p));
    const entries = files.reduce((memo, item) => {
        const itemPath = path.join(p, item)
        const isDir = fs.statSync(itemPath).isDirectory();
        if (isDir) {
            memo[item] = resolve(path.join(itemPath, 'index.js'))
        } else {
            const [name] = item.split('.')
            memo[name] = resolve(`${itemPath}`)
        }
        return memo
    }, {})
    return entries
}
let entries = getEntries('packages');
module.exports = {
    outputDir: 'lib',
    productionSourceMap: false,

    css: {
        sourceMap: true,
        extract: {
            filename: 'style/[name].css'
        }
    },
    chainWebpack: config => {
        config.plugins.delete('copy')
        config.plugins.delete('html')
        config.plugins.delete('preload')
        config.plugins.delete('prefetch')
        config.entryPoints.delete('app')
        config.module //  实现packages目录文件解析
            .rule('js')
            .include
            .add('/packages')
            .end()
            .use('babel')
            .loader('babel-loader')
            .tap(options => {
                return options
            });
    },
    configureWebpack: { // 项目入口
        entry: {
            ...entries
        },
        output: {
            filename: '[name]/index.js',
            libraryTarget: 'commonjs2',
        }
    }
}