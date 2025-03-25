@echo off
echo Git 저장소 초기화 중...
cd C:\work\cms_0311
rmdir /s /q .git
git init
git config user.name "Default User"
git config user.email "default@example.com"
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/jaehuijung/jh.git
git branch -M main
echo 초기화 완료. 다음 명령어로 원격 저장소에 푸시하세요:
echo git push -u origin main
pause
