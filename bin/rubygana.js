#!/usr/bin/env node

/*!
 *  rubygana
 *
 *  MIT License
 *  ©  2018 ころん:すとりーむ
 */

'use strict'

// オプションと標準入力の総合検証、コマンド分岐
const {標準入力, オプション解析} = require('imay-cli-nodejs')
const オプション = オプション解析(require('../lib/options'))

標準入力(コールバック).then(標準入力 => {
  オプション.標準入力 = 標準入力.status
  const 入力 = オプションと標準入力の総合検証(標準入力.data)
  if (入力 === undefined) 終了() // 空文字は終了せず
  if (オプション.debug && オプション.debug.length > 1) 終了() // -ddでkuromoji実行しない
  コマンド分岐(入力)
}).catch(e => 終了(99, e))

function コールバック(data) {
  if (オプション.debug && (オプション.verbose && オプション.verbose.length > 2)) process.stdout.write(`標準入力: ${data}`)
}

function 終了(終了ステータス = 0, 表示 = '') {
  if (終了ステータス !== 0) {
    console.error(`エラー: ${表示}\nコマンドヘルプ: --help`)
  } else if (表示 !== '') {
    console.log(表示)
  }
  if (オプション.debug) {
    console.log('終了時オプション(終了ステータス' + 終了ステータス + '):')
    if (!オプション.verbose) {
      delete オプション.アリエンティスト
      delete オプション.未指定
    }
    console.log(オプション)
  }
  process.exit(終了ステータス)
}

function オプションと標準入力の総合検証(stdin) {
  if (オプション.debug) {
    console.log('検証前オプション:')
    console.log(オプション)
  }
  // 不正オプション
  if (オプション.不明) 終了(1, `不明なオプション: ${オプション.不明}`)
  if (オプション.曖昧) 終了(1, `曖昧なオプション: ${オプション.曖昧[0]}`) // とりあえず1グループだけ
  if (オプション.引数必須) 終了(1, `引数必須のオプション: ${オプション.引数必須}`)
  if (オプション.排他的) 終了(1, `互いに排他的なオプション: ${オプション.排他的[0]}`) // とりあえず1グループだけ

  if (オプション.オペランド && オプション.標準入力) 終了(1, `標準入力とファイル指定はどちらかのみ: ${オプション.オペランド}`)
  if (オプション.オペランド && オプション.オペランド.length > 1) 終了(1, `ファイル指定が複数ある: ${オプション.オペランド}`)

  // 単独オプションで終了
  if (オプション.help) helpオプション()
  if (オプション.version) versionオプション()
  if (オプション.依存) 依存オプション()
  if (オプション.ライセンス) ライセンスオプション()
  if (オプション.感謝) 終了(0, 'どういたしまして☺')
  if (オプション.sample_html) sample_htmlオプション()
  if (オプション.sample_text) sample_textオプション()
  if (オプション.sample_md) sample_mdオプション()
  if (オプション.readme_md) readme_mdオプション()

  let 入力
  if (オプション.標準入力) {
    入力 = stdin
  } else if (オプション.オペランド) {
    入力 = ファイル読込(オプション.オペランド[0])
  } else if (オプション.readme_html) {
    入力 = ファイル読込(__dirname + '/../README.md')
  } else if (オプション.標準入力 === null) {
    入力 = ''
  }

  コマンドグループの判定(入力)
  オプション整理検証()

  // 末尾改行一つあれば、最後に追加
  オプション.末尾改行 = false
  if (入力 && /\n$/.test(入力)) オプション.末尾改行 = true

  return 入力
}

function ファイル読込(ファイル) {
  const fs = require('fs')
  try {
    return fs.readFileSync(ファイル, 'utf8')
  } catch (e) {
    終了(2, `ファイルを開けない: ${ファイル}`)
  }
}


//-------------------------------------------------------------------------------

// 引数なしオプション

function helpオプション() {
  const ヘルプ = require('../lib/help.js')
  終了(0, ヘルプ.コマンド説明)
}

function versionオプション() {
  const ヘルプ = require('../lib/help.js')
  終了(0, 'rubygana ' + ヘルプ.バージョン)
}

function 依存オプション() {
  const msg = `日本語解析: kuromoji.js
マークダウンのタグ化: marked
HTML解析: cheerio`
  終了(0, msg)
}

function ライセンスオプション() {
  const msg = `MIT License
©  2018 ころん:すとりーむ`
  終了(0, msg)
}

