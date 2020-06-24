/*!
 *  rubygana
 *
 *  MIT License
 *  ©  2018 ころん:すとりーむ
 */

'use strict'

// index0-5が小1-6、6が残り常用漢字
const 学年別漢字 = require('./学年別漢字.js')

/*
Unicodeブロック
ひらがな 3040-309f
カタカナ 30a0-30ff
半角全角 ff00-ffef
CJK統合漢字 4e00-9fff
CJK統合漢字拡張A 3400-4dbf

𠮟 20b9f (CJK統合漢字拡張B) 常用漢字表
*/

const 漢字以外の日本語だけ = '\u3040-\u30ff\uff00-\uffef'
const 漢字以外の日本語だけ表現 = new RegExp('^[' + 漢字以外の日本語だけ + ']+$')
const 漢字 = '\u4e00-\u9fff𠮟々'
const 日本語表現 = new RegExp('^[' + 漢字以外の日本語だけ + 漢字 + ']+$')
const 漢字一字表現 = new RegExp('([' + 漢字 + ']{1})')

module.exports = class ルビ {
  constructor(元のテキスト = '', kuromoji解析json = [], オプション) {
    this.元のテキスト = 元のテキスト
    this.kuromoji解析json = kuromoji解析json
    this.option = オプション
    if (this.option.グループ === '--html') {
      this.option.始まり = '<ruby><rb>'
    } else {
      this.option.始まり = ''
    }
    this.ルビ除外漢字表現作成()
    this.ルビ付き = ''
    this.ルビ処理()
  }

  ルビ除外漢字表現作成() {
    let 学習済み漢字 = ''
    for (let i = 0; i < this.option.grade; i++) {
      学習済み漢字 += 学年別漢字[i]
    }
    // カタカナ、記号、踊り字のある単語例: 「オックスフォード大学」「人々」「小・中学校」
    //    this.学年超漢字表現 = new RegExp('[^ぁ-ゔァ-ヴー々・＝' + 学習済み漢字 + ']')
    this.学習済み表現 = new RegExp('^[' + 漢字以外の日本語だけ + 学習済み漢字 + ']+$')
  }

  ルビ処理() {
    //const 非漢字表現 = /^[ぁ-ゔァ-ヴａ-ｚＡ-Ｚ０-９ー、。・＝]+$/
    this.kuromoji解析json.forEach((要素) => {
      if (要素.word_type === 'UNKNOWN' || 要素.pos === '記号' ||
        漢字以外の日本語だけ表現.test(要素.surface_form)) { // ひらがなとか
        this.ルビ付き += 要素.surface_form
      } else if (this.学習済み表現.test(要素.surface_form)) {
        this.ルビ付き += 要素.surface_form
        if (this.option.debug && this.option.verbose && this.option.verbose.length > 2) {
          let 漢字arr = 要素.surface_form.split(漢字一字表現)
          let 学年 = ''
          漢字arr.forEach((item) => {
            if (!item) return
            for (let i = 0; i < 学年別漢字.length; i++) {
              if (学年別漢字[i].includes(item)) 学年 += (i + 1) + ' '
            }
          })
          console.log('__学年__: ' + 学年, 要素.surface_form, '\n')
        }
      } else if (日本語表現.test(要素.surface_form)) { // 学年超が1文字でもあったら
        this.ルビ付き += this.漢字仮名交じりルビ(要素.surface_form, 要素.reading)
      } else { // TODO 拡張漢字やその他文字
        this.ルビ付き += 要素.surface_form
        if (this.option.debug && this.option.verbose && this.option.verbose.length > 2) {
          console.log('####### TODO 拡張漢字やその他文字でKNOWN:', 要素.surface_form)
        }
      }
    });
  }

  漢字仮名交じりルビ(漢字仮名, ルビ) {
    const 始まり = this.option.始まり
    const 左括弧 = this.option.左括弧
    const 右括弧 = this.option.右括弧

    // そのまま粒度
    if (this.option.granularity === 2) {
      if (this.option.katakana) {
        return 始まり + 漢字仮名 + 左括弧 + ルビ + 右括弧
      } else {
        return 始まり + 漢字仮名 + 左括弧 + ひらがなへ(ルビ) + 右括弧
      }
    }

    // 漢字をX、その他をyとすると、7パターンか
    // X(先日)、Xy(立つ)、yX(お盆)、yXy(お返し)、yXyX(お立ち台)、XyXy(差し出がましい)、yXyXy(お気に入り)
    // まず、語頭語尾のyを除く。
    let 語頭 = ''
    let 語頭表現 = /^([ぁ-ゔァ-ヴー・＝]+)/
    let 語尾 = ''
    let 語尾表現 = /([ぁ-ゔァ-ヴー・＝]+)$/
    if (語頭表現.test(漢字仮名)) 語頭 = 漢字仮名.split(語頭表現)[1] // 0は空
    if (語尾表現.test(漢字仮名)) 語尾 = 漢字仮名.split(語尾表現)[1]
    // 解析対象
    let 漢字かな = 漢字仮名.slice(語頭.length, 漢字仮名.length - 語尾.length)
    let 語頭語尾除いたルビ = ルビ.slice(語頭.length, ルビ.length - 語尾.length)

    // 漢字だけや間に記号、7パターンを超えるものはここで落とす。「小・中学校」
    let 例外パターン = /[ぁ-ゔァ-ヴー・＝]*([^ぁ-ゔァ-ヴー・＝]+[ぁ-ゔァ-ヴー・＝]+){2}[^ぁ-ゔァ-ヴー・＝]+[ぁ-ゔァ-ヴー・＝]*/
    if (this.option.granularity === 1 || !/[ぁ-ゔァ-ヴ]/.test(漢字かな) || 例外パターン.test(漢字かな)) {
      return 粒度1(this.option.katakana)
    }

    function 粒度1(カタカナなの) {
      if (カタカナなの) return 語頭 + 始まり + 漢字かな + 左括弧 + 語頭語尾除いたルビ + 右括弧 + 語尾
      return 語頭 + 始まり + 漢字かな + 左括弧 + ひらがなへ(語頭語尾除いたルビ) + 右括弧 + 語尾
    }

    // 「真ん中」の「ん」をルビから除く
    // 間にカタカナの単語「聖マリアンナ医科大学」もルビも平仮名にして分析
    let るび = ひらがなへ(語頭語尾除いたルビ)
    let 真ん中かな表現 = /^[^ぁ-ゔァ-ヴ・ー＝]+([ぁ-ゔァ-ヴ・ー＝]+)[^ぁ-ゔァ-ヴ・ー＝]+$/
    let 真ん中かな = ひらがなへ(漢字かな.split(真ん中かな表現)[1])

    // テキストがXyXでルビがayyaやayayaで、どちらのyがルビか判定できないなら、落とす
    if (new RegExp('(' + 真ん中かな + '.*){2,}').test(るび.slice(1, -1))) { // 前後1字は削ってテスト
      return 粒度1(this.option.katakana)
    }

    // 粒度0
    let 前漢字表現 = /^([^ぁ-ゔァ-ヴ・ー＝]+)[ぁ-ゔァ-ヴ・ー＝]+[^ぁ-ゔァ-ヴ・ー＝]+$/
    let 後漢字表現 = /^[^ぁ-ゔァ-ヴ・ー＝]+[ぁ-ゔァ-ヴ・ー＝]+([^ぁ-ゔァ-ヴ・ー＝]+)$/
    let 前漢字, 後漢字, 前ルビ, 後ルビ
    前ルビ = るび.slice(0, 1) + るび.slice(1, -1).split(真ん中かな)[0] //XyXがyaya に対応
    後ルビ = るび.slice(1, -1).split(真ん中かな)[1] + るび.slice(-1) // XyXがayay に対応
    前漢字 = 漢字かな.split(前漢字表現)[1]
    後漢字 = 漢字かな.split(後漢字表現)[1]
    if (this.option.katakana) {
      前ルビ = カタカナへ(前ルビ)
      後ルビ = カタカナへ(後ルビ)
    }
    return 語頭 + 始まり + 前漢字 + 左括弧 + 前ルビ + 右括弧 +
      漢字かな.split(真ん中かな表現)[1] +
      始まり + 後漢字 + 左括弧 + 後ルビ + 右括弧 + 語尾

    function ひらがなへ(文字列) {
      return 文字列.replace(/[ァ-ヴ]/g, (カタカナ) => {
        return String.fromCharCode(カタカナ.charCodeAt(0) - 96);
      });
    }

    function カタカナへ(文字列) {
      return 文字列.replace(/[ぁ-ゔ]/g, (ひらがな) => {
        return String.fromCharCode(ひらがな.charCodeAt(0) + 96);
      });
    }
  }

  ログ() {
    let verbose = this.option.verbose
    if (this.option.verbose && this.option.verbose.length > 0) {
      console.log('-----元のテキスト=====', '\n' + this.元のテキスト)
      console.log('-----ルビ付き', '\n' + this.ルビ付き)
    }
    if (this.option.verbose && this.option.verbose.length > 1) {
      console.log('-----kuromojiの解析\n', this.kuromoji解析json, '\n')
    }
  }
}

const _kuromoji_json例 = [{
  word_id: 247920,
  word_type: 'KNOWN', // KNOWN|UNKNOWN
  word_position: 1, // 1スタート。,,など記号連続が一文字扱いになったり?
  surface_form: '不思議',
  pos: '名詞', // pos '名詞|助詞|記号|連体詞|動詞|助動詞|形容詞|接続詞|副詞|接頭詞|フィラー'
  pos_detail_1: '形容動詞語幹',
  pos_detail_2: '*',
  pos_detail_3: '*',
  conjugated_type: '*',
  conjugated_form: '*',
  basic_form: '不思議',
  reading: 'フシギ',
  pronunciation: 'フシギ'
}]
