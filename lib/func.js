
module.exports = {
  文字参照を文字に: str => {
    return str.replace(/&#x[0-9a-fA-F]+;/gm, e => String.fromCharCode(e.replace(/&#/, '0').replace(/;/, '')))
  },
  ひらがなへ: 文字列 => {
    return 文字列.replace(/[ァ-ヴ]/g, (カタカナ) => {
      return String.fromCharCode(カタカナ.charCodeAt(0) - 96)
    })
  },
  カタカナへ: 文字列 => {
    return 文字列.replace(/[ぁ-ゔ]/g, (ひらがな) => {
      return String.fromCharCode(ひらがな.charCodeAt(0) + 96);
    });
  },
}
