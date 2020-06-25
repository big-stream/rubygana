#!/usr/bin/env node

const cheerio = require('cheerio')
const {文字参照を文字に} = require('./func')
let $, html

// cheerio.load()でhtml,head,bodyはどれか無くても自動生成。DOCTYPEは生成されず
// 元からの有無は$('body').get().lengthなどでは判定できず
html = '<p>x</p>'
$ = cheerio.load(html)
console.log($.html()) // <html><head></head><body><p>x</p></body></html>

// </body>と</html>の間に改行 => body末尾に改行入る
//  htmlとhead間の改行 => 除かれる
html = `<html>
<head></head><body></body>
</html>`
$ = cheerio.load(html)
console.log($.html())
// <html><head></head><body>
// </body></html>


html = '<p>&lt;あ</p>'
$ = cheerio.load(html) // デフォルト {decodeEntities: true,}
// まずい: すべて文字参照へ
console.log($('body').html()) // <p>&lt;&#x3042;</p>
// 格納時もまずい
console.log($('body').html('<p>&lt;あ</p>').html()) // <p>&lt;&#x3042;</p>

html = '<p>&lt;&#x3042;</p>'
$ = cheerio.load(html, {decodeEntities: false,})
// まずい: すべての文字参照が文字へ
console.log($('body').html()) // <p><あ</p>

html = '<p>&lt;あ</p>'
$ = cheerio.load(html) // デフォルト {decodeEntities: true,}
// 日本語などは文字のまま、&lt;などは文字参照のまま
console.log(文字参照を文字に($('body').html())) // <p>&lt;あ</p>
