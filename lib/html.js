/*!
 *  rubygana
 *
 *  MIT License
 *  ©  2018 ころん:すとりーむ
 */

'use strict'

/*
 * 方針: kuromojiには分割されたテキストを渡し、後で連結。
 * まず、$(セレクタ).not(除外セレクタ).each()で要素をまわす。(Cheerio)
 * 次に、正規表現にてタグに挟まれたコンテンツだけをまわす。
 * ただし、ruby要素など除外要素は正規表現で外す。
 */

module.exports = (html, オプション, コールバック) => {
  const 除外表現 = RegExp('<(ruby|' + オプション.ng_elements + ')[^>]*>[^]*?</(ruby|' + オプション.ng_elements + ')>|<[^>]+>', 'gm')
  const ルビ = require('./ruby.js')
  const kuromoji = require('kuromoji')

  let tokenizer

  function kuromojiビルド() {
    return new Promise((resolve, reject) => {
      if (オプション.debug) {
        console.time('#### ビルド時間')
      }
      kuromoji.builder({
        dicPath: __dirname + '/../node_modules/kuromoji/dict'
      }).build(function(err, _tokenizer) {
        if (err) {
          console.error('エラー: html.js: kuromojiのビルド失敗')
          reject(err)
        }
        tokenizer = _tokenizer
        if (オプション.debug) {
          console.timeEnd('#### ビルド時間') // 1秒くらいかかる
          console.log()
        }
        resolve()
      })
    })
  }

  function html解析() {
    if (オプション.debug) {
      console.time('#### 解析時間')
    }
    const cheerio = require('cheerio')
    const loadOption = {
      decodeEntities: false,
    }

    // ロードでhtml,head,bodyはどれか無くても自動生成。DOCTYPEは生成されず
    // 元からの有無は('body').get().lengthなどでは判定できず
    let $ = cheerio.load(html, loadOption)
    セレクタ文法チェック($)

    // 空文字で対象なし(notで全対象)
    // $('body').find()にすると、body直下の漢字が対象にならず
    $(オプション.selector).not(オプション.not_selector).each((i, element) => {
      if (オプション.debug && オプション.verbose && オプション.verbose.length > 2) {
        console.log('__html解析__: ', i, 'tagName:', $(element).get(0).tagName)
      }
      $(element).html(要素処理($(element).html()))
    })

    // --title
    if (オプション.title !== undefined) { // 空文字あり
      if ($('title').get().length === 0) {
        $('head').prepend('\n<title>' + オプション.title + '</title>')
      } else {
        $('title').text(オプション.title)
      }
    }

    // --css
    if (オプション.css !== null) { // 空文字あり
      $('head').append('<style>' + オプション.css + '</style>\n')
    }

    if (オプション.debug) {
      console.timeEnd('#### 解析時間')
      console.log()
    }

    // load()やhtml()で<pre><code>内の&lt;なども<に変換、元に戻す
    // text()だとその中を検索できず
    $('body').find('code').each((i, element) => {
      $(element).text($(element).html().replace(/</g, '&lt;').replace(/>/g, '&gt;'))
    })

    // </body>と</html>の間に改行 => body末尾に改行入る
    // cheerioの仕様のよう: 他にheadの改行が除かれたりする
    let 結果
    if (オプション.only_body) {
      結果 = $('body').html()
    } else {
      結果 = $.html()
    }
    if (オプション.comment) {
      結果 += オプション.comment
    }
    コールバック(結果)
  }

  function 要素処理(要素) {
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
    if (オプション.ruby) {
      テキスト = アリエンティー入れる(テキスト)
    }
    const kuromoji解析json = tokenizer.tokenize(テキスト)
    const ruby = new ルビ(テキスト, kuromoji解析json, オプション)
    if (オプション.debug) {
      ruby.ログ()
    }
    if (オプション.ruby) {
      return アリエンティー戻す(ruby.ルビ付き)
    } else {
      return ruby.ルビ付き
    }
  }

  function アリエンティー入れる(line) {
    オプション.ruby.forEach((e, i) => {
      const アリエンティー = 'チョーアリエンティー' + i + 'ナコトバッス'
      const フレーズか単語re = オプション.ruby_re[i][0]
      if (e.length === 3) { // フレーズあり
        const フレーズ中にアリエンティー = e[0].replace(e[1], アリエンティー) // 複数単語でも一つ目だけ
        line = line.replace(フレーズか単語re, フレーズ中にアリエンティー)
      } else {
        line = line.replace(フレーズか単語re, アリエンティー)
      }
    })
    return line
  }

  function アリエンティー戻す(line) {
    const 始まり = '<ruby><rb>'
    let 左括弧, 右括弧
    if (オプション.use_rp) {
      左括弧 = '</rb><rp>' + オプション.左括弧.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</rp><rt>'
      右括弧 = '</rt><rp>' + オプション.右括弧.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</rp></ruby>'
    } else {
      左括弧 = '</rb><rt>'
      右括弧 = '</rt></ruby>'
    }
    オプション.ruby.forEach((e, i) => {
      const アリエンティー = 'チョーアリエンティー' + i + 'ナコトバッス'
      const アリエンティーre = オプション.ruby_re[i][1]
      if (e.length === 3) { // フレーズあり
        line = line.replace(アリエンティーre, 始まり + e[1] + 左括弧 + e[2] + 右括弧)
      } else {
        line = line.replace(アリエンティーre, 始まり + e[0] + 左括弧 + e[1] + 右括弧)
      }
    })
    return line
  }

  function セレクタ文法チェック($) {
    try {
      if (オプション.selector) {
        $(オプション.selector)
      }
    } catch (e) {
      console.error('エラー: html.js: --selector の文法')
      console.error(e)
      process.exit(3)
    }
    try {
      if (オプション.not_selector) {
        $(オプション.not_selector)
      }
    } catch (e) {
      console.error('エラー: html.js: --not-selector の文法')
      console.error(e)
      process.exit(3) // TODO
    }
  }

  function 失敗(err) {
    console.error(err)
    process.exit(4) // TODO
  }

  kuromojiビルド().then(html解析).catch(失敗)
}
