#!/usr/bin/env node

/*!
 *  rubygana
 *
 *  MIT License
 *  ©  2018 ころん:すとりーむ
 */

'use strict'

//===============================================================================
//-------------------------------------------------------------------------------

// コマンドオプションの定義と解析

const 引数あり = [
  ['-b', '--brackets'],
  ['-g', '--grade'],
  ['-G', '--granularity'],
  ['-s', '--selector'],
  ['-n', '--not-selector'],
  ['-N', '--ng-elements'],
  ['-T', '--title'],
  ['-L', '--headline'],
  //
  ['-r', '--ruby'],
]
const 引数なし = [
  ['-d', '--debug'],
  ['-h', '--help'],
  ['-v', '--verbose'],
  ['-V', '--version'],
  ['-ら', '--ライセンス'],
  ['-い', '--依存'],
  ['-☺', '--感謝'],
  // コマンドグループ 
  ['-H', '--html'],
  ['-t', '--text'],
  ['-m', '--md-html'],
  ['-w', '--text-html'],
  ['-A', '--sample-text'],
  ['-B', '--sample-html'],
  ['-M', '--sample-md'],
  //
  ['-y', '--only-body'],
  ['-C', '--comment'],
  ['-K', '--katakana'],
  ['-p', '--use-rp'],
  ['--ruby-comma'],
]
const 引数省略可 = [
  ['-a', '--add-class'],
  ['-c', '--css'],
  ['-R', '--ruby-size'],
]
const 排他的 = [
  // コマンドグループ
  ['--html', '--text', '--add-class', '--md-html', '--text-html', '--sample-md', '--sample-text', '--sample-html'],
  // --htmlや--textを省略して自動判別にした場合、不要なオプションは無視
  ['--html', '--headline'],
  ['--html', '--ruby'],
  ['--html', '--ruby-comma'],
  //
  ['--text', '--selector'],
  ['--text', '--not-selector'],
  ['--text', '--ng-elements'],
  ['--text', '--css'],
  ['--text', '--title'],
  ['--text', '--use-rp'],
  ['--text', '--headline'],
  ['--text', '--only-body'],
  ['--text', '--ruby-size'],
  //
  ['--add-class', '--brackets'],
  ['--add-class', '--grade'],
  ['--add-class', '--granularity'],
  ['--add-class', '--ng-elements'],
  ['--add-class', '--title'],
  ['--add-class', '--comment'],
  ['--add-class', '--katakana'],
  ['--add-class', '--use-rp'],
  ['--add-class', '--headline'],
  ['--add-class', '--ruby-size'],
  ['--add-class', '--ruby'],
  ['--add-class', '--ruby-comma'],
  //
  ['--md-html', '--brackets'],
  ['--md-html', '--grade'],
  ['--md-html', '--granularity'],
  ['--md-html', '--selector'],
  ['--md-html', '--not-selector'],
  ['--md-html', '--ng-elements'],
  ['--md-html', '--comment'],
  ['--md-html', '--katakana'],
  ['--md-html', '--use-rp'],
  ['--md-html', '--only-body'],
  ['--md-html', '--ruby-size'],
  ['--md-html', '--ruby'],
  ['--md-html', '--ruby-comma'],
  //
  ['--text-html', '--brackets'],
  ['--text-html', '--grade'],
  ['--text-html', '--granularity'],
  ['--text-html', '--selector'],
  ['--text-html', '--not-selector'],
  ['--text-html', '--ng-elements'],
  ['--text-html', '--comment'],
  ['--text-html', '--katakana'],
  ['--text-html', '--use-rp'],
  ['--text-html', '--only-body'],
  ['--text-html', '--ruby-size'],
  ['--text-html', '--ruby'],
  ['--text-html', '--ruby-comma'],
  // --only-body: --commentは出力ok
  ['--only-body', '--ruby-size'],
  ['--only-body', '--css'],
  ['--only-body', '--title'],
  // --sample-md, --sample-text, --sample-html, --helpなどは、他のオプションをあっても無視
]


