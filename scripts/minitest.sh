#!/bin/bash
script=`readlink -e $0`
cd ${script%/*}

echo "miniテスト開始:"

md5='a0236ec939b000ae4c120597a63aec93  -'
css='code{background-color:#cccccc;}'
check=$( rubygana --md-html ../README.md | rubygana --html --css "$css" | md5sum )
[[ $md5 = $check ]] || { echo "$check"; exit 1; }

echo "miniテスト完了:"

