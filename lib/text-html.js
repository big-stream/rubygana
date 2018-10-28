/*!
 *  rubygana
 *
 *  MIT License
 *  ©  2018 ころん:すとりーむ
 */

'use strict'

module.exports = (text, オプション, コールバック) => {
  if (typeof text !== 'string') {
    throw __filename + ': stringでない入力'
  }
  text = text.trim()

  if (オプション.debug) {
    console.time('#### 解析時間')
    console.log()
  }

  const cheerio = require('cheerio')
  const loadOption = {
    decodeEntities: false,
  }
  const html = '<!DOCTYPE html><html><head>\n<meta charset="UTF-8">\n<title></title>\n</head>\n<body>\n</body></html>'
  let $ = cheerio.load(html, loadOption)

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
  if (結果 === '\n') {
    結果 = ''
  }

  //
  $('body').append(結果)

  // --titleも--headlineもなければ、1行目をtitleにする
  // --titleがなくて--headlineがあれば、titleは空
  if (オプション.title !== undefined) { // 空文字あり
    title = オプション.title
  }
  $('title').append(title)

  // --css
  if (オプション.css !== null) { // 空文字あり
    $('head').append('<style>' + オプション.css + '</style>\n')
  }

  // --headline
  if (オプション.headline !== undefined) { // 空文字あり
    $('body').prepend('\n<h1>' + オプション.headline + '</h1>')
  }

  // load()やhtml()で<pre><code>内の&lt;なども<に変換、元に戻す
  // text()だとその中を検索できず
  $('body').find('code').each((i, element) => {
    $(element).text($(element).html().replace(/</g, '&lt;').replace(/>/g, '&gt;'))
  })

  if (オプション.debug) {
    console.timeEnd('#### 解析時間')
    console.log()
  }

  if (オプション.末尾改行) {
    コールバック($.html() + '\n')
  } else {
    コールバック($.html())
  }
}
