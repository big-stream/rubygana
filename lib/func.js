
module.exports = {
  文字参照を文字に: str => {
    return str.replace(/&#x[0-9a-fA-F]+;/gm, e => String.fromCharCode(e.replace(/&#/, '0').replace(/;/, '')))
  },
}
