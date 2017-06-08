#!/bin/bash

cd ..
git checkout master
git pull
cd doc
make clean html
cd ..
git checkout gh-pages
\cp doc/build/html/*.html .
\cp doc/build/html/*.js .
\cp -r doc/build/html/_static .
git add *.html *.js _static

echo
echo "*** Documentation update complete ***"
echo
echo "Please review staged files, commit, and push"
echo "the changes (git push origin gh-pages)"
echo
echo "When finished run 'git checkout master'"
