/*!
 *  rubygana
 *
 *  MIT License
 *  ©  2018 ころん:すとりーむ
 */

'use strict'

module.exports = (マークダウン, オプション, コールバック) => {
  if (オプション.debug) {
    console.time('#### 解析時間')
  }

  const marked = require('marked')
  let body = marked(マークダウン)

  const cheerio = require('cheerio')
  const loadOption = {
    decodeEntities: false,
  }
  const html = '<!DOCTYPE html><html><head>\n<meta charset="UTF-8">\n<title></title>\n</head>\n<body>\n' + body + '</body></html>'
  let $ = cheerio.load(html, loadOption)

  // load()やhtml()で<pre><code>内の&lt;なども<に変換、元に戻す
  // text()だとその中を検索できず
  $('body').find('code').each((i, element) => {
    $(element).text($(element).html().replace(/</g, '&lt;').replace(/>/g, '&gt;'))
  })

  // h1をtitleに、ただし--title
  if (オプション.title !== undefined) { // 空文字あり
    $('title').append(オプション.title)
  } else {
    $('title').append($('body h1:nth-child(1)').text()) // h1ないなら空
  }

  // --css
  if (オプション.css !== null) { // 空文字あり
    $('head').append('<style>' + オプション.css + '</style>\n')
  }

  // --headline
  if (オプション.headline !== undefined) { // 空文字あり
    if ($('body h1').length > 0) {
      $('body h1:nth-child(1)').html(オプション.headline)
    } else {
      $('body').prepend('\n<h1>' + オプション.headline + '</h1>\n')
    }
  }

  コールバック($.html())
}
