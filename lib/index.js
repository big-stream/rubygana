/*!
 *  rubygana
 *
 *  MIT License
 *  ©  2018 ころん:すとりーむ
 */

'use strict'

module.exports = {
  text: (テキスト, オプション, コールバック) => {
    require('./text.js')(テキスト, オプション, コールバック)
  },
  html: (HTMLコード, オプション, コールバック) => {
    require('./html.js')(HTMLコード, オプション, コールバック)
  },
  auto: (文字列, オプション, コールバック) => {
    const たぶんhtml = /^<!DOCTYPE html[^><]*>|<\?xml[^><]*>/i
    if (たぶんhtml.test(文字列.trim())) {
      オプション.グループ = '--html' // ruby.js
      require('./html.js')(文字列, オプション, コールバック)
    } else {
      require('./text.js')(文字列, オプション, コールバック)
    }
  },
  add_class: (HTMLコード, オプション, コールバック) => {
    require('./add-class.js')(HTMLコード, オプション, コールバック)
  },
  text_html: (テキスト, オプション, コールバック) => {
    require('./text-html.js')(テキスト, オプション, コールバック)
  },
  md_html: (マークダウン, オプション, コールバック) => {
    require('./md-html.js')(マークダウン, オプション, コールバック)
  },
}