function sample_mdオプション() {
  const sample = require('../lib/sample-md.js')
  終了(0, sample)
}

function sample_textオプション() {
  const sample = require('../lib/sample-text.js')
  終了(0, sample)
}

function sample_htmlオプション() {
  const sample = require('../lib/sample-html.js')
  終了(0, sample)
}

function readme_mdオプション() {
  const readme = ファイル読込(__dirname + '/../README.md')
  終了(0, readme)
}


//-------------------------------------------------------------------------------

function コマンドグループの判定(入力) {
  const たぶんhtml = /^<!DOCTYPE html[^><]*>|<\?xml[^><]*>/i
  if (オプション.html) {
    オプション.グループ = '--html'
  } else if (オプション.text) {
    オプション.グループ = '--text'
  } else if (オプション.add_class) {
    オプション.グループ = '--add-class'
  } else if (オプション.text_html) {
    オプション.グループ = '--text-html'
  } else if (オプション.md_html) {
    オプション.グループ = '--md-html'
  } else if (オプション.readme_html) {
    オプション.グループ = '--readme-html'
  } else if (入力 && たぶんhtml.test(入力.trim())) { // 自動判別: タグの有無で判断
    オプション.グループ = '--html'
  } else {
    オプション.グループ = '--text'
  }
}


//===============================================================================

function オプション整理検証() {
  if (オプション.グループ === '--html') {
    ruby要素調整()
    grade検証(); granularity検証(); comment検証(); katakana検証(); ruby検証(); ruby_comma検証(); ruby_re検証()
    selector検証(); not_selector検証(); ng_elements検証()
    title検証()
    ruby_size検証() // cssより先
    css検証()
  } else if (オプション.グループ === '--text') {
    brackets検証()
    grade検証(); granularity検証(); comment検証(); katakana検証(); ruby検証(); ruby_comma検証(); ruby_re検証()
  } else if (オプション.グループ === '--add-class') {
    add_class検証()
    selector検証(); not_selector検証()
    css検証()
  } else if (オプション.グループ === '--text-html' || オプション.グループ === '--md-html') {
    title検証()
    headline検証()
    css検証()
  }
}


//-------------------------------------------------------------------------------

// 引数あり

function brackets検証() { // stringに、空文字ok
  if (オプション.brackets) {
    if (オプション.brackets.length > 1) 終了(1, '--bracketsオプションは1回だけ使える: ' + オプション.brackets.join(', '))
    // 奇数なら左括弧多めに配分
    オプション.左括弧 = オプション.brackets[0].slice(0, Math.ceil((オプション.brackets[0].length / 2)))
    オプション.右括弧 = オプション.brackets[0].slice(Math.ceil((オプション.brackets[0].length / 2)))
  } else {
    オプション.左括弧 = '('
    オプション.右括弧 = ')'
  }
}

function grade検証() { // 0-7に
  if (オプション.grade) {
    if (オプション.grade.length > 1) 終了(1, '--gradeオプションは1回だけ使える: ' + オプション.grade.join(', '))
    オプション.grade = オプション.grade[0]
    if (!/^[0-7]$/.test(オプション.grade)) 終了(1, '--gradeオプションは0-7の数: ' + オプション.grade)
    オプション.grade = Number(オプション.grade)
  } else {
    オプション.grade = 0
  }
}

function granularity検証() { // 0-2に
  if (オプション.granularity) {
    if (オプション.granularity.length > 1) 終了(1, '--granularityオプションは1回だけ使える: ' + オプション.granularity.join(', '))
    オプション.granularity = オプション.granularity[0]
    if (!/^[0-2]$/.test(オプション.granularity)) 終了(1, '--granularityオプションは0-2の数: ' + オプション.granularity)
    オプション.granularity = Number(オプション.granularity)
  } else {
    オプション.granularity = 0
  }
}

// セレクタ文法チェックは後でCheerioに任す
function selector検証() { // 配列複数なら,区切りのstringに, 空文字ok
  if (オプション.selector) {
    オプション.selector = オプション.selector.join(', ')
  } else {
    オプション.selector = 'body'
  }
}

// セレクタ文法チェックは後でCheerioに任す
function not_selector検証() { // 配列複数なら,区切りのstringに, 空文字ok
  if (オプション.not_selector) {
    オプション.not_selector = オプション.not_selector.join(', ')
  } else if (オプション.グループ === '--add-class') {
    オプション.not_selector = ''
  } else { // --html
    オプション.not_selector = 'ruby,script,style,code,pre,samp,blockquote'
  }
}

