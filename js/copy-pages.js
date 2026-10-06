/* Editable presentation copy for Yamha public subpages. Content records stay in their existing editors. */
(function () {
  'use strict';
  const C=window.YamhaContent;
  if(!C)return;
  C.register("하위 페이지 공통", {
  "pages.imageError": {
    "label": "이미지 불러오기 실패",
    "value": "이미지를 불러올 수 없어요.",
    "type": "text"
  },
  "pages.filterLabel": {
    "label": "목록 분류 접근성 이름",
    "value": "목록 분류",
    "type": "text"
  },
  "pages.separator": {
    "label": "항목 구분 기호",
    "value": " · ",
    "type": "text"
  },
  "pages.noValue": {
    "label": "값이 없을 때 표시",
    "value": "—",
    "type": "text"
  },
  "pages.galleryPhoto": {
    "label": "사진 기본 캡션",
    "value": "사진 {number}",
    "type": "text"
  },
  "pages.galleryOpen": {
    "label": "사진 크게 보기 접근성 이름",
    "value": "{label} 크게 보기",
    "type": "text"
  },
  "pages.loadErrorImage": {
    "label": "불러오기 실패 화면 장식",
    "value": "assets/stamp-acorn.png",
    "type": "image"
  },
  "pages.loadErrorTitle": {
    "label": "불러오기 실패 제목",
    "value": "내용을 불러오지 못했어요",
    "type": "text"
  },
  "pages.loadErrorBody": {
    "label": "불러오기 실패 설명",
    "value": "잠시 후 다시 확인해 주세요.",
    "type": "text"
  }
});
  C.register("프로필", {
  "profile.birthdayToday": {
    "label": "생일 당일 표시",
    "value": "HAPPY BIRTHDAY",
    "type": "text"
  },
  "profile.daysBefore": {
    "label": "기념일까지 남은 일수",
    "value": "D−{days}",
    "type": "text"
  },
  "profile.daysAfter": {
    "label": "데뷔 후 일수",
    "value": "D+{days}",
    "type": "text"
  },
  "profile.birthdayCounter": {
    "label": "생일 카운터 제목",
    "value": "생일까지",
    "type": "text"
  },
  "profile.debutCounter": {
    "label": "데뷔 카운터 제목",
    "value": "데뷔부터",
    "type": "text"
  },
  "profile.fact.birthday": {
    "label": "기본 정보 · 생일",
    "value": "생일",
    "type": "text"
  },
  "profile.fact.debut": {
    "label": "기본 정보 · 데뷔",
    "value": "데뷔",
    "type": "text"
  },
  "profile.fact.fandom": {
    "label": "기본 정보 · 팬네임",
    "value": "팬네임",
    "type": "text"
  },
  "profile.fact.agency": {
    "label": "기본 정보 · 소속",
    "value": "소속",
    "type": "text"
  },
  "profile.fact.mbti": {
    "label": "기본 정보 · MBTI",
    "value": "MBTI",
    "type": "text"
  },
  "profile.fact.age": {
    "label": "기본 정보 · 나이",
    "value": "나이",
    "type": "text"
  },
  "profile.photoAltFallback": {
    "label": "사진 설명이 없을 때 기본값",
    "value": "{name} 프로필",
    "type": "text"
  },
  "profile.letterKicker": {
    "label": "프로필 상단 영문 문구",
    "value": "A LETTER FROM {displayName}",
    "type": "text"
  },
  "profile.social.channel": {
    "label": "외부 링크 · 방송국",
    "value": "방송국",
    "type": "text"
  },
  "profile.social.youtube": {
    "label": "외부 링크 · YouTube",
    "value": "YouTube",
    "type": "text"
  },
  "profile.social.cafe": {
    "label": "외부 링크 · 팬카페",
    "value": "팬카페",
    "type": "text"
  },
  "profile.social.x": {
    "label": "외부 링크 · X",
    "value": "X",
    "type": "text"
  },
  "profile.intro": {
    "label": "기본 자기소개",
    "value": "소통하고, 게임하고, 가끔 노래도 하는 하늘다람쥐 편지배달부. {fanName}과 함께할 달달한 순간들을 기다리고 있어요.",
    "type": "text",
    "multiline": true,
    "hint": "프로필 소개 값이 별도로 저장되어 있으면 그 값을 먼저 표시합니다."
  },
  "profile.introAudience": {
    "label": "팬 이름이 없을 때 자기소개 호칭",
    "value": "여러분",
    "type": "text"
  },
  "profile.introKicker": {
    "label": "자기소개 영문 문구",
    "value": "HELLO, MY DEAR",
    "type": "text"
  },
  "profile.introHeading": {
    "label": "자기소개 제목",
    "value": "{name}를 소개합니다",
    "type": "text"
  },
  "profile.catchphraseLabel": {
    "label": "소개 항목 · 말버릇",
    "value": "말버릇",
    "type": "text"
  },
  "profile.weekHeading": {
    "label": "요일 방송 안내 제목",
    "value": "매일의 배달 시간",
    "type": "text"
  },
  "profile.weekdays": {
    "label": "요일 이름 (월요일부터 | 구분)",
    "value": "월|화|수|목|금|토|일",
    "type": "text",
    "hint": "월요일부터 일요일까지 7개를 | 기호로 구분합니다."
  },
  "profile.weekRest": {
    "label": "기본 휴방 표시",
    "value": "휴방",
    "type": "text"
  },
  "profile.weekMorning": {
    "label": "기본 방송 시간 표시",
    "value": "오전",
    "type": "text"
  },
  "profile.weekRestNote": {
    "label": "휴방 설명",
    "value": "충전 중",
    "type": "text"
  },
  "profile.weekOnNote": {
    "label": "방송 설명",
    "value": "방송",
    "type": "text"
  },
  "profile.weekScheduleLink": {
    "label": "요일 안내 일정 링크",
    "value": "자세한 일정 확인",
    "type": "text"
  },
  "profile.likesKicker": {
    "label": "취향 카드 영문 문구",
    "value": "01 / LIKE",
    "type": "text"
  },
  "profile.likesHeading": {
    "label": "취향 카드 제목",
    "value": "{name}가 좋아하는 것",
    "type": "text"
  },
  "profile.dislikesText": {
    "label": "어려워하는 것 표시",
    "value": "어려워하는 것 · {dislikes}",
    "type": "text"
  },
  "profile.broadcastKicker": {
    "label": "방송 카드 영문 문구",
    "value": "02 / ON AIR",
    "type": "text"
  },
  "profile.broadcastTimeFallback": {
    "label": "방송 시간이 없을 때 표시",
    "value": "방송 시간 미정",
    "type": "text"
  },
  "profile.keywordsText": {
    "label": "방송 키워드 안내",
    "value": "{keywords}",
    "type": "text"
  },
  "profile.broadcastScheduleLink": {
    "label": "방송 카드 일정 링크",
    "value": "방송 일정 확인",
    "type": "text"
  },
  "profile.musicKicker": {
    "label": "음악 카드 영문 문구",
    "value": "03 / MUSIC",
    "type": "text"
  },
  "profile.musicHeading": {
    "label": "음악 카드 제목",
    "value": "{name}의 플레이리스트",
    "type": "text"
  },
  "profile.signatureSongText": {
    "label": "시그니처 곡 안내",
    "value": "시그니처 곡 · {song}",
    "type": "text"
  },
  "profile.songbookLink": {
    "label": "음악 카드 노래책 링크",
    "value": "노래책 보러 가기",
    "type": "text"
  },
  "profile.photoCaption": {
    "label": "프로필 사진 아래 문구",
    "value": "dear. {fanName} ♡",
    "type": "text"
  },
  "profile.photoAudience": {
    "label": "팬 이름이 없을 때 사진 호칭",
    "value": "you",
    "type": "text"
  },
  "profile.designSeal": {
    "label": "캐릭터 디자인 링크 장식",
    "value": "assets/postage-seal.png",
    "type": "image"
  },
  "profile.designHeading": {
    "label": "캐릭터 디자인 링크 제목",
    "value": "{name}와 {fanName}의 디자인",
    "type": "text"
  },
  "profile.designFanFallback": {
    "label": "팬 이름이 없을 때 디자인 호칭",
    "value": "팬캐릭터",
    "type": "text"
  },
  "profile.designBody": {
    "label": "캐릭터 디자인 링크 설명",
    "value": "오리지널 의상 · 헤어 · 팬캐릭터 · 2차 창작 안내",
    "type": "text"
  },
  "profile.timelineHeading": {
    "label": "방송 타임라인 제목",
    "value": "방송 타임라인",
    "type": "text"
  },
  "profile.timelineBody": {
    "label": "방송 타임라인 설명",
    "value": "함께 쌓아가는 {name}의 이야기",
    "type": "text"
  },
  "profile.timelineEmptyImage": {
    "label": "타임라인 빈 화면 장식",
    "value": "assets/stamp-clover.png",
    "type": "image"
  },
  "profile.timelineEmptyTitle": {
    "label": "타임라인 빈 화면 제목",
    "value": "곧 한 장씩 채워질 이야기",
    "type": "text"
  },
  "profile.timelineEmptyBody": {
    "label": "타임라인 빈 화면 설명",
    "value": "{name}의 방송과 콘텐츠 참여 기록이 이곳에 모여요.",
    "type": "text"
  }
});
  C.register("공지", {
  "news.category.all": {
    "label": "분류 이름 · ALL",
    "value": "ALL",
    "type": "text"
  },
  "news.category.notice": {
    "label": "분류 이름 · NOTICE",
    "value": "NOTICE",
    "type": "text"
  },
  "news.category.contents": {
    "label": "분류 이름 · CONTENTS",
    "value": "CONTENTS",
    "type": "text"
  },
  "news.category.event": {
    "label": "분류 이름 · EVENT",
    "value": "EVENT",
    "type": "text"
  },
  "news.category.goods": {
    "label": "분류 이름 · GOODS",
    "value": "GOODS",
    "type": "text"
  },
  "news.resultCount": {
    "label": "소식 개수",
    "value": "{count}개의 소식",
    "type": "text"
  },
  "news.letterCaption": {
    "label": "이미지 없는 공지 장식 문구",
    "value": "letter from yamha",
    "type": "text"
  },
  "news.pinned": {
    "label": "고정 공지 라벨",
    "value": "고정 공지",
    "type": "text"
  },
  "news.readMore": {
    "label": "공지 상세 링크",
    "value": "자세히 읽기",
    "type": "text"
  },
  "news.emptyImage": {
    "label": "공지 빈 화면 장식",
    "value": "assets/stamp-acorn.png",
    "type": "image"
  },
  "news.searchEmptyTitle": {
    "label": "검색 결과 없음 제목",
    "value": "찾는 소식이 없어요",
    "type": "text"
  },
  "news.emptyTitle": {
    "label": "공지 없음 제목",
    "value": "새로운 소식을 기다려 주세요",
    "type": "text"
  },
  "news.searchEmptyBody": {
    "label": "검색 결과 없음 설명",
    "value": "다른 검색어나 분류로 다시 찾아보세요.",
    "type": "text"
  },
  "news.emptyBody": {
    "label": "공지 없음 설명",
    "value": "{name}의 공지와 콘텐츠 소식을 차곡차곡 배달해 드릴게요.",
    "type": "text"
  },
  "news.searchPlaceholder": {
    "label": "공지 검색 입력 안내",
    "value": "공지 제목 검색",
    "type": "text"
  }
});
  C.register("안내", {
  "guide.tab.chat": {
    "label": "안내 탭 · 생방송 채팅 규칙",
    "value": "생방송 채팅 규칙",
    "type": "text"
  },
  "guide.tab.fan": {
    "label": "안내 탭 · 팬 활동 · 팬카페",
    "value": "팬 활동 · 팬카페",
    "type": "text"
  },
  "guide.tab.creation": {
    "label": "안내 탭 · 디자인 · 2차 창작",
    "value": "디자인 · 2차 창작",
    "type": "text"
  },
  "guide.tabsLabel": {
    "label": "안내 탭 접근성 이름",
    "value": "안내 종류",
    "type": "text"
  },
  "guide.emptyImage": {
    "label": "안내 빈 화면 장식",
    "value": "assets/stamp-acorn.png",
    "type": "image"
  },
  "guide.emptyTitle": {
    "label": "안내 없음 제목",
    "value": "안내를 준비하고 있어요",
    "type": "text"
  },
  "guide.emptyBody": {
    "label": "안내 없음 설명",
    "value": "곧 내용을 정리해서 전해드릴게요.",
    "type": "text"
  },
  "guide.recipient": {
    "label": "안내 상단 받는 이",
    "value": "TO. {fanName}",
    "type": "text"
  },
  "guide.recipientFallback": {
    "label": "팬 이름이 없을 때 안내 호칭",
    "value": "YOU",
    "type": "text"
  },
  "guide.updatedAt": {
    "label": "안내 업데이트 표시",
    "value": "최신 업데이트 {date}",
    "type": "text"
  },
  "guide.imageOriginalLabel": {
    "label": "삼면도 사진 캡션 · 겉옷 없음",
    "value": "오리지널 의상 및 헤어 · 겉옷 없음",
    "type": "text"
  },
  "guide.imageJacketLabel": {
    "label": "삼면도 사진 캡션 · 겉옷 있음",
    "value": "오리지널 의상 및 헤어 · 겉옷 있음",
    "type": "text"
  },
  "guide.imageFanLabel": {
    "label": "팬캐릭터 사진 캡션",
    "value": "팬캐릭터 {fanName} 디자인",
    "type": "text"
  },
  "guide.endingSeal": {
    "label": "안내 끝 우표 장식",
    "value": "assets/postage-seal.png",
    "type": "image"
  },
  "guide.endingThanks": {
    "label": "안내 끝 감사 문구",
    "value": "함께 지켜주셔서 고마워요.",
    "type": "text"
  },
  "guide.endingSignature": {
    "label": "안내 끝 서명",
    "value": "WITH LOVE, {displayName}",
    "type": "text"
  }
});
  C.register("보상", {
  "debt.fanFallback": {
    "label": "팬 이름이 없을 때 호칭",
    "value": "팬",
    "type": "text"
  },
  "debt.status.done": {
    "label": "완료 상태 이름",
    "value": "완료",
    "type": "text"
  },
  "debt.status.pending": {
    "label": "미완료 상태 이름",
    "value": "미완료",
    "type": "text"
  },
  "debt.status.all": {
    "label": "전체 상태 이름",
    "value": "전체",
    "type": "text"
  },
  "debt.defaultUnit": {
    "label": "수량 기본 단위",
    "value": "개",
    "type": "text"
  },
  "debt.updatedAt": {
    "label": "보상 변경일 표시",
    "value": "최근 변경 {date}",
    "type": "text"
  },
  "debt.detailHeading": {
    "label": "보상 상세 제목",
    "value": "{nickname}님의 보상",
    "type": "text"
  },
  "debt.unnamed": {
    "label": "닉네임이 없을 때 표시",
    "value": "이름 없음",
    "type": "text"
  },
  "debt.resultCount": {
    "label": "보상 목록 개수",
    "value": "{people}명의 {fanName} · {count}건",
    "type": "text"
  },
  "debt.quantity": {
    "label": "단위별 수량 표시",
    "value": "{count}{unit}",
    "type": "text"
  },
  "debt.progress": {
    "label": "진행 건수 표시",
    "value": "미완료 {pending}건 · 완료 {done}건",
    "type": "text"
  },
  "debt.readMore": {
    "label": "보상 상세 링크",
    "value": "상세 보기",
    "type": "text"
  },
  "debt.emptyImage": {
    "label": "보상 빈 화면 장식",
    "value": "assets/stamp-clover.png",
    "type": "image"
  },
  "debt.searchEmptyTitle": {
    "label": "검색 결과 없음 제목",
    "value": "검색 결과가 없어요",
    "type": "text"
  },
  "debt.emptyTitle": {
    "label": "보상 없음 제목",
    "value": "아직 등록된 보상이 없어요",
    "type": "text"
  },
  "debt.searchEmptyBody": {
    "label": "검색 결과 없음 설명",
    "value": "닉네임이나 상태를 바꾸어 다시 찾아보세요.",
    "type": "text"
  },
  "debt.emptyBody": {
    "label": "보상 없음 설명",
    "value": "{fanName}과의 약속이 생기면 이곳에서 확인할 수 있어요.",
    "type": "text"
  },
  "debt.searchPlaceholder": {
    "label": "보상 검색 입력 안내",
    "value": "{fanName} 닉네임 검색",
    "type": "text"
  }
});
  C.register("스토어", {
  "store.openLink": {
    "label": "스토어 이동 버튼",
    "value": "{name}의 스토어로 이동",
    "type": "text"
  },
  "store.stampImage": {
    "label": "스토어 우표 장식",
    "value": "assets/stamp-acorn.png",
    "type": "image"
  },
  "store.kicker": {
    "label": "스토어 영문 문구",
    "value": "A LITTLE GIFT FOR YOU",
    "type": "text"
  },
  "store.openHeading": {
    "label": "스토어 연결 상태 제목",
    "value": "{name}의 마음을 담은 선물",
    "type": "text"
  },
  "store.emptyHeading": {
    "label": "스토어 준비 중 제목",
    "value": "선물을 준비하고 있어요",
    "type": "text"
  },
  "store.openBody": {
    "label": "스토어 연결 상태 설명",
    "value": "소중한 순간을 함께 간직할 수 있는 {name}의 굿즈를 만나보세요.",
    "type": "text"
  },
  "store.emptyBody": {
    "label": "스토어 준비 중 설명",
    "value": "스토어가 열리면 이곳에서 바로 만나볼 수 있어요.",
    "type": "text"
  },
  "store.comingSoon": {
    "label": "준비 중 상태 표시",
    "value": "COMING SOON",
    "type": "text"
  },
  "store.signature": {
    "label": "스토어 끝 서명",
    "value": "from. {name} ♡",
    "type": "text"
  }
});
  C.register("노래책", {
  "song.resultCount": {
    "label": "노래 개수",
    "value": "{count}곡",
    "type": "text"
  },
  "song.emptyImage": {
    "label": "노래책 빈 화면 장식",
    "value": "assets/stamp-clover.png",
    "type": "image"
  },
  "song.searchEmptyTitle": {
    "label": "검색 결과 없음 제목",
    "value": "검색한 노래가 없어요",
    "type": "text"
  },
  "song.emptyTitle": {
    "label": "노래 목록 없음 제목",
    "value": "얌하의 노래책",
    "type": "text"
  },
  "song.searchEmptyBody": {
    "label": "검색 결과 없음 설명",
    "value": "곡 제목이나 아티스트로 다시 검색해 보세요.",
    "type": "text"
  },
  "song.emptyBody": {
    "label": "노래 목록 없음 설명",
    "value": "현재 노래 목록은 연결된 노래책에서 확인할 수 있어요.",
    "type": "text"
  },
  "song.filterAll": {
    "label": "노래 전체 분류 이름",
    "value": "전체",
    "type": "text"
  },
  "song.heading": {
    "label": "노래책 상단 제목",
    "value": "얌하의 노래를 만나보세요",
    "type": "text"
  },
  "song.body": {
    "label": "노래책 상단 설명",
    "value": "K-POP부터 J-POP까지, 오늘은 어떤 노래가 좋을까요?",
    "type": "text"
  },
  "song.openLink": {
    "label": "외부 노래책 이동 버튼",
    "value": "노래책 열기",
    "type": "text"
  },
  "song.searchPlaceholder": {
    "label": "노래 검색 입력 안내",
    "value": "곡 제목 또는 아티스트 검색",
    "type": "text"
  }
});
})();
