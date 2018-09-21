#!/bin/bash
script=`readlink -e $0`
cd ${script%/*/*} # リポジトリ

echo "miniテスト開始:"

md5='7c98bf9bb47d298483ce8a69243ccdc1  -'
css='code{background-color:#cccccc;}'
ruby=(--ruby '不味い:ん?! マジぃ')
check=$( rubygana --md-html README.md | rubygana --html --css "$css" "${ruby[@]}" --comment | tee README.md.rubygana.html | md5sum )
[[ $md5 = $check ]] || { echo "$check"; exit 1; }

echo "miniテスト完了:"