function ng_elements検証() { // 配列複数なら|区切りのstringに, 空文字ok
  if (オプション.ng_elements) {
    オプション.ng_elements = オプション.ng_elements.join('|')
    if (!/(^[a-zA-Z][a-zA-Z1-6]*(\|[a-zA-Z][a-zA-Z1-6]*)*$)|(^$)/.test(オプション.ng_elements)) {
      終了(1, '--ng-elementsオプションは--selectorの子孫から除外する要素を|区切りで: ' + オプション.ng_elements)
    }
  } else {
    オプション.ng_elements = 'ruby|script|style|code|pre|samp|blockquote'
  }
}

function title検証() { // undefinedかstringに, 空文字ok
  if (オプション.title) {
    if (オプション.title.length > 1) 終了(1, '--titleオプションは1回だけ使える: ' + オプション.title.join(', '))
    オプション.title = オプション.title[0]
  }
}

function headline検証() { // undefinedかstringに, 空文字ok
  if (オプション.headline) {
    if (オプション.headline.length > 1) 終了(1, '--headlineオプションは1回だけ使える: ' + オプション.headline.join(', '))
    オプション.headline = オプション.headline[0]
  }
}

function ruby検証() {
  if (オプション.ruby) rubyとruby_comma検証(オプション.ruby, '--ruby')
}

function ruby_comma検証() {
  if (オプション.ruby_comma) rubyとruby_comma検証(オプション.ruby_comma, '--ruby-comma')
}

function rubyとruby_comma検証(arr, タイプ) {
  let opt_re, 区切り
  if (タイプ === '--ruby') {
    opt_re = /^[^:]+:[^:]+(:[^:]+)?$/
    区切り = ':'
  } else {
    opt_re = /^[^,]+,[^,]+(,[^,]+)?$/
    区切り = ','
  }
  arr.forEach(e => {
    if (!opt_re.test(e)) {
      終了(1, タイプ + ' \'フレーズ' + 区切り + '単語' + 区切り + 'ルビ\': 「フレーズ' + 区切り + '」は省略可: ' + e)
    }
    // マッチ部分を何それアリエナイなフレーズに置換、あとで戻す
    let temp, フレーズ, 単語, ルビ, フレーズか単語re, アリエンティーナ, フレーズにアリエンティーナ
    const ruby_arr = e.split(区切り)
    if (ruby_arr.length === 3) { // フレーズあり
      フレーズ = ruby_arr[0]
      単語 = ruby_arr[1]
      ルビ = ruby_arr[2]
      if (!フレーズ.includes(単語)) {
        終了(1, タイプ + ' \'フレーズ' + 区切り + '単語' + 区切り + 'ルビ\': 「フレーズ」に「単語」を含むこと: ' + e)
      }
      temp = '[' + フレーズ.split('').join('][') + ']'
    } else {
      単語 = ruby_arr[0]
      ルビ = ruby_arr[1]
      temp = '[' + 単語.split('').join('][') + ']'
    }
    temp = temp.replace(/\[\\]/g, '[\\\\]').replace(/\[]]/g, '[\\]]') // ]と\をエスケープ
    try {
      フレーズか単語re = new RegExp(temp, 'g')
    } catch (err) {
      終了(1, タイプ + ': 解釈できない: ' + e + '\n' + err)
    }
    アリエンティーナ = アリエンティーナ取得(区切り)
    if (ruby_arr.length === 3) { // フレーズあり
      フレーズにアリエンティーナ = フレーズ.replace(単語, アリエンティーナ) // 単語複数でも一つ目だけ
    }
    アリエンティスト追加(タイプ, フレーズ, 単語, ルビ, フレーズか単語re, アリエンティーナ, フレーズにアリエンティーナ)
  })
}

