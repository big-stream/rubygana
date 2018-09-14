#!/bin/bash
script=`readlink -e $0`
cd ${script%/*}

echo "miniテスト開始:"

md5='979df64b32ab39909bf53064d548e8ec  -'
check=$( rubygana --md-html ../README.md | rubygana --html --css 'code{background-color:#cccccc;}' | md5sum )
[[ $md5 = $check ]] || exit 1

echo "miniテスト完了:"

