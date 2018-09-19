/*!
 *  オプションと標準入力.js 0.2.1
 *
 *  MIT License
 *  ©  2018 ころん:すとりーむ
 */

'use strict'

//-------------------------------------------------------------------------------

module.exports.標準入力 = 標準入力

function 標準入力(コールバック, 設定) {
  /* 未指定ならデフォルト値 TODO
  設定 = {
    stdin: true,
    epipe: true,
    encoding: 'utf8',
    lang: (process.env.LANG && process.env.LANG.startsWith('ja_JP')) ? 'ja_JP' : 'C'
  }
  */
  const conf = 設定 === undefined ? {} : 設定
  conf.stdin = conf.stdin === undefined ? true : void(0)
  conf.epipe = conf.epipe === undefined ? true : void(0)
  conf.encoding = conf.encoding === undefined ? 'utf8' : void(0)
  if (conf.lang === undefined) {
    conf.lang = (process.env.LANG && process.env.LANG.startsWith('ja_JP')) ? 'ja_JP' : 'C'
  }

  // TODO パイプで次のコマンドが途中で受取拒否 Error: write EPIPE
  // 例: mycommand | head -n 0
  if (conf.epipe === true) {
    process.stdout.on('error', (error) => {
      if (error.code === 'EPIPE') {
        process.exit(0)
      }
      throw error.code
    })
  }

  return new Promise((resolve, reject) => {
    let stdin = ''
    if (process.stdin.isTTY) { // 標準入力がない
      resolve()
    } else if (conf.stdin !== true) { // 標準入力不要なのに、あった場合
      resolve(true)
    } else { // 空文字「echo -n ''」も含めて標準入力あり
      process.stdin.resume()
      process.stdin.setEncoding(conf.encoding)
      process.stdin.on('data', (data) => {
        if (typeof コールバック === 'function') {
          コールバック(data)
        }
        stdin += data
      }).on('end', () => {
        resolve(stdin)
      })
    }
  })
}


//-------------------------------------------------------------------------------

module.exports.オプション解析 = オプション解析

/*
 * 特徴:
 * 引数あり・なし・省略可の3種類のオプションリストと、排他的リストを指定
 *
 * [オプション形式]
 * ロング形: --から始まる。--name, --long-name など(予約語あり)
 * 一文字形: -に加えて一文字。-a, -あ など
 * 短縮形(自動判別): ロング形式を前半3文字以上に短縮したもの。--nameを--naなど
 * 短縮形の曖昧さ:先にマッチ優先(引数あり・なし、省略可の順で)。曖昧プロパティに情報。
 * 連綿形(自動判別): 一文字形を-の後に連ねたもの。-a,-b,-cを-abcなど
 * 引数のあるものは末尾のみ
 *
 * [オプション引数]
 * 引数あり: 次にくる引数が-から始まるものも、オプション引数とみなす
 * 引数省略可: 次の引数が-から始まれば、省略とみなす
 *
 * [オペランド]
 * オプションでもその引数でもないものか、
 * ただの「--」を指定したら、それ以降のすべての引数
 *
 * [標準入力希望]
 * ただの「-」の指定
 *
 * [オプションのプロパティ]
 * プロパティ名: ロング形・一文字形で最長のもの(前半-を削り、途中-を_に変換)
 * データ型: Array。下記を格納。
 *  - 引数: string
 *  - 引数なし・省略: true
 *  - 引数ありを末尾引数にすると: undefined
 * 他に予約語プロパティに情報を格納
 *
 */
