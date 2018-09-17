#!/bin/bash
script=`readlink -e $0`
cd ${script%/*}

echo "miniテスト開始:"

md5='6f8df7f4f3b331e81605ceec2a64ee08  -'
check=$( rubygana --md-html ../README.md | rubygana --html --css 'code{background-color:#cccccc;}' | md5sum )
[[ $md5 = $check ]] || { echo "$check"; exit 1; }

echo "miniテスト完了:"

