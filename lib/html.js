/*!
 *  rubygana
 *
 *  MIT License
 *  ©  2018 ころん:すとりーむ
 */

'use strict'

const {文字参照を文字に} = require('./func')

/*
 * 方針: kuromojiには分割されたテキストを渡し、後で連結。
 * まず、$(セレクタ).not(除外セレクタ).each()で要素をまわす。(Cheerio)
 * 次に、正規表現にてタグに挟まれたコンテンツだけをまわす。
 * ただし、ruby要素など除外要素は正規表現で外す。
 */

module.exports = (html, オプション, コールバック) => {
  if (typeof html !== 'string') throw __filename + ': stringでない入力'
  html = html.trim()

  const 除外表現 = RegExp('<(ruby|' + オプション.ng_elements + ')[^>]*>[^]*?</(ruby|' + オプション.ng_elements + ')>|<[^>]+>', 'gm')
  const ルビ = require('./ruby.js')
  const build = require('./build-kuromoji')

  let tokenizer
  function html解析(_tokenizer) {
    tokenizer = _tokenizer
    if (オプション.debug) console.time('#### 解析時間')
    const cheerio = require('cheerio')
    let $ = cheerio.load(html)
    セレクタ文法チェック($)

    // 空文字で対象なし(notで全対象)
    // $('body').find()にすると、body直下の漢字が対象にならず
    $(オプション.selector).not(オプション.not_selector).each((i, element) => {
      if (オプション.debug && オプション.verbose && オプション.verbose.length > 2) {
        console.log('__html解析__: ', i, 'tagName:', $(element).get(0).tagName)
      }
      $(element).html(要素処理($(element).html())) // 再び文字参照になっている
    })

    // --title
    if (オプション.title !== undefined) { // 空文字あり
      if ($('title').get().length === 0) {
        $('head').prepend('\n<title>' + オプション.title + '</title>')
      } else {
        $('title').text(オプション.title)
      }
    }

    // --css 空文字あり
    if (オプション.css !== null) $('head').append('<style>' + オプション.css + '</style>\n')
    if (オプション.comment) $('body').append('\n<!-- 7d94530980e8645d966033bfa8eca3cd -->\n') // 文字参照対策: 後で置換

    let 結果
    if (オプション.only_body) {
      結果 = 文字参照を文字に($('body').html())
    } else {
      結果 = 文字参照を文字に($.html())
      if (/^<html>/.test(結果.trim())) 結果 = '<!DOCTYPE html>' + 結果
    }
    if (オプション.末尾改行) 結果 += '\n'
    if (オプション.comment) 結果 = 結果.replace(/^<!-- 7d94530980e8645d966033bfa8eca3cd -->$/m, オプション.comment)

    if (オプション.debug) {console.timeEnd('#### 解析時間'); console.log()}
    コールバック(結果)
  }

  function 要素処理(要素) {
    要素 = 文字参照を文字に(要素)
    let 要素結果 = ''
    let arr
    let now = 0
    // タグが含まれる
    while ((arr = 除外表現.exec(要素)) !== null) {
      const テキスト = 要素.slice(now, arr.index)
      if (!テキスト.trim()) {
        要素結果 += テキスト + arr[0]
      } else {
        要素結果 += ルビ付きテキスト(テキスト) + arr[0]
        if (オプション.debug && オプション.verbose && オプション.verbose.length > 2) {
          console.log('__要素解析__: ', arr.index, arr[0].length, 除外表現.lastIndex, arr[0])
        }
      }
      now = arr.index + arr[0].length
    }
    // タグが含まれない or 最後のタグ後テキスト
    const テキスト = 要素.slice(now)
    if (!テキスト.trim()) {
      要素結果 += テキスト
    } else {
      要素結果 += ルビ付きテキスト(テキスト)
    }
    return 要素結果
  }

  function ルビ付きテキスト(テキスト) {
    if (オプション.アリエンティスト) テキスト = アリエンティー入れる(テキスト)
    const kuromoji解析json = tokenizer.tokenize(テキスト)
    const ruby = new ルビ(テキスト, kuromoji解析json, オプション)
    if (オプション.debug) ruby.ログ()
    if (オプション.アリエンティスト) return アリエンティー戻す(ruby.ルビ付き)
    return ruby.ルビ付き
  }

  function アリエンティー入れる(line) {
    オプション.アリエンティスト.forEach(e => {
      if (e.タイプ === '--ruby-re') {
        let arr
        let temp = ''
        let from = 0
        while ((arr = e.フレーズか単語re.exec(line)) !== null) {
          let フレーズにアリエンティーナ = arr[0].replace(e.単語, e.アリエンティーナ)
          temp = temp + line.slice(from, arr.index) + フレーズにアリエンティーナ
          from = e.フレーズか単語re.lastIndex
        }
        temp = temp + line.slice(from)
        line = temp
      } else if (e.フレーズ) {
        line = line.replace(e.フレーズか単語re, e.フレーズにアリエンティーナ)
      } else {
        line = line.replace(e.フレーズか単語re, e.アリエンティーナ)
      }
    })
    return line
  }

  function アリエンティー戻す(line) {
    オプション.アリエンティスト.forEach(e => {
      line = line.replace(e.アリエンティーナre, '<ruby><rb>' + e.単語 + オプション.左括弧 + e.ルビ + オプション.右括弧)
    })
    return line
  }

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

  function 失敗(err) {
    console.error(err)
    process.exit(4) // TODO
  }

  build(オプション.debug).then(html解析).catch(失敗)
}
