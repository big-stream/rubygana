#!/bin/bash
script=`readlink -e $0`
cd ${script%/*/*} # リポジトリ

echo "miniテスト開始:"

md5='fa5a5506e97c090a25a1cdbeb916c77e  -'
css='code{background-color:#cccccc;}'
ruby=(--ruby '不味い:ん?! マジぃ')
check=$( rubygana --md-html README.md | rubygana --html --css "$css" "${ruby[@]}" --comment | tee README.md.rubygana.html | md5sum )
[[ $md5 = $check ]] || { echo "$check"; exit 1; }

echo "miniテスト完了:"

