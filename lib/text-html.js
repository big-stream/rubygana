/*!
 *  rubygana
 *
 *  MIT License
 *  ©  2018 ころん:すとりーむ
 */

'use strict'

const {文字参照を文字に} = require('./func')

module.exports = (text, オプション, コールバック) => {
  if (typeof text !== 'string') throw __filename + ': stringでない入力'
  text = text.trim()
  if (オプション.debug) console.time('#### 解析時間')
  const cheerio = require('cheerio')
  const html = '<!DOCTYPE html><html><head>\n<meta charset="UTF-8">\n<title></title>\n</head>\n<body>\n</body></html>'
  let $ = cheerio.load(html)
  let 結果 = ''
  const arr = text.split('\n') // 行単位で処理

  // --headlineなければ1行目をh1にする
  let h1 = オプション.headline === undefined ? true : false // 空文字もfalse
  let title = ''
  arr.forEach((item, index) => {
    if (item.length && h1) {
      結果 += '<h1>' + item + '</h1>' + '\n'
      title = item
      h1 = false
    } else if (item.length) {
      結果 += '<p>' + item + '</p>' + '\n'
    } else {
      結果 += item + '\n'
    }
  })
  if (結果 === '\n') 結果 = ''
  $('body').append(結果)

  // --titleも--headlineもなければ、1行目をtitleにする
  // --titleがなくて--headlineがあれば、titleは空
  if (オプション.title !== undefined) title = オプション.title
  $('title').append(title)
  // --css 空文字あり
  if (オプション.css !== null) $('head').append('<style>' + オプション.css + '</style>\n')
  // --headline 空文字あり
  if (オプション.headline !== undefined) $('body').prepend('\n<h1>' + オプション.headline + '</h1>')

  if (オプション.debug) {console.timeEnd('#### 解析時間'); console.log()}
  if (オプション.末尾改行) {
    コールバック(文字参照を文字に($.html() + '\n'))
  } else {
    コールバック(文字参照を文字に($.html()))
  }
}
