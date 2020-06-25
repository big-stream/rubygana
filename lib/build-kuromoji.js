const kuromoji = require('kuromoji')

module.exports = debug => {
  return new Promise((resolve, reject) => {
    if (debug) console.time('#### ビルド時間')
    kuromoji.builder({
      dicPath: __dirname + '/../node_modules/kuromoji/dict'
    }).build(function(err, _tokenizer) {
      if (err) {
        console.error('エラー: kuromojiのビルド失敗')
        reject(err)
      }
      if (debug) {console.timeEnd('#### ビルド時間'); console.log()}
      resolve(_tokenizer)
    })
  })
}
