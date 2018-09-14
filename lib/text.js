/*!
 *  rubygana
 *
 *  MIT License
 *  ©  2018 ころん:すとりーむ
 */

'use strict'

/*
 * 方針: kuromojiには改行で分割したテキストを渡し、後で連結。
 * 1万行、838000文字、2.4Mのテキストで13.158秒かかった。
 */

module.exports = (text, オプション, コールバック) => {
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
          console.error('エラー: text.js: kuromojiのビルド失敗')
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

  function text解析() {
    if (オプション.debug) {
      console.time('#### 解析時間')
    }
    let 結果 = ''
    const arr = text.split('\n') // 行単位で処理
    arr.forEach((item, index) => {
      if (item.length) {
        const kuromoji解析json = tokenizer.tokenize(item + '\n')
        const ruby = new ルビ(item + '\n', kuromoji解析json, オプション)
        結果 += ruby.ルビ付き
        if (オプション.debug) {
          ruby.ログ()
        }
      } else {
        結果 += item + '\n'
      }
    })
    if (結果) {
      結果 = 結果.slice(0, -1) // 最後改行削除
    }
    if (オプション.debug) {
      console.timeEnd('#### 解析時間')
      console.log()
    }
    if (オプション.comment) {
      結果 += オプション.comment
    }
    コールバック(結果)
  }

  function 失敗(err) {
    console.error(err)
    process.exit(4) // TODO
  }

  kuromojiビルド().then(text解析).catch(失敗)
}
