echo "Deploying ..."
pushall.bat
git add -A
git commit -m "Deploy"
git push deploy master