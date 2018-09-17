#!/bin/bash
script=`readlink -e $0`
cd ${script%/*}

echo "miniテスト開始:"

md5='87a12e41f3c9d80087a9a2fc8a4125d0  -'
check=$( rubygana --md-html ../README.md | rubygana --html --css 'code{background-color:#cccccc;}' | md5sum )
[[ $md5 = $check ]] || { echo "$check"; exit 1; }

echo "miniテスト完了:"

