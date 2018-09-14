/*!
 * オプションと標準入力.js 0.1
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
  let conf = 設定 === undefined ? {} : 設定
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

module.exports.オプション = オプション

function オプション(引数あり = [], 引数なし = [], 引数省略可 = [], 排他的 = []) {
  // 関数引数の検証
  const temp = [引数あり, 引数なし, 引数省略可, 排他的]
  temp.forEach((e, i) => {
    if (!Array.isArray(e)) {
      throw 'コマンドオプション解析()の引数' + (i + 1) + 'はArray型'
    }
    e.forEach((e) => {
      if (!Array.isArray(e) && typeof e !== 'string' && i > 3) {
        throw 'コマンドオプション解析()の引数' + (i + 1) + 'の配列内容は文字列かArray型'
      }
      if (!Array.isArray(e) && i === 3) {
        throw 'コマンドオプション解析()の引数4の配列内容はArray型'
      }
      // 配列最下層中身は文字列
      if (Array.isArray(e)) {
        e.forEach(e => {
          if (typeof e !== 'string') {
            throw 'コマンドオプション解析()の引数' + (i + 1) + 'の最下層配列の内容は文字列'
          }
        })
      } else if (typeof e !== 'string') {
        throw 'コマンドオプション解析()の引数' + (i + 1) + 'の最下層配列の内容は文字列'
      }
    })
  })

  // オプションやその引数を格納していく
  let option = {}

  let 引数あり連綿str
    // 引数なしや引数省略可オプションの省略形(-aなど)を-abcdのように複数連ねた正規表現
  let 連綿オプションre = get連綿オプションre()

  function get連綿オプションre() {
    const 省略形re = /^-[^- ]$/
    let a = get連綿str([引数なし, 引数省略可])
    引数あり連綿str = get連綿str([引数あり])

    function get連綿str(arr) {
      let str = ''
      arr.forEach(e => {
        e.forEach(e => {
          if (Array.isArray(e)) {
            e.forEach(e => {
              if (省略形re.test(e)) {
                str += e.slice(1)
              }
            })
          } else {
            if (省略形re.test(e)) {
              str += e.slice(1)
            }
          }
        })
      })
      return str
    }
    // 必須x なしa 省略可b とすると
    // -ab -ba -ax -abx
    return new RegExp('^-([' + a + ']{2,}|[' + a + ']+[' + 引数あり連綿str + '])$')
  }

  // 2以降が実際のコマンド引数
  const 引数 = process.argv.slice(2)

  let 飛ばす = false
  let 引数必須なのに無い = false // フラグ
  let オペランド希望 = false
  引数.forEach((e, i) => {

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

    // オプションに付けた引数の場合
    if (飛ばす) {
      飛ばす = false
      return // 次の引数へ
    }
    // 引数ありオプション
    if (引数ありオプション(e, i)) {
      return // 次の引数へ
    }

    function 引数ありオプション(e, i) { // 連綿でも使う
      if (オプションの解析と格納(e, i)) {
        // 格納した引数が-から始まるものだった場合、飛ばさない
        if (引数必須なのに無い) {
          引数必須なのに無い = false // フラグ
        } else {
          飛ばす = true
        }
        return true
      }
      return false
    }

    // 引数なしオプション単独
    if (オプションの解析と格納(e)) {
      return // 次の引数へ
    }

    // 短縮形オプションを-abcdのように複数連ねるケース
    if (連綿オプションre.test(e)) { // 引数ありは末尾保証
      e.slice(1).split('').forEach((c) => {
        let ハイフン付き = '-' + c
        if (引数なしオプションなの(ハイフン付き)) {
          オプションの解析と格納(ハイフン付き)
        } else { // 引数あり(末尾保証)又は引数省略可
          // 連綿の末尾(-abcdのd)かつ次の引数がある
          if (e.slice(-1) === c && 引数[i + 1] !== undefined && !引数[i + 1].startsWith('-')) {
            if (引数あり連綿str.includes(c)) {
              引数ありオプション(ハイフン付き, i)
            } else {
              オプションの解析と格納(ハイフン付き, i, true)
              飛ばす = true
            }
          } else { // 省略又は引数必須なのに無い場合
            if (引数あり連綿str.includes(c)) {
              引数ありオプション(ハイフン付き, i)
            } else {
              オプションの解析と格納(ハイフン付き, undefined, true)
            }
          }
        }
      })
      return // 次の引数へ
    }

    // 引数を省略可能なオプション(次の引数が-から始まれば省略とみなす)
    if (引数[i + 1] === undefined || 引数[i + 1].startsWith('-')) { // 末尾引数も
      if (オプションの解析と格納(e, undefined, true)) {
        return // 次の引数へ
      }
    } else { // 省略しなかった場合
      if (オプションの解析と格納(e, i, true)) {
        飛ばす = true
        return // 次の引数へ
      }
    }

    // 不明なオプション
    if (e.startsWith('-')) {
      option.不明 === undefined ? option.不明 = [e] : option.不明.push(e)
    }

    // オプションでもその引数でもないもの(オペランド)
    option.オペランド === undefined ? option.オペランド = [e] : option.オペランド.push(e)
  })

  function オプションの解析と格納(e, i, 省略可能か) {
    let source = 引数なし
    if (i !== undefined) {
      source = 引数あり
    }
    if (省略可能か) {
      source = 引数省略可
    }

    function オプションに格納(prop_name) {
      if (i !== undefined) {
        if (引数[i + 1] === undefined || 引数[i + 1].startsWith('-')) {
          引数必須なのに無い = true // フラグ
          let temp = ハイフン付きの名前に戻す(prop_name)
          option.引数必須 === undefined ? option.引数必須 = [temp] : option.引数必須.push(temp)
          option[prop_name] === undefined ? option[prop_name] = [undefined] : option[prop_name].push(undefined)
        } else {
          option[prop_name] === undefined ? option[prop_name] = [引数[i + 1]] : option[prop_name].push(引数[i + 1])
        }
      } else {
        option[prop_name] === undefined ? option[prop_name] = [true] : option[prop_name].push(true)
      }
    }

    // ヒット1回したら抜ける
    let 該当 = false
    source.forEach(strOrArray => {
      if (該当) {
        return
      }
      if (typeof strOrArray === 'string') {
        if (strOrArray === e) {
          オプションに格納(最長プロパティ名(strOrArray))
          該当 = true
        }
      } else {
        strOrArray.forEach(str => {
          if (該当) {
            return
          }
          if (str === e) {
            オプションに格納(最長プロパティ名(strOrArray)) // strにしない
            該当 = true
          }
        })
      }
    })
    return 該当
  }

  function 最長プロパティ名(strOrArray) { // オプション定義配列 = [strOrArray, strOrArray, ...]
    // 冒頭ハイフン消してて途中ハイフンをアンダーバーに変換し、その中で一番長いもの
    // -tと--full-timeならfull_time
    let prop_name = ''
    if (typeof strOrArray === 'string') {
      prop_name = strOrArray.replace(/-/g, '_').replace(/^_/, '').replace(/^_/, '')
    } else {
      strOrArray.forEach(e => {
        // 最も長いもの、同数なら先のもの優先
        let temp = e.replace(/-/g, '_').replace(/^_/, '').replace(/^_/, '')
        if (prop_name.length < temp.length) {
          prop_name = temp
        }
      })
    }
    return prop_name
  }

  function ハイフン付きの名前に戻す(str) {
    let temp = '-' + str.replace(/_/g, '-') // -または--付きの名前に戻す
    if (temp.length > 2) {
      temp = '-' + temp
    }
    return temp
  }

  function 引数なしオプションなの(str) {
    let hit = false
    引数なし.forEach(e => {
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

  排他的オプション()

  function 排他的オプション() {
    排他的.forEach(e => {
      let props = []
      e.forEach(e => {
        let prop_name = 最長プロパティ名(e)
        if (option[prop_name] !== undefined) {
          props.push(ハイフン付きの名前に戻す(prop_name))
        }
      })
      if (props.length > 1) {
        option.排他的 === undefined ? option.排他的 = [props] : option.排他的.push(props)
      }
    })
  }

  return option
}