/* 例:
検証前オプション:
{ html: [ true ],
  'オペランド': [ 'README.md' ],
  debug: [ true, true ],
  '標準入力': false }
検証後オプション:
{ html: [ true ],
  'オペランド': [ 'README.md' ],
  debug: [ true, true ],
  '標準入力': false,
  'グループ': '--html',
  '左括弧': '(',
  '右括弧': ')',
  '未指定':
   [ '--brackets',
     '--grade',
     '--granularity',
     '--comment',
     '--katakana',
     '--selector',
     '--not-selector',
     '--ng-elements',
     '--title',
     '--ruby-size',
     '--css',
     '--use_rp' ],
  grade: 0,
  granularity: 0,
  katakana: false,
  selector: 'body',
  not_selector: 'ruby,script,style,code,pre,samp,blockquote',
  ng_elements: 'ruby|script|style|code|pre|samp|blockquote',
  css: null,
  use_rp: false,
  '末尾改行': true }
*/


//===============================================================================
//-------------------------------------------------------------------------------

// オプションと標準入力の総合検証、コマンド分岐

const オプションと標準入力 = require('./オプションと標準入力.js')
const オプション = オプションと標準入力.オプション解析(引数あり, 引数なし, 引数省略可, 排他的)

オプションと標準入力.標準入力(コールバック).then((標準入力) => {
  if (標準入力 === undefined) { // 標準入力なし
    オプション.標準入力 = false
  } else if (標準入力 === '') { // 空文字 例: echo -n
    オプション.標準入力 = null
  } else { // 標準入力あり
    オプション.標準入力 = true
  }
  const 入力 = オプションと標準入力の総合検証(標準入力)
  if (!入力) {
    終了()
  }
  if (オプション.debug && オプション.debug.length > 1) { // -ddでkuromoji実行しない
    終了()
  }
  コマンド分岐(入力)
}).catch((e) => {
  終了(99, e)
})

function コールバック(data) {
  if (オプション.debug && (オプション.verbose && オプション.verbose.length > 2)) {
    process.stdout.write('標準入力: ' + data)
  }
}


//-------------------------------------------------------------------------------

function 終了(終了ステータス = 0, 表示 = '') {
  if (終了ステータス !== 0) {
    console.error('エラー: ' + 表示, '\nコマンドヘルプ: --help')
  } else if (表示 !== '') {
    console.log(表示)
  }
  if (オプション.debug) {
    console.log('終了時オプション(終了ステータス' + 終了ステータス + '):')
    console.log(オプション)
  }
  process.exit(終了ステータス)
}


//===============================================================================
//-------------------------------------------------------------------------------

function オプションと標準入力の総合検証(標準入力) {
  if (オプション.debug) {
    console.log('検証前オプション:')
    console.log(オプション)
  }
  // 不正オプション
  if (オプション.不明) {
    終了(1, '不明なオプション: ' + オプション.不明)
  }
  if (オプション.曖昧) {
    終了(1, '曖昧なオプション: ' + オプション.曖昧[0]) // とりあえず1グループだけ
  }
  if (オプション.引数必須) {
    終了(1, '引数必須のオプション: ' + オプション.引数必須)
  }
  if (オプション.排他的) {
    終了(1, '互いに排他的なオプション: ' + オプション.排他的[0]) // とりあえず1グループだけ
  }

  // 標準入力かオペランド(ファイル)かどちらかのみ
  if (オプション.オペランド && オプション.標準入力) {
    終了(1, '標準入力とファイル指定はどちらかのみ: ' + オプション.オペランド)
  }

  // オペランド(ファイル)あるなら一つだけ
  if (オプション.オペランド && オプション.オペランド.length > 1) {
    終了(1, 'ファイル指定が複数ある: ' + オプション.オペランド)
  }

  // 単独オプションで終了
  if (オプション.help) {
    helpオプション()
  }
  if (オプション.version) {
    versionオプション()
  }
  if (オプション.依存) {
    依存オプション()
  }
  if (オプション.ライセンス) {
    ライセンスオプション()
  }
  if (オプション.感謝) {
    感謝オプション()
  }
  if (オプション.sample_html) {
    sample_htmlオプション()
  }
  if (オプション.sample_text) {
    sample_textオプション()
  }
  if (オプション.sample_md) {
    sample_mdオプション()
  }

  let 入力
  if (オプション.標準入力) {
    入力 = 標準入力
  } else if (オプション.オペランド) {
    入力 = ファイル読込(オプション.オペランド[0])
  }
  //
  コマンドグループの判定(入力)
  オプション整理検証()
  if (!入力) {
    return
  }

  // 末尾改行一つあれば、最後に追加
  if (/\n$/.test(入力)) {
    オプション.末尾改行 = true
  } else {
    オプション.末尾改行 = false
  }

  return 入力.trim() // 前後空白削除
}