function オプション解析(引数あり = [], 引数なし = [], 引数省略可 = [], 排他的 = []) {

  //++++++++++++++++++++++++++++++++++++++++++++++

  // 引数あり, 引数なし, 引数省略可は、それぞれオプションリスト
  const オプションリスト例 = [
    // Array
    ['-o', '--output'], // --oなど短縮形は自動
    ['-V', '--version', '--バージョン', '-ば'], // いくつでも
    // 別名がないならstringも可
    '-a',
  ]
  const 排他的例 = [
    // Arrayのみ
    ['--group-a', '--group-b', '--group-b'], // コマンドグループ
    //
    ['--group-a', '--output'],
    ['--group-a', '-a'],
    ['--help', '--version', '--debug'],
  ]

  // プロパティ名使用のため'--標準入力'などのオプション名は禁止
  const 予約語 = [
    'オペランド希望', // 引数「--」を使用: true
    '標準入力希望', // 引数「-」を使用: trueのArray
    'オペランド', // オプションでもその引数でもないもの: Array
    '未指定', // 定義オプションで未指定のもの: Array
    '引数必須', // 引数必須なのに未指定のもの: Array
    '引数省略', // 引数省略可で省略したもの: Array
    '不明', // 定義にないオプション: Array
    '曖昧', // 短縮形に曖昧さがあるオプション: Array(の中にArray)
    '排他的', // 排他的なのに使用したもの: Array(の中にArray)
    'グループ', // コマンドグループ(他関数で)
    '標準入力', // 標準入力の有無など(他関数で)
  ]

  //++++++++++++++++++++++++++++++++++++++++++++++

  引数1から3の検証(引数あり, 引数なし, 引数省略可)

  function 引数1から3の検証(...arr) {
    const msg1 = 'コマンドオプション解析()の引数'
    const msg2 = ': 配列[配列[文字列]]か、配列[文字列]かのみ'
    const msg3 = '予約語のため定義不可のオプション名: '
    arr.forEach((オプションリスト, i) => {
      if (!Array.isArray(オプションリスト)) {
        throw msg1 + (i + 1) + msg2
      }
      オプションリスト.forEach((e) => {
        if (!Array.isArray(e) && typeof e !== 'string') {
          throw msg1 + (i + 1) + msg2
        }
        if (Array.isArray(e)) {
          e.forEach(str => {
            if (typeof str !== 'string') {
              throw msg1 + (i + 1) + msg2
            } else {
              if (予約語.includes(str.replace(/-/g, '_').replace(/^_+/, ''))) {
                throw msg3 + str
              }
            }
          })
        } else if (typeof e !== 'string') {
          throw msg1 + (i + 1) + msg2
        } else {
          if (予約語.includes(e.replace(/-/g, '_').replace(/^_+/, ''))) {
            throw msg3 + e
          }
        }
      })
    })
  }

  const 全オプションリスト = 引数あり.concat(引数なし, 引数省略可)
  引数4の検証()

  function 引数4の検証() {
    排他的.forEach(e => {
      if (!Array.isArray(e)) {
        throw 'コマンドオプション解析()の引数4(排他的リスト): 配列[配列[文字列]]のみ'
      }
      e.forEach(str => {
        if (!オプションなら最長オプション名(全オプションリスト, str)) { // 定義にないオプションが混ざっている
          throw 'コマンドオプション解析()の引数4(排他的リスト)にオプション定義にないもの: ' + str
        }
      })
    })
  }

  //++++++++++++++++++++++++++++++++++++++++++++++

  // 連綿オプション: 短縮形(-aなど)を-abcdのように複数連ねたケース
  // 引数あるものは必ず末尾
  // 必須x なしa 省略可b とすると
  // -ab -ba -ax -abx
  const a = get連綿str(引数なし, 引数省略可)
  const 引数あり連綿str = get連綿str(引数あり)
  const 連綿オプションre = new RegExp('^-([' + a + ']{2,}|[' + a + ']+[' + 引数あり連綿str + '])$')

  function get連綿str(...オプション定義) {
    const 一文字形re = /^-[^- ]$/
    let str = ''
    オプション定義.forEach(e => {
      e.forEach(e => {
        if (Array.isArray(e)) {
          e.forEach(e => {
            if (一文字形re.test(e)) {
              str += e.slice(1)
            }
          })
        } else {
          if (一文字形re.test(e)) {
            str += e.slice(1)
          }
        }
      })
    })
    return str
  }

  //++++++++++++++++++++++++++++++++++++++++++++++

  // オプションやその引数を格納していく
  const option = {}

  // 2以降が実際のコマンド引数
  const 引数 = process.argv.slice(2)

  let 飛ばす = false
  let オペランド希望 = false
  引数.forEach((e, i) => {

    // オプションに付けた引数の場合
    if (飛ばす) {
      飛ばす = false
      return // 次の引数へ
    }

    // 引数「--」以降の引数はすべてオペランド扱い
    if (!オペランド希望 && e === '--') {
      オペランド希望 = true
      option.オペランド希望 = true
      return // 次の引数へ
    }
    //
    if (オペランド希望) {
      option.オペランド === undefined ? option.オペランド = [e] : option.オペランド.push(e)
      return // 次の引数へ
    }

    // 引数「-」は標準入力希望
    if (e === '-') {
      option.標準入力希望 === undefined ? option.標準入力希望 = [true] : option.標準入力希望.push(true)
      return // 次の引数へ
    }

    // 曖昧オプションなら、先にマッチしたもので確定(引数の有無等では判定しない)
    const 曖昧か = 曖昧オプション(全オプションリスト, e)
    if (曖昧か) {
      e = 曖昧か
    }
    // 以降、曖昧なしとして進む

    // 引数ありオプション
    const 引数ありか = オプションなら格納(e, i)
    if (引数ありか === true) { // 正しく格納
      飛ばす = true
      return // 次の引数へ 飛ばす
    } else if (引数ありか === null) { // 引数ありなのに無い
      return // 次の引数へ 飛ばさない
    }

    // 引数なしオプション単独
    if (オプションなら格納(e)) {
      return // 次の引数へ
    }

    // 連綿オプション
    if (連綿オプションre.test(e)) { // 引数ありは連綿末尾保証
      e.slice(1).split('').forEach((c, 連綿インデックス) => {
        const ハイフン付き = '-' + c
          // 引数なし
        if (オプションなら格納(ハイフン付き)) {
          return // 次の連綿へ
        }
        // 引数あり(連綿末尾保証)
        const 引数ありか = オプションなら格納(ハイフン付き, i)
        if (引数ありか === true) { // 正しく格納
          飛ばす = true
          return
        } else if (引数ありか === null) { // 引数ありなのに無い
          return // 飛ばさない
        }
        // 引数省略可
        if (e.length === (連綿インデックス + 2) && !次はオプションの引数じゃないね(引数[i + 1])) {
          // 連綿の末尾(-abcdのd)かつ省略せず
          オプションなら格納(ハイフン付き, i, true)
          飛ばす = true
        } else { // 省略
          オプションなら格納(ハイフン付き, undefined, true)
        }
      })
      return // 次の引数へ
    }

    // 引数を省略可能なオプション(次の引数が-から始まれば省略とみなす)
    if (次はオプションの引数じゃないね(引数[i + 1])) { // 末尾引数も
      if (オプションなら格納(e, undefined, true)) {
        return // 次の引数へ
      }
    } else { // 省略しなかった場合
      if (オプションなら格納(e, i, true)) {
        飛ばす = true
        return // 次の引数へ
      }
    }

    // 不明なオプション
    if (e.startsWith('-')) {
      option.不明 === undefined ? option.不明 = [e] : option.不明.push(e)
      return // 次の引数へ
    }

    // オプションでもその引数でもないもの(オペランド)
    option.オペランド === undefined ? option.オペランド = [e] : option.オペランド.push(e)
  })

  //++++++++++++++++++++++++++++++++++++++++++++++

  function オプションなら格納(e, i, 省略可能か) {
    let name
    if (省略可能か) {
      name = オプションなら最長オプション名(引数省略可, e)
    } else if (i === undefined) { // 引数なし
      name = オプションなら最長オプション名(引数なし, e)
    } else { // 引数あり
      name = オプションなら最長オプション名(引数あり, e)
    }
    if (!name) { // オプションでない
      return undefined // 格納なし
    }

    const prop = name.replace(/-/g, '_').replace(/^_+/, '')
    if (i === undefined && 省略可能か === undefined) { // 引数なし
      option[prop] === undefined ? option[prop] = [true] : option[prop].push(true)
    } else if (省略可能か) {
      if (i === undefined) { // 省略
        option.引数省略 ? option.引数省略.push(name) : option.引数省略 = [name]
        option[prop] === undefined ? option[prop] = [true] : option[prop].push(true)
      } else { // 省略せず
        option[prop] === undefined ? option[prop] = [引数[i + 1]] : option[prop].push(引数[i + 1])
      }
    } else { // 引数あり: 次の引数が-から始まるものでも引数とみなす
      if (引数[i + 1] === undefined) { // 末尾オプション
        option.引数必須 === undefined ? option.引数必須 = [name] : option.引数必須.push(name)
        option[prop] === undefined ? option[prop] = [undefined] : option[prop].push(undefined)
        return null // 格納だけど: 引数ありなのに無い
      } else {
        option[prop] === undefined ? option[prop] = [引数[i + 1]] : option[prop].push(引数[i + 1])
      }
    }

    return true // 正しく格納
  }

  //++++++++++++++++++++++++++++++++++++++++++++++

  function 次はオプションの引数じゃないね(次) {
    return 次 === undefined || 次.startsWith('-')
  }

  function オプションなら最長オプション名(オプションリスト, str) {
    let hit = false
    let name
    オプションリスト.forEach(同一オプション => {
      if (hit) { // 1回hitしたら他のオプションは無視
        return
      }
      name = ''
      if (Array.isArray(同一オプション)) {
        同一オプション.forEach(e => {
          // 最も長いもの、同数なら先のもの優先
          if (name.length < e.length) {
            name = e
          }
          if (e === str) {
            hit = true
          }
        })
      } else {
        if (同一オプション === str) {
          name = str
          hit = true
        }
      }
    })
    if (hit) {
      return name
    } else {
      return undefined
    }
  }

  function 曖昧オプション(オプションリスト, str) {
    // 曖昧オプション: --から始まり、前半が一致するものが複数
    // 完全一致を除く: --abと--ab-cの定義で、--abの使用はok
    if (!str.startsWith('--') || str === '--') {
      return
    }
    const 前半一致 = []
    let 完全一致 = false

    オプションリスト.forEach(同一オプション => {
      let hit = false
      if (Array.isArray(同一オプション)) {
        同一オプション.forEach(e => {
          if (hit) { // 1回hitしたら同一オプションは無視
            return
          }
          if (e !== str && e.startsWith(str)) {
            前半一致.push(e)
            hit = true
          }
          if (e === str) {
            完全一致 = true
          }
        })
      } else {
        if (同一オプション !== str && 同一オプション.startsWith(str)) {
          前半一致.push(同一オプション)
        }
        if (同一オプション === str) {
          完全一致 = true
        }
      }
    })
    if (完全一致) {
      return str
    }
    if (前半一致.length === 1) { // 曖昧ではない
      return オプションなら最長オプション名(オプションリスト, 前半一致[0])
    } else if (前半一致.length > 1) { // 曖昧
      const value = [str].concat(前半一致)
      option.曖昧 === undefined ? option.曖昧 = [value] : option.曖昧.push(value)
      return オプションなら最長オプション名(オプションリスト, 前半一致[0]) // 先にマッチしたもの優先
    }
    return // 一致なし
  }

  function オプションなの(オプションリスト, str) {
    let hit = false
    オプションリスト.forEach(e => {
      if (Array.isArray(e)) {
        e.forEach(e => {
          if (e === str) {
            hit = true
          }
        })
      } else {
        if (e === str) {
          hit = true
        }
      }
    })
    return hit
  }

  //++++++++++++++++++++++++++++++++++++++++++++++

  function 最長オプション名(同一オプション) {
    // -tと--full-timeなら--full-time
    if (Array.isArray(同一オプション)) {
      let name = ''
      同一オプション.forEach(e => {
        // 最も長いもの、同数なら先のもの優先
        if (name.length < e.length) {
          name = e
        }
      })
      return name
    } else {
      return 同一オプション
    }
  }

  排他的オプション()

  function 排他的オプション() {
    排他的.forEach(e => {
      const props = []
      e.forEach(str => {
        const name = オプションなら最長オプション名(全オプションリスト, str)
        const prop = name.replace(/-/g, '_').replace(/^_+/, '')
        if (option[prop] !== undefined) { // 使用済み
          if (!props.includes(name)) { // 同じオプションの複数回使用は排他的扱いしない
            props.push(name)
          }
        }
      })
      if (props.length >= 2) { // 使用済みが複数
        option.排他的 === undefined ? option.排他的 = [props] : option.排他的.push(props)
      }
    })
  }

  未指定オプション()

  function 未指定オプション() {
    option.未指定 = []
    const list = オプション最長名リスト(引数あり, 引数なし, 引数省略可)
    list.forEach(e => {
      const プロパティ名 = e.replace(/-/g, '_').replace(/^_+/, '')
      if (!option[プロパティ名]) {
        option.未指定.push(e)
      }
    })

    function オプション最長名リスト(...オプション定義) {
      const arr = []
      オプション定義.forEach(オプションリスト => {
        オプションリスト.forEach(同一オプション => {
          arr.push(最長オプション名(同一オプション))
        })
      })
      return arr
    }
  }

  return option
}


//===============================================================================
