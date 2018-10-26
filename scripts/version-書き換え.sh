#!/bin/bash
script=`readlink -e $0`
cd ${script%/*/*} # リポジトリ

version=$1
[[ $version =~ ^[0-9]\.[0-9]\.[0-9]$ ]] || exit 1


readme='rubygana [0-9]\.[0-9]\.[0-9]'
sed -i "s/$readme/rubygana $version/" README.md

help="'[0-9]\.[0-9]\.[0-9]'"
sed -i "s/$help/'$version'/" lib/help.js

package='"[0-9]\.[0-9]\.[0-9]"'
sed -i "s/$package/\"$version\"/" package.json

css='code{background-color:#cccccc;}'
ruby=(
--ruby '不味い:ん?! マジぃ'
--ruby-re '[0-9一二三四五]行:行:ぎょう'
--ruby '空行:くうぎょう'
--ruby '冒頭行:行:ぎょう'
--ruby-re '行(ごと|毎):行:ぎょう'
--ruby-re '行[をはが]:行:ぎょう'
--ruby '粒度:りゅうど'
--ruby '文科省:もんかしょう'
--ruby '空:から'
)
check=$(
rubygana --md-html README.md | \
  rubygana --html --css "$css" "${ruby[@]}" --comment | \
  rubygana --add-class --switch | \
  tee README.md.rubygana.html | \
  md5sum
)
sed -i "s/^md5=.*/md5='$check'/" scripts/minitest.sh

echo "バージョン書き換え完了:"
git diff

