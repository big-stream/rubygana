#!/bin/bash
script=`readlink -e $0`
cd ${script%/*}

echo "miniテスト開始:"

md5='4308b5b26ba92eab28e3edfcf12399bc  -'
css='code{background-color:#cccccc;}'
check=$( rubygana --md-html ../README.md | rubygana --html --css "$css" | md5sum )
[[ $md5 = $check ]] || { echo "$check"; exit 1; }

echo "miniテスト完了:"

