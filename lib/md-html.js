/*!
 *  rubygana
 *
 *  MIT License
 *  ©  2018 ころん:すとりーむ
 */

'use strict'

const {文字参照を文字に} = require('./func')

module.exports = (マークダウン, オプション, コールバック) => {
  if (typeof マークダウン !== 'string') throw __filename + ': stringでない入力'
  マークダウン = マークダウン.trim()
  if (オプション.debug) console.time('#### 解析時間')
  const cheerio = require('cheerio')
  const html = '<!DOCTYPE html><html><head>\n<meta charset="UTF-8">\n<title></title>\n</head>\n<body>\n</body></html>'
  let $ = cheerio.load(html)

  const marked = require('marked')
  let 結果 = marked(マークダウン)
  $('body').append(結果)

  // h1をtitleに、ただし--title
  if (オプション.title !== undefined) { // 空文字あり
    $('title').append(オプション.title)
  } else {
    $('title').append($('body h1:nth-child(1)').text()) // h1ないなら空
  }
  // --css 空文字あり
  if (オプション.css !== null) $('head').append('<style>' + オプション.css + '</style>\n')
  // --headline 空文字あり
  if (オプション.headline !== undefined) {
    if ($('body h1').length > 0) {
      $('body h1:nth-child(1)').html(オプション.headline)
    } else {
      $('body').prepend('\n<h1>' + オプション.headline + '</h1>\n')
    }
  }

  if (オプション.debug) {console.timeEnd('#### 解析時間'); console.log()}
  if (オプション.末尾改行) {
    コールバック(文字参照を文字に($.html() + '\n'))
  } else {
    コールバック(文字参照を文字に($.html()))
  }
}
