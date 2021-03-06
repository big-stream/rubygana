/*!
 *  rubygana
 *
 *  MIT License
 *  ©  2018 ころん:すとりーむ
 */

'use strict'

// index0-5が小1-6、6が残り常用漢字
const 学年別漢字 = require('./学年別漢字.js')
const {文字参照を文字に} = require('./func')

module.exports = (html, オプション, コールバック) => {
  if (typeof html !== 'string') throw __filename + ': stringでない入力'
  html = html.trim()
  if (オプション.debug) console.time('#### 解析時間')
  const cheerio = require('cheerio')
  let $ = cheerio.load(html)
  セレクタ文法チェック($)

  // 空文字で対象なし(notで全対象)
  // cheerio: title下にタグがあっても$('title').find('タグ')は無効
  $(オプション.selector).not(オプション.not_selector).find('rb').each((i, element) => {
    const rb = 文字参照を文字に($(element).text())
    let 学年クラス = ''
    rb.split('').forEach((漢字) => {
      const 常用 = 学年別漢字.find((item, index) => {
        if (item.includes(漢字)) {
          学年クラス += オプション.add_class + (index + 1) + ' '
          return true
        }
      })
      if (常用 === undefined) 学年クラス += オプション.add_class + '8 '
    });
    // class="学年4 学年2 学年4"のように重複するが、文字ごとの学年希望
    $(element).parent('ruby').addClass(学年クラス)
  })

  // --css 空文字あり
  if (オプション.css !== null) $('head').append('<style>' + オプション.css + '</style>\n')

  // --switch
  if (オプション.switch) {
    const fs = require('fs')
    const switch_html = fs.readFileSync(__dirname + '/switch.html', 'utf8')
    if (オプション.add_class === '学年') {
      $('body').prepend(switch_html)
    } else {
      $('body').prepend(switch_html.replace(/ruby\.学年/g, 'ruby.' + オプション.add_class))
    }
    const rt非表示style = '  <style>ruby>rt.rt非表示{display:none;}</style>\n'
    $('head').append(rt非表示style)
  }

  let 結果
  if (オプション.only_body) {
    結果 = 文字参照を文字に($('body').html())
  } else {
    結果 = 文字参照を文字に($.html())
    if (/^<html>/.test(結果.trim())) 結果 = '<!DOCTYPE html>' + 結果
  }
  if (オプション.末尾改行) 結果 += '\n'

  if (オプション.debug) {console.timeEnd('#### 解析時間'); console.log()}
  コールバック(結果)

  function セレクタ文法チェック($) {
    try {
      if (オプション.selector) $(オプション.selector)
    } catch (e) {error('--selector', e)}
    try {
      if (オプション.not_selector) $(オプション.not_selector)
    } catch (e) {error('--not-selector', e)}
    function error(opt, e) {
      if (オプション.debug) console.error(e)
      console.error(`エラー: ${opt}の文法:`)
      process.exit(3) // TODO
    }
  }
}
