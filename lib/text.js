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
    arr.forEach((line, index) => {
      if (オプション.アリエンティスト) {
        line = アリエンティー入れる(line)
      }
      if (line.length) {
        const kuromoji解析json = tokenizer.tokenize(line + '\n')
        const ruby = new ルビ(line + '\n', kuromoji解析json, オプション)
        結果 += ruby.ルビ付き
        if (オプション.debug) {
          ruby.ログ()
        }
      } else {
        結果 += line + '\n'
      }
      if (オプション.アリエンティスト) {
        結果 = アリエンティー戻す(結果)
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

  function アリエンティー入れる(line) {
    オプション.アリエンティスト.forEach(e => {
      if (e.タイプ === '--ruby-re') {
        let arr
        let i = 0
        while ((arr = e.フレーズか単語re.exec(line)) !== null) {
          let フレーズにアリエンティーナ = arr[0].replace(e.単語, e.アリエンティーナ)
          line = line.replace(arr[0], フレーズにアリエンティーナ)
          if (i > 1000) {
            失敗('エラー: --ruby-reによる変換試行が1000回超えた: ' + e) // TODO
          }
          i++
        }
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
      line = line.replace(e.アリエンティーナre, e.単語 + オプション.左括弧 + e.ルビ + オプション.右括弧)
    })
    return line
  }

  function 失敗(err) {
    console.error(err)
    process.exit(4) // TODO
  }

  kuromojiビルド().then(text解析).catch(失敗)
}