function ファイル読込(ファイル) {
  const fs = require('fs')
  try {
    return fs.readFileSync(ファイル, 'utf8')
  } catch (e) {
    if (/^-.*$/.test(ファイル)) {
      終了(2, 'ファイルを開けない: オプション名の間違い?: ' + ファイル)
    } else {
      終了(2, 'ファイルを開けない: ' + ファイル)
    }
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

function 感謝オプション() {
  終了(0, 'どういたしまして☺')
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
  } else if (入力 && たぶんhtml.test(入力.trim())) { // 自動判別: タグの有無で判断
    オプション.グループ = '--html'
  } else {
    オプション.グループ = '--text'
  }
}


//===============================================================================
//-------------------------------------------------------------------------------

function オプション整理検証() {
  if (オプション.グループ === '--html' || オプション.グループ === '--text') {
    brackets検証()
    grade検証()
    granularity検証()
    comment検証()
    katakana検証()
    if (オプション.グループ === '--html') {
      selector検証()
      not_selector検証()
      ng_elements検証()
      title検証()
      ruby_size検証() // cssより先
      css検証()
      use_rp検証()
    } else {
      ruby検証()
    }
  } else if (オプション.グループ === '--add-class') {
    add_class検証()
    selector検証()
    not_selector検証()
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
    if (オプション.brackets.length > 1) {
      終了(1, '--bracketsオプションは1回だけ使える: ' + オプション.brackets.join(', '))
    }
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
    if (オプション.grade.length > 1) {
      終了(1, '--gradeオプションは1回だけ使える: ' + オプション.grade.join(', '))
    }
    オプション.grade = オプション.grade[0]
    if (!/^[0-7]$/.test(オプション.grade)) {
      終了(1, '--gradeオプションは0-7の数: ' + オプション.grade)
    }
    オプション.grade = Number(オプション.grade)
  } else {
    オプション.grade = 0
  }
}

function granularity検証() { // 0-2に
  if (オプション.granularity) {
    if (オプション.granularity.length > 1) {
      終了(1, '--granularityオプションは1回だけ使える: ' + オプション.granularity.join(', '))
    }
    オプション.granularity = オプション.granularity[0]
    if (!/^[0-2]$/.test(オプション.granularity)) {
      終了(1, '--granularityオプションは0-2の数: ' + オプション.granularity)
    }
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
  } else {
    if (オプション.グループ === '--add-class') {
      オプション.not_selector = ''
    } else { // --html
      オプション.not_selector = 'ruby,script,style,code,pre,samp,blockquote'
    }
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
    if (オプション.title.length > 1) {
      終了(1, '--titleオプションは1回だけ使える: ' + オプション.title.join(', '))
    }
    オプション.title = オプション.title[0]
  }
}

function headline検証() { // undefinedかstringに, 空文字ok
  if (オプション.headline) {
    if (オプション.headline.length > 1) {
      終了(1, '--headlineオプションは1回だけ使える: ' + オプション.headline.join(', '))
    }
    オプション.headline = オプション.headline[0]
  }
}

function ruby検証() {
  let ruby_re, フレーズありre, split
  if (オプション.ruby_comma) {
    ruby_re = /^[^,]+,[^,]+(,[^,]+)?$/
    フレーズありre = /^[^,]+,[^,]+,[^,]+$/
    split = ','
  } else {
    ruby_re = /^[^:]+:[^:]+(:[^:]+)?$/
    フレーズありre = /^[^:]+:[^:]+:[^:]+$/
    split = ':'
  }
  if (オプション.ruby) {
    オプション.ruby_re = []
    オプション.ruby.forEach((e, i) => {
      // 検証
      if (!ruby_re.test(e)) {
        終了(1, '--ruby \'フレーズ:単語:ルビ\': 「フレーズ:」は省略可。,区切りなら--ruby-commaも: ' + e)
      }
      if (フレーズありre.test(e)) {
        const フレーズ = e.split(split)[0]
        const 単語 = e.split(split)[1]
        if (!フレーズ.includes(単語)) {
          終了(1, '--ruby \'フレーズ' + split + '単語' + split + 'ルビ\': 「フレーズ」に「単語」を含むこと: ' + e)
        }
      }
      オプション.ruby[i] = e.split(split) // 要素数3ならフレーズあり

      // 変換し、後で戻すための正規表現
      const アリエンティー = 'チョーアリエンティー' + i + 'ナコトバッス'
      オプション.ruby_re[i] = []
      オプション.ruby_re[i].push(new RegExp(オプション.ruby[i][0], 'g')) // フレーズか単語
      オプション.ruby_re[i].push(new RegExp(アリエンティー, 'g'))
    })
  }
}


//-------------------------------------------------------------------------------

// 引数省略可

function css検証() { // nullかstringに、空文字ok
  if (オプション.css) {
    if (オプション.css.length > 1) {
      終了(1, '--cssオプションは1回だけ使える: ' + オプション.css.join(', '))
    }
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
    if (オプション.ruby_size) {
      オプション.css = 'ruby>rp,ruby>rt{font-size:' + オプション.ruby_size + 'em;}'
    }
  }
}

function add_class検証() { // stringに
  // この時点でオプション.add_classは配列確定
  if (オプション.add_class.length > 1) {
    終了(1, '--add-classオプションは1回だけ使える: ' + オプション.add_class.join(', '))
  }
  if (オプション.add_class[0] === true) { // 引数省略の場合
    オプション.add_class = '学年'
  } else {
    オプション.add_class = オプション.add_class[0]
    let result = classtest(オプション.add_class)
    if (typeof result === 'string') {
      終了(1, '--add-classオプションは' + result + オプション.add_class)
    }
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
    if (オプション.ruby_size.length > 1) {
      終了(1, '--ruby-sizeオプションは1回だけ使える: ' + オプション.ruby_size.join(', '))
    }
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

function katakana検証() { // trueかfalse
  if (オプション.katakana) {
    オプション.katakana = true
  } else {
    オプション.katakana = false
  }
}

function use_rp検証() { // trueかfalse
  if (オプション.use_rp) {
    オプション.use_rp = true
  } else {
    オプション.use_rp = false
  }
}

function comment検証() { // undefinedかstringに
  if (オプション.comment) {
    const ヘルプ = require('../lib/help.js')
    const コメント1 = `<!-- この文書のルビ振りは下記コマンド(rubygana ${ヘルプ.バージョン})を用いました。`
    const コメント3 = '-->'
    let temp = 'rubygana'
      // 実際のコマンド引数を挿入
    process.argv.slice(2).forEach((item) => {
      if (item.startsWith('-')) {
        temp += ' ' + item
      } else {
        temp += ' \'' + item + '\''
      }
    })
    temp = `
${コメント1}
${temp}
${コメント3}
`
    オプション.comment = temp
  }
}


//===============================================================================
//-------------------------------------------------------------------------------

function コマンド分岐(入力) {
  let 末尾 = ''
  if (オプション.末尾改行) {
    末尾 = '\n'
  }
  if (オプション.グループ === '--text-html') {
    require('../lib/text-html.js')(入力, オプション, (HTML) => {
      process.stdout.write(HTML + 末尾)
      終了()
    })
  }
  if (オプション.グループ === '--md-html') {
    require('../lib/md-html.js')(入力, オプション, (マークダウン) => {
      process.stdout.write(マークダウン + 末尾)
      終了()
    })
  }
  if (!入力.trim()) {
    終了()
  }
  if (オプション.グループ === '--html') {
    require('../lib/html.js')(入力, オプション, (ルビ付き) => {
      process.stdout.write(ルビ付き + 末尾)
      終了()
    })
  } else if (オプション.グループ === '--text') {
    require('../lib/text.js')(入力, オプション, (ルビ付き) => {
      process.stdout.write(ルビ付き + 末尾)
      終了()
    })
  } else if (オプション.グループ === '--add-class') {
    require('../lib/add-class.js')(入力, オプション, (クラス付き) => {
      process.stdout.write(クラス付き + 末尾)
      終了()
    })
  }
}

//===============================================================================