function ruby_re検証() {
  if (!オプション.ruby_re) return
  let タイプ = '--ruby-re'
  let opt_re = /^[^:]+:[^:]+:[^:]+$/
  let 区切り = ':'
  オプション.ruby_re.forEach(e => {
    if (!opt_re.test(e)) 終了(1, タイプ + ' \'正規表現' + 区切り + '単語' + 区切り + 'ルビ\': ' + e)
    // フレーズ=正規表現
    let フレーズ, 単語, ルビ, フレーズか単語re, アリエンティーナ, フレーズにアリエンティーナ
    const ruby_arr = e.split(区切り)
    フレーズ = ruby_arr[0]
    単語 = ruby_arr[1]
    ルビ = ruby_arr[2]
    if (!フレーズ.includes(単語)) 終了(1, タイプ + ' \'正規表現' + 区切り + '単語' + 区切り + 'ルビ\': 「正規表現」に「単語」を含むこと: ' + e)
    try {
      フレーズか単語re = new RegExp(フレーズ, 'g')
    } catch (err) {
      終了(1, タイプ + ': 正規表現を解釈できない: ' + フレーズ + '\n' + err)
    }
    アリエンティーナ = アリエンティーナ取得(区切り)
    アリエンティスト追加(タイプ, フレーズ, 単語, ルビ, フレーズか単語re, アリエンティーナ, フレーズにアリエンティーナ)
  })
}

function アリエンティーナ取得(区切り) {
  return 区切り + 'チョーアリエンティー' + アリエンティスト番号() + 'ナコトバッス'
}

function アリエンティスト追加(タイプ, フレーズ, 単語, ルビ, フレーズか単語re, アリエンティーナ, フレーズにアリエンティーナ) {
  let アリエンティーナre = new RegExp(アリエンティーナ, 'g')
  オプション.アリエンティスト.push({
    タイプ: タイプ,
    フレーズ: フレーズ,
    単語: 単語,
    ルビ: ルビ,
    フレーズか単語re: フレーズか単語re,
    アリエンティーナ: アリエンティーナ,
    フレーズにアリエンティーナ: フレーズにアリエンティーナ,
    アリエンティーナre: アリエンティーナre,
  })
}

function アリエンティスト番号() {
  if (!オプション.アリエンティスト) オプション.アリエンティスト = []
  return オプション.アリエンティスト.length
}


//-------------------------------------------------------------------------------

// 引数省略可

function css検証() { // nullかstringに、空文字ok
  if (オプション.css) {
    if (オプション.css.length > 1) 終了(1, '--cssオプションは1回だけ使える: ' + オプション.css.join(', '))
    if (オプション.css[0] === true) { // 引数省略: デフォルトstyleに
      if (オプション.グループ === '--add-class') {
        オプション.css = 'ruby[class$="8"]>rt{color:DarkRed;}'
      } else if (オプション.グループ === '--text-html') {
        オプション.css = ''
      } else if (オプション.グループ === '--md-html') {
        オプション.css = ''
      } else { // --html
        if (オプション.ruby_size) {
          オプション.css = 'ruby>rp,ruby>rt{font-size:' + オプション.ruby_size + 'em;}'
        } else {
          オプション.css = 'ruby>rp,ruby>rt{font-size:0.5em;}'
        }
      }
    } else {
      オプション.css = オプション.css[0]
    }
  } else { // style要素の追加なし、ただし--ruby-size
    オプション.css = null
    if (オプション.ruby_size) オプション.css = 'ruby>rp,ruby>rt{font-size:' + オプション.ruby_size + 'em;}'
  }
}

function add_class検証() { // stringに
  // この時点でオプション.add_classは配列確定
  if (オプション.add_class.length > 1) 終了(1, '--add-classオプションは1回だけ使える: ' + オプション.add_class.join(', '))
  if (オプション.add_class[0] === true) { // 引数省略の場合
    オプション.add_class = '学年'
  } else {
    オプション.add_class = オプション.add_class[0]
    let result = classtest(オプション.add_class)
    if (typeof result === 'string') 終了(1, '--add-classオプションは' + result + オプション.add_class)
  }

  function classtest(arg) { // クラス名の頭語
    if (/^([0-9]|--|-[0-9])/.test(arg)) {
      return '先頭に数字、--、-数字は不可: ' + arg
    } else if (!/^([a-zA-Z_]|[\u00a0-\uffff])/.test(arg)) {
      return '先頭に_以外の記号や数字は不可: ' + arg
    } else if (/[^a-zA-Z0-9\u00a0-\uffff_-]/.test(arg)) {
      return '_や-以外の記号は不可: ' + arg
    } else if (arg.length === 0) {
      return '空文字は不可'
    } else {
      return true
    }
  }
}

