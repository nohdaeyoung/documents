# 📂 Archives

정적 웹페이지 아카이브 사이트. `archives/` 폴더에 파일을 추가하면 메인 페이지 목록이 자동으로 업데이트됩니다.

## 셋업 가이드

### 1. 레포 생성 & 파일 업로드

```bash
# 새 레포 생성 후
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git add .
git commit -m "init: archive site"
git branch -M main
git push -u origin main
```

### 2. GitHub Pages 활성화

1. 레포 → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / `/ (root)` 선택 → **Save**

### 3. 개인 도메인 연결

1. `CNAME` 파일을 본인 도메인으로 수정 (예: `archive.mydomain.com`)
2. DNS 설정에서 아래 레코드 추가:

| 타입 | 이름 | 값 |
|------|------|-----|
| CNAME | archive | `YOUR_USERNAME.github.io` |

루트 도메인(`mydomain.com`)을 사용하려면 A 레코드를 추가:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

3. Settings → Pages에서 **Enforce HTTPS** 체크

### 4. 파일 추가 방법

`archives/` 폴더에 `.html`, `.md` 등 파일을 추가하고 push하면 끝!

```bash
# 예시
cp my-page.html archives/
git add archives/my-page.html
git commit -m "add: my-page"
git push
```

GitHub Actions가 자동으로 `archives.json`을 업데이트하고 메인 페이지에 반영됩니다.

## 작동 원리

```
push to archives/ → GitHub Actions 실행 → archives.json 생성 → index.html이 JSON 읽어서 렌더링
```

- HTML 파일: `<title>` 태그에서 제목 추출
- Markdown 파일: 첫 번째 `#` 헤딩에서 제목 추출
- 기타 파일: 파일명을 제목으로 사용

## 구조

```
├── index.html                          # 메인 페이지
├── archives.json                       # 자동 생성되는 파일 목록
├── archives/                           # 여기에 파일 추가
│   └── .gitkeep
├── CNAME                               # 커스텀 도메인
├── .github/workflows/
│   └── update-archives.yml             # 자동 업데이트 워크플로우
└── README.md
```
