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
  if (typeof text !== 'string') throw __filename + ': stringでない入力'
  // trim()しない

  const ルビ = require('./ruby.js')
  const build = require('./build-kuromoji')

  function text解析(tokenizer) {
    if (オプション.debug) console.time('#### 解析時間')
    let 結果 = ''
    const arr = text.split('\n') // 行単位で処理
    arr.forEach((line, index) => {
      if (オプション.アリエンティスト) line = アリエンティー入れる(line)
      if (line.length) {
        const kuromoji解析json = tokenizer.tokenize(line + '\n')
        const ruby = new ルビ(line + '\n', kuromoji解析json, オプション)
        結果 += ruby.ルビ付き
        if (オプション.debug) ruby.ログ()
      } else {
        結果 += line + '\n'
      }
      if (オプション.アリエンティスト) 結果 = アリエンティー戻す(結果)
    })
    if (結果) 結果 = 結果.slice(0, -1) // 最後改行削除
    if (オプション.comment) 結果 += オプション.comment

    if (オプション.debug) {
      console.timeEnd('#### 解析時間')
      console.log()
    }

    コールバック(結果) // trimしてないからオプション.末尾改行も使わない
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
      line = line.replace(e.アリエンティーナre, e.単語 + オプション.左括弧 + e.ルビ + オプション.右括弧)
    })
    return line
  }

  function 失敗(err) {
    console.error(err)
    process.exit(4) // TODO
  }

  build(オプション.debug).then(text解析).catch(失敗)
}