function ruby_size検証() { // Number 1.0-2.0
  if (オプション.ruby_size) {
    if (オプション.ruby_size.length > 1) 終了(1, '--ruby-sizeオプションは1回だけ使える: ' + オプション.ruby_size.join(', '))
    if (オプション.ruby_size[0] === true) { // 引数省略: デフォルト0.5
      オプション.ruby_size = 0.5
    } else {
      if (!/^(0\.[1-9]|1(\.[0-9])?|2(\.0)?)$/.test(オプション.ruby_size)) {
        終了(1, '--ruby-sizeオプションはルビのフォントサイズ(漢字に対する倍率)(0.1〜2.0): ' + オプション.ruby_size)
      }
      オプション.ruby_size = Number(オプション.ruby_size[0])
    }
  }
}


//-------------------------------------------------------------------------------

// その他

function ruby要素調整() { // --htmlの場合
  if (オプション.use_rp) {
    オプション.左括弧 = '</rb><rp>(</rp><rt>'
    オプション.右括弧 = '</rt><rp>)</rp></ruby>'
  } else {
    オプション.左括弧 = '</rb><rt>'
    オプション.右括弧 = '</rt></ruby>'
  }
}

function katakana検証() { // trueかfalse
  if (オプション.katakana) {
    オプション.katakana = true
  } else {
    オプション.katakana = false
  }
}

function comment検証() { // undefinedかstringに
  if (!オプション.comment) return
  // 実際のコマンド引数を挿入
  let コマンド = 'rubygana'
  process.argv.slice(2).forEach((item) => {
    if (item.startsWith('-')) {
      コマンド += ' ' + item
    } else {
      コマンド += ' "' + item.replace(/"/g, '\\"') + '"'
    }
  })

  const ヘルプ = require('../lib/help.js')
  const コメント = `この文書のルビ振りは下記コマンド(rubygana ${ヘルプ.バージョン})を用いました。`
  if (オプション.グループ === '--html') { // コメント中の--不可
    オプション.comment = `\n<!-- ${コメント} -->\n<pre style="display:none;"><code>\n${コマンド}\n</code></pre>\n`
  } else { // --text
    オプション.comment = '\n\n# ' + コメント + '\n# ' + コマンド
  }
}


//===============================================================================

function コマンド分岐(入力) {
  if (オプション.グループ === '--text-html') {
    require('../lib/text-html.js')(入力, オプション, (HTML) => {
      process.stdout.write(HTML)
    })
  } else if (オプション.グループ === '--md-html') {
    require('../lib/md-html.js')(入力, オプション, (HTML) => {
      process.stdout.write(HTML)
    })
  } else if (オプション.グループ === '--html') {
    require('../lib/html.js')(入力, オプション, (ルビ付き) => {
      process.stdout.write(ルビ付き)
    })
  } else if (オプション.グループ === '--text') {
    require('../lib/text.js')(入力, オプション, (ルビ付き) => {
      process.stdout.write(ルビ付き)
    })
  } else if (オプション.グループ === '--add-class') {
    require('../lib/add-class.js')(入力, オプション, (クラス付き) => {
      process.stdout.write(クラス付き)
    })
  } else if (オプション.グループ === '--readme-html') {
    readme_html(入力)
    return
  }
}

function readme_html(入力) {
  let オプション保存 = {}
  for (const prop in オプション) {
    オプション保存[prop] = オプション[prop]
  }

  function オプション初期化() {
    for (const prop in オプション) {
      delete オプション[prop]
    }
    for (const prop in オプション保存) {
      オプション[prop] = オプション保存[prop]
    }
  }
  オプション.グループ = '--md-html'
  オプション.md_html = [true]
  オプション整理検証()
  require('../lib/md-html.js')(入力, オプション, (HTML) => {
    オプション初期化()
    オプション.グループ = '--html'
    オプション.html = [true]
    オプション.ruby = [
      '不味い:ん?! マジぃ',
      '空行:くうぎょう',
      '冒頭行:行:ぎょう',
      '粒度:りゅうど',
      '文科省:もんかしょう',
      '空:から',
    ]
    オプション.ruby_re = [
      '[0-9一二三四五]行:行:ぎょう',
      '行(ごと|毎):行:ぎょう',
      '行[をはが]:行:ぎょう',
    ]
    オプション.comment = [true]
    オプション整理検証()
    require('../lib/html.js')(HTML, オプション, (ルビ付き) => {
      オプション初期化()
      オプション.グループ = '--add-class'
      オプション.add_class = [true]
      オプション.switch = [true]
      オプション.css = ['body {font-size: 1.8em;} code{background-color:#cccccc;}']
      オプション整理検証()
      require('../lib/add-class.js')(ルビ付き, オプション, (クラス付き) => {
        process.stdout.write(クラス付き)
        オプション初期化()
      })
    })
  })
}
