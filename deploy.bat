echo "Deploying .."
git add -A
git commit -m "made some stuff, uploaded via bat"
git pull origin master
git push origin master
git add -A
git commit -m "Deploy"
git push deploy master