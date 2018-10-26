#!/bin/bash
script=`readlink -e $0`
cd ${script%/*/*} # リポジトリ

echo "miniテスト開始:"

md5='52375c056960a27e87a403f25544f6f6  -'
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
[[ $md5 = $check ]] || { echo "$check"; exit 1; }

echo "miniテスト完了:"

