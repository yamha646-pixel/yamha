/* Editable public shell and main-page catalogue. Original values preserve the approved design. */
(function(){
  const C=window.YamhaContent;
  if(!C)return;
  C.register("공통 메뉴·푸터",{
  "shell.skip": {
    "label": "본문 바로가기",
    "value": "본문으로 건너뛰기",
    "type": "text"
  },
  "shell.sidebarAria": {
    "label": "사이트 메뉴 접근성 이름",
    "value": "사이트 메뉴",
    "type": "text"
  },
  "shell.homeAria": {
    "label": "메인 링크 접근성 이름",
    "value": "{name} 메인으로",
    "type": "text"
  },
  "shell.navAria": {
    "label": "주 메뉴 접근성 이름",
    "value": "주 메뉴",
    "type": "text"
  },
  "shell.socialAria": {
    "label": "외부 채널 접근성 이름",
    "value": "{name} 외부 채널",
    "type": "text"
  },
  "shell.brandName": {
    "label": "좌측 영문 이름",
    "value": "{englishName}",
    "type": "text"
  },
  "shell.brandSub": {
    "label": "좌측 이름 아래 문구",
    "value": "POST OFFICE",
    "type": "text"
  },
  "shell.sideHeart": {
    "label": "좌측 하트 장식",
    "value": "♡",
    "type": "text"
  },
  "shell.sideMessage": {
    "label": "좌측 아래 문구",
    "value": "언제나 {fanName} 편",
    "type": "text"
  },
  "shell.sideSign": {
    "label": "좌측 아래 영문 문구",
    "value": "WITH LOVE, {englishName}",
    "type": "text"
  },
  "shell.footerTo": {
    "label": "푸터 받는 사람",
    "value": "늘 {fanName}에게, ",
    "type": "text"
  },
  "shell.footerFrom": {
    "label": "푸터 보내는 사람",
    "value": "{name}로부터 ♡",
    "type": "text"
  },
  "shell.loading": {
    "label": "내용 불러오는 중",
    "value": "편지를 펼치는 중이에요…",
    "type": "text"
  },
  "shell.socialCafe": {
    "label": "팬카페 링크",
    "value": "팬카페",
    "type": "text"
  },
  "shell.socialYoutube": {
    "label": "유튜브 링크",
    "value": "YouTube",
    "type": "text"
  },
  "shell.socialX": {
    "label": "X 링크",
    "value": "X",
    "type": "text"
  },
  "shell.socialSongbook": {
    "label": "노래책 링크",
    "value": "노래책",
    "type": "text"
  },
  "shell.adminLink": {
    "label": "관리자 링크",
    "value": "관리자",
    "type": "text"
  },
  "shell.favicon": {
    "label": "브라우저 탭 아이콘",
    "value": "assets/favicon.svg",
    "type": "image"
  },
  "shell.nav.home": {
    "label": "메인 메뉴 이름",
    "value": "메인",
    "type": "text"
  },
  "shell.nav.homeSub": {
    "label": "메인 메뉴 영문 이름",
    "value": "HOME",
    "type": "text"
  },
  "shell.nav.profile": {
    "label": "프로필 메뉴 이름",
    "value": "프로필",
    "type": "text"
  },
  "shell.nav.profileSub": {
    "label": "프로필 메뉴 영문 이름",
    "value": "PROFILE",
    "type": "text"
  },
  "shell.nav.schedule": {
    "label": "일정 메뉴 이름",
    "value": "일정",
    "type": "text"
  },
  "shell.nav.scheduleSub": {
    "label": "일정 메뉴 영문 이름",
    "value": "SCHEDULE",
    "type": "text"
  },
  "shell.nav.news": {
    "label": "공지 메뉴 이름",
    "value": "공지",
    "type": "text"
  },
  "shell.nav.newsSub": {
    "label": "공지 메뉴 영문 이름",
    "value": "NEWS",
    "type": "text"
  },
  "shell.nav.store": {
    "label": "스토어 메뉴 이름",
    "value": "스토어",
    "type": "text"
  },
  "shell.nav.storeSub": {
    "label": "스토어 메뉴 영문 이름",
    "value": "STORE",
    "type": "text"
  },
  "shell.nav.reward": {
    "label": "리워드 메뉴 이름",
    "value": "리워드",
    "type": "text"
  },
  "shell.nav.rewardSub": {
    "label": "리워드 메뉴 영문 이름",
    "value": "REWARD",
    "type": "text"
  },
  "shell.nav.debt": {
    "label": "보상 메뉴 이름",
    "value": "보상",
    "type": "text"
  },
  "shell.nav.debtSub": {
    "label": "보상 메뉴 영문 이름",
    "value": "MEMORY",
    "type": "text"
  },
  "shell.nav.guide": {
    "label": "안내 메뉴 이름",
    "value": "안내",
    "type": "text"
  },
  "shell.nav.guideSub": {
    "label": "안내 메뉴 영문 이름",
    "value": "GUIDE",
    "type": "text"
  },
  "shell.art.home": {
    "label": "메인 아이콘 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 아이콘을 사용해요."
  },
  "shell.art.user": {
    "label": "프로필 아이콘 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 아이콘을 사용해요."
  },
  "shell.art.calendar": {
    "label": "달력 아이콘 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 아이콘을 사용해요."
  },
  "shell.art.news": {
    "label": "공지 아이콘 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 아이콘을 사용해요."
  },
  "shell.art.store": {
    "label": "스토어 아이콘 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 아이콘을 사용해요."
  },
  "shell.art.gift": {
    "label": "리워드 아이콘 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 아이콘을 사용해요."
  },
  "shell.art.heart": {
    "label": "하트 아이콘 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 아이콘을 사용해요."
  },
  "shell.art.envelope": {
    "label": "편지 아이콘 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 아이콘을 사용해요."
  },
  "shell.art.music": {
    "label": "음악 아이콘 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 아이콘을 사용해요."
  },
  "shell.art.arrow": {
    "label": "화살표 아이콘 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 아이콘을 사용해요."
  },
  "shell.art.external": {
    "label": "새 창 아이콘 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 아이콘을 사용해요."
  },
  "shell.art.close": {
    "label": "닫기 아이콘 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 아이콘을 사용해요."
  },
  "shell.art.search": {
    "label": "검색 아이콘 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 아이콘을 사용해요."
  },
  "shell.art.expand": {
    "label": "확대 아이콘 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 아이콘을 사용해요."
  }
});
  C.register("메인 페이지",{
  "home.eyebrow": {
    "label": "큰 이름 위 소개",
    "value": "{bio}",
    "type": "text"
  },
  "home.wordmark": {
    "label": "메인 큰 이름",
    "value": "{wordmark}",
    "type": "text"
  },
  "home.nameAria": {
    "label": "메인 이름 접근성 문구",
    "value": "{name}",
    "type": "text"
  },
  "home.art.wing": {
    "label": "날개 장식 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 장식을 사용해요."
  },
  "home.art.acorn": {
    "label": "도토리 장식 교체",
    "value": "",
    "type": "image",
    "hint": "비워 두면 기존 장식을 사용해요."
  },
  "home.browserTitle": {
    "label": "메인 브라우저 제목",
    "value": "{name} {englishName} · {fanName} 앞으로",
    "type": "text"
  },
  "home.metaDescription": {
    "label": "검색 결과 소개",
    "value": "{fanName} 앞으로, {name}의 작은 편지가 도착했어요. 하늘다람쥐 편지배달부 {name}의 홈페이지입니다.",
    "type": "text"
  },
  "home.logoHeart": {
    "label": "이름 옆 하트",
    "value": "♡",
    "type": "text"
  },
  "home.introTo": {
    "label": "메인 소개 앞부분",
    "value": "{fanName} 앞으로, ",
    "type": "text"
  },
  "home.introArrival": {
    "label": "메인 소개 강조 문구",
    "value": "{name}가 도착했어요!",
    "type": "text"
  },
  "home.airmailTo": {
    "label": "오른쪽 편지 받는 사람",
    "value": "TO. {fanName}",
    "type": "text"
  },
  "home.airmailMessage": {
    "label": "오른쪽 편지 문구",
    "value": "오늘도 함께해 주시지야 ♡",
    "type": "text"
  },
  "home.postmarkName": {
    "label": "소인 이름",
    "value": "{englishName} POST",
    "type": "text"
  },
  "home.postmarkDate": {
    "label": "소인 날짜",
    "value": "02.22",
    "type": "text"
  },
  "home.postmarkSmall": {
    "label": "소인 영문 문구",
    "value": "SPECIAL DELIVERY",
    "type": "text"
  },
  "home.photoCaption1": {
    "label": "메인 사진 1 아래 문구",
    "value": "dear. {fanName}",
    "type": "text"
  },
  "home.photoCaption2": {
    "label": "메인 사진 2 아래 문구",
    "value": "little happy moments",
    "type": "text"
  },
  "home.photoCaption3": {
    "label": "메인 사진 3 아래 문구",
    "value": "a letter for you",
    "type": "text"
  },
  "home.photoCaption4": {
    "label": "메인 사진 4 아래 문구",
    "value": "from. {englishName}",
    "type": "text"
  },
  "home.photoCaption5": {
    "label": "메인 사진 5 아래 문구",
    "value": "with a little love.",
    "type": "text"
  },
  "home.photoHeart3": {
    "label": "메인 사진 3 하트",
    "value": "♡",
    "type": "text"
  },
  "home.photoHeart4": {
    "label": "메인 사진 4 하트",
    "value": "♡",
    "type": "text"
  },
  "home.wordTop": {
    "label": "왼쪽 첫 스티커",
    "value": "달달한 하루",
    "type": "text"
  },
  "home.wordBottom": {
    "label": "왼쪽 둘째 스티커",
    "value": "배달 왔어요!",
    "type": "text"
  },
  "home.acornCaption": {
    "label": "도토리 아래 문구",
    "value": "{fanName} 전용 ♡",
    "type": "text"
  },
  "home.stampTitle": {
    "label": "우표 제목",
    "value": "LOVE MAIL",
    "type": "text"
  },
  "home.stampSignature": {
    "label": "우표 서명",
    "value": "{englishName} · 0406",
    "type": "text"
  },
  "home.broadcastKicker": {
    "label": "방송 안내 영문",
    "value": "ON A LOVELY MORNING",
    "type": "text"
  },
  "home.rewardSubtitle": {
    "label": "사진 보관함 소개",
    "value": "우리의 순간을 차곡차곡",
    "type": "text"
  },
  "home.rewardTitle": {
    "label": "사진 보관함 제목",
    "value": "사진 보관함",
    "type": "text"
  },
  "home.bottomNote": {
    "label": "메인 아래 영문 메모",
    "value": "a small letter, a lovely day ",
    "type": "text"
  },
  "home.bottomHeart": {
    "label": "메인 아래 하트",
    "value": "♡",
    "type": "text"
  },
  "home.channelTitle": {
    "label": "방송 채널 버튼",
    "value": "{name} 만나러 가기",
    "type": "text"
  },
  "home.channelSubtitle": {
    "label": "방송 채널 버튼 영문",
    "value": "CHZZK CHANNEL",
    "type": "text"
  },
  "home.channelSymbol": {
    "label": "채널 기호",
    "value": "↯",
    "type": "text"
  },
  "home.wingHeart": {
    "label": "날개 사이 하트",
    "value": "♡",
    "type": "text"
  },
  "home.sparkle1": {
    "label": "반짝임 장식 1",
    "value": "✦",
    "type": "text"
  },
  "home.sparkle2": {
    "label": "반짝임 장식 2",
    "value": "+",
    "type": "text"
  },
  "home.sparkle3": {
    "label": "반짝임 장식 3",
    "value": "✧",
    "type": "text"
  },
  "home.sparkle4": {
    "label": "반짝임 장식 4",
    "value": "+",
    "type": "text"
  },
  "home.rewardHeart": {
    "label": "사진 버튼 하트",
    "value": "♡",
    "type": "text"
  },
  "home.photoSign": {
    "label": "사진 확대창 서명",
    "value": "WITH LOVE, {englishName}",
    "type": "text"
  },
  "home.photoHeading": {
    "label": "사진 확대창 제목",
    "value": "{name}의 작은 기록 ",
    "type": "text"
  },
  "home.deliveryAria": {
    "label": "방송 안내 영역 이름",
    "value": "방송과 소식",
    "type": "text"
  },
  "home.scheduleAria": {
    "label": "일정 버튼 접근성 이름",
    "value": "방송 일정 보기",
    "type": "text"
  },
  "home.photoDialogAria": {
    "label": "사진 확대창 접근성 이름",
    "value": "{name} 사진 원본 보기",
    "type": "text"
  },
  "home.photoClose": {
    "label": "사진 닫기 버튼",
    "value": "사진 닫기",
    "type": "text"
  },
  "home.photoPrevious": {
    "label": "이전 사진 버튼",
    "value": "이전 사진",
    "type": "text"
  },
  "home.photoNext": {
    "label": "다음 사진 버튼",
    "value": "다음 사진",
    "type": "text"
  },
  "home.photoOpen": {
    "label": "사진 확대 버튼 문구",
    "value": "{description} 사진 크게 보기",
    "type": "text",
    "hint": "{description}은 메인 탭에서 편집한 사진 설명이에요."
  },
  "home.photoCount": {
    "label": "사진 순서 표시",
    "value": "{current} / {total}",
    "type": "text",
    "hint": "현재 사진 번호와 전체 사진 수가 자동으로 들어가요."
  },
  "home.debutCounter": {
    "label": "데뷔일 카운터",
    "value": "D+{days}",
    "type": "text",
    "hint": "프로필의 데뷔 날짜로부터 지난 일수가 들어가요."
  },
  "home.broadcastTitle": {
    "label": "메인 방송 시간 문구",
    "value": "{broadcastTime}",
    "type": "text",
    "hint": "{broadcastTime}은 프로필 방송 시간이에요."
  },
  "home.broadcastRest": {
    "label": "메인 휴방 문구",
    "value": "{restDays}",
    "type": "text",
    "hint": "{restDays}는 프로필의 정기 휴방 안내예요."
  },
  "home.broadcastMorning": {
    "label": "오전 방송 표시 문구",
    "value": "오전에 만나요",
    "type": "text",
    "hint": "프로필 방송 시간이 오전 방송일 때 사용해요."
  },
  "home.broadcastDefaultRest": {
    "label": "화·수 휴방 표시 문구",
    "value": "화 · 수 고정 휴방",
    "type": "text",
    "hint": "프로필 정기 휴방이 화요일 · 수요일 고정 휴방일 때 사용해요."
  }
});
  C.register("페이지 제목·장식",{
  "heading.debt.browserTitle": {
    "label": "debt 브라우저 제목",
    "value": "잊지 않을 약속 · {name} {englishName}",
    "type": "text"
  },
  "heading.debt.kicker": {
    "label": "보상 상단 영문 분류",
    "value": "MEMORY",
    "type": "text"
  },
  "heading.debt.title": {
    "label": "보상 페이지 제목",
    "value": "잊지 않을 약속",
    "type": "text"
  },
  "heading.debt.description": {
    "label": "보상 페이지 소개",
    "value": "{fanName}과 함께한 약속을 하나씩 모아 두었어요.",
    "type": "text"
  },
  "heading.debt.image": {
    "label": "잊지 않을 약속 제목 옆 장식",
    "value": "assets/stamp-clover.png",
    "type": "image"
  },
  "heading.guide.browserTitle": {
    "label": "guide 브라우저 제목",
    "value": "함께 읽는 안내서 · {name} {englishName}",
    "type": "text"
  },
  "heading.guide.kicker": {
    "label": "안내 상단 영문 분류",
    "value": "GUIDE",
    "type": "text"
  },
  "heading.guide.title": {
    "label": "안내 페이지 제목",
    "value": "함께 읽는 안내서",
    "type": "text"
  },
  "heading.guide.description": {
    "label": "안내 페이지 소개",
    "value": "서로를 아끼며, 오래오래 함께하기 위한 약속.",
    "type": "text"
  },
  "heading.guide.image": {
    "label": "함께 읽는 안내서 제목 옆 장식",
    "value": "assets/postage-seal.png",
    "type": "image"
  },
  "heading.news.browserTitle": {
    "label": "news 브라우저 제목",
    "value": "{name}의 새 소식 · {name} {englishName}",
    "type": "text"
  },
  "heading.news.kicker": {
    "label": "공지 상단 영문 분류",
    "value": "NEWS",
    "type": "text"
  },
  "heading.news.title": {
    "label": "공지 페이지 제목",
    "value": "{name}의 새 소식",
    "type": "text"
  },
  "heading.news.description": {
    "label": "공지 페이지 소개",
    "value": "{fanName} 앞으로 도착한 새로운 편지.",
    "type": "text"
  },
  "heading.news.image": {
    "label": "얌하의 새 소식 제목 옆 장식",
    "value": "assets/postage-seal.png",
    "type": "image"
  },
  "heading.profile.browserTitle": {
    "label": "profile 브라우저 제목",
    "value": "{name}를 소개해요 · {name} {englishName}",
    "type": "text"
  },
  "heading.profile.kicker": {
    "label": "프로필 상단 영문 분류",
    "value": "PROFILE",
    "type": "text"
  },
  "heading.profile.title": {
    "label": "프로필 페이지 제목",
    "value": "{name}를 소개해요",
    "type": "text"
  },
  "heading.profile.description": {
    "label": "프로필 페이지 소개",
    "value": "{fanName}에게 보내는, 나의 작은 소개서.",
    "type": "text"
  },
  "heading.profile.image": {
    "label": "얌하를 소개해요 제목 옆 장식",
    "value": "assets/stamp-squirrel.png",
    "type": "image"
  },
  "heading.reward.browserTitle": {
    "label": "reward 브라우저 제목",
    "value": "마냥단에게 드려요 · {name} {englishName}",
    "type": "text"
  },
  "heading.reward.kicker": {
    "label": "리워드 상단 영문 분류",
    "value": "REWARD",
    "type": "text"
  },
  "heading.reward.title": {
    "label": "리워드 페이지 제목",
    "value": "{fanName}에게 드려요",
    "type": "text"
  },
  "heading.reward.description": {
    "label": "리워드 페이지 소개",
    "value": "함께한 시간만큼, 차곡차곡 쌓이는 우리의 추억.",
    "type": "text"
  },
  "heading.reward.image": {
    "label": "마냥단에게 드려요 제목 옆 장식",
    "value": "assets/stamp-acorn.png",
    "type": "image"
  },
  "heading.schedule.browserTitle": {
    "label": "schedule 브라우저 제목",
    "value": "{name}와 만날 날 · {name} {englishName}",
    "type": "text"
  },
  "heading.schedule.kicker": {
    "label": "일정 상단 영문 분류",
    "value": "SCHEDULE",
    "type": "text"
  },
  "heading.schedule.title": {
    "label": "일정 페이지 제목",
    "value": "{name}와 만날 날",
    "type": "text"
  },
  "heading.schedule.description": {
    "label": "일정 페이지 소개",
    "value": "우리의 다음 만남을 달력에 담았어요.",
    "type": "text"
  },
  "heading.schedule.image": {
    "label": "얌하와 만날 날 제목 옆 장식",
    "value": "assets/stamp-clover.png",
    "type": "image"
  },
  "heading.song.browserTitle": {
    "label": "song 브라우저 제목",
    "value": "{name}의 노래책 · {name} {englishName}",
    "type": "text"
  },
  "heading.song.kicker": {
    "label": "song 상단 영문 분류",
    "value": "SONGBOOK",
    "type": "text"
  },
  "heading.song.title": {
    "label": "song 페이지 제목",
    "value": "{name}의 노래책",
    "type": "text"
  },
  "heading.song.description": {
    "label": "song 페이지 소개",
    "value": "좋아하는 노래로 전하는 마음.",
    "type": "text"
  },
  "heading.song.image": {
    "label": "얌하의 노래책 제목 옆 장식",
    "value": "assets/stamp-squirrel.png",
    "type": "image"
  },
  "heading.store.browserTitle": {
    "label": "store 브라우저 제목",
    "value": "{name}의 작은 상점 · {name} {englishName}",
    "type": "text"
  },
  "heading.store.kicker": {
    "label": "스토어 상단 영문 분류",
    "value": "STORE",
    "type": "text"
  },
  "heading.store.title": {
    "label": "스토어 페이지 제목",
    "value": "{name}의 작은 상점",
    "type": "text"
  },
  "heading.store.description": {
    "label": "스토어 페이지 소개",
    "value": "일상에도 함께할 수 있는 작은 선물.",
    "type": "text"
  },
  "heading.store.image": {
    "label": "얌하의 작은 상점 제목 옆 장식",
    "value": "assets/stamp-acorn.png",
    "type": "image"
  }
});
})();
