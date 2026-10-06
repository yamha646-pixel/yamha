/* Public feature copy and preview images. Actual records remain in their own editors. */
(function(){
  const C=window.YamhaContent;if(!C)return;
  C.register("일정·달력",{
  "schedule.loadError": {
    "label": "사이트 불러오기 오류",
    "value": "저장된 내용을 불러오지 못했어요. 잠시 후 다시 확인해 주세요.",
    "type": "text"
  },
  "schedule.contentError": {
    "label": "페이지 불러오기 오류",
    "value": "내용을 불러오지 못했어요. 잠시 후 다시 확인해 주세요.",
    "type": "text"
  },
  "schedule.period": {
    "label": "일정 상세 기간 제목",
    "value": "기간",
    "type": "text"
  },
  "schedule.part1": {
    "label": "일정 상세 1부 제목",
    "value": "1부",
    "type": "text"
  },
  "schedule.part2": {
    "label": "일정 상세 2부 제목",
    "value": "2부",
    "type": "text"
  },
  "schedule.notice": {
    "label": "일정 상세 알림 제목",
    "value": "알림",
    "type": "text"
  },
  "schedule.special": {
    "label": "일정 강조 안내",
    "value": "특별 일정",
    "type": "text"
  },
  "schedule.dialogTitle": {
    "label": "제목 없는 일정",
    "value": "방송 일정",
    "type": "text"
  },
  "schedule.channel": {
    "label": "방송 채널 버튼",
    "value": "채널에서 만나기",
    "type": "text"
  },
  "schedule.upcoming": {
    "label": "다가오는 일정 제목",
    "value": "곧 만날 약속",
    "type": "text"
  },
  "schedule.empty": {
    "label": "다가오는 일정 빈 화면",
    "value": "아직 등록된 일정이 없어요. 새로운 방송 소식을 기다려 주세요.",
    "type": "text"
  },
  "schedule.part2Summary": {
    "label": "다가오는 일정 2부 표기",
    "value": "2부 {title}",
    "type": "text"
  },
  "schedule.reloadError": {
    "label": "일정 재조회 오류",
    "value": "일정을 다시 불러오지 못했어요. 잠시 후 다시 확인해 주세요.",
    "type": "text"
  },
  "calendar.label": {
    "label": "달력 접근성 이름",
    "value": "방송 일정 달력",
    "type": "text"
  },
  "calendar.defaultType": {
    "label": "일정 기본 유형 이름",
    "value": "방송",
    "type": "text"
  },
  "calendar.eventLabel": {
    "label": "일정 접근성 설명",
    "value": "{range} · {type} · {time}{title}{part2}",
    "type": "text"
  },
  "calendar.part2Label": {
    "label": "일정 접근성 2부 설명",
    "value": " / 2부 {details}",
    "type": "text"
  },
  "calendar.detailLabel": {
    "label": "일정 상세 접근성 이름",
    "value": "일정 상세",
    "type": "text"
  },
  "calendar.close": {
    "label": "상세 닫기 버튼",
    "value": "닫기 ×",
    "type": "text"
  },
  "calendar.part2Detail": {
    "label": "상세 2부 표기",
    "value": "2부 · {details}",
    "type": "text"
  },
  "calendar.month": {
    "label": "달력 월 표기",
    "value": "{year}년 {month}월",
    "type": "text"
  },
  "calendar.prevSymbol": {
    "label": "이전 달 버튼",
    "value": "‹",
    "type": "text"
  },
  "calendar.prev": {
    "label": "이전 달 접근성 이름",
    "value": "이전 달",
    "type": "text"
  },
  "calendar.today": {
    "label": "오늘 버튼",
    "value": "오늘",
    "type": "text"
  },
  "calendar.todayLabel": {
    "label": "오늘 버튼 접근성 이름",
    "value": "이번 달로 이동",
    "type": "text"
  },
  "calendar.nextSymbol": {
    "label": "다음 달 버튼",
    "value": "›",
    "type": "text"
  },
  "calendar.next": {
    "label": "다음 달 접근성 이름",
    "value": "다음 달",
    "type": "text"
  },
  "calendar.dayLabel": {
    "label": "날짜 접근성 이름",
    "value": "{date} 일정 보기",
    "type": "text"
  },
  "calendar.eventAction": {
    "label": "일정 상세 버튼 접근성 이름",
    "value": "{event} 상세 보기",
    "type": "text"
  },
  "calendar.part2Badge": {
    "label": "달력 2부 표시",
    "value": "2부",
    "type": "text"
  },
  "calendar.highlightSymbol": {
    "label": "강조 일정 장식 기호",
    "value": "✦",
    "type": "text"
  },
  "calendar.hint": {
    "label": "일정 있는 달 안내",
    "value": "일정 막대를 누르면 자세한 내용을 볼 수 있어요.",
    "type": "text"
  },
  "calendar.empty": {
    "label": "일정 없는 달 안내",
    "value": "이 달의 일정은 아직 준비 중이에요.",
    "type": "text"
  },
  "calendar.weekday.0": {
    "label": "월요일 이름",
    "value": "월",
    "type": "text"
  },
  "calendar.weekday.1": {
    "label": "화요일 이름",
    "value": "화",
    "type": "text"
  },
  "calendar.weekday.2": {
    "label": "수요일 이름",
    "value": "수",
    "type": "text"
  },
  "calendar.weekday.3": {
    "label": "목요일 이름",
    "value": "목",
    "type": "text"
  },
  "calendar.weekday.4": {
    "label": "금요일 이름",
    "value": "금",
    "type": "text"
  },
  "calendar.weekday.5": {
    "label": "토요일 이름",
    "value": "토",
    "type": "text"
  },
  "calendar.weekday.6": {
    "label": "일요일 이름",
    "value": "일",
    "type": "text"
  }
});
  C.register("리워드·방셀",{
  "reward.art.lock": {"label":"로그인 잠금 아이콘","value":"","type":"image","hint":"비워 두면 기본 아이콘을 사용합니다."},
  "reward.art.info": {"label":"리워드 안내 아이콘","value":"","type":"image","hint":"비워 두면 기본 아이콘을 사용합니다."},
  "reward.sparkSymbol": {"label":"빈 화면 별 장식","value":"✦","type":"text"},
  "reward.letterHeart": {"label":"편지 하트 장식","value":"♡","type":"text"},
  "reward.reloadError": {
    "label": "리워드 재조회 오류",
    "value": "리워드를 다시 불러오지 못했어요. 잠시 후 다시 확인해 주세요.",
    "type": "text"
  },
  "reward.dialogLabel": {
    "label": "리워드 창 접근성 이름",
    "value": "리워드 미리보기",
    "type": "text"
  },
  "reward.imageError": {
    "label": "이미지 오류 설명",
    "value": "이미지를 불러올 수 없습니다",
    "type": "text"
  },
  "reward.close": {
    "label": "창 닫기 접근성 이름",
    "value": "닫기",
    "type": "text"
  },
  "reward.defaultTitle": {
    "label": "제목 없는 리워드",
    "value": "구독 리워드",
    "type": "text"
  },
  "reward.defaultPhotoTitle": {
    "label": "제목 없는 방셀",
    "value": "{name}의 순간",
    "type": "text"
  },
  "reward.authLogin": {"label":"치지직 로그인 버튼","value":"치지직으로 로그인","type":"text"},
  "reward.authLoggedIn": {"label":"로그인한 닉네임 표시","value":"{nickname}님","type":"text"},
  "reward.authLogout": {"label":"로그아웃 버튼","value":"로그아웃","type":"text"},
  "reward.authRefresh": {"label":"구독 정보 새로고침 버튼","value":"구독 정보 새로고침","type":"text"},
  "reward.authLoading": {"label":"로그인 확인 중 안내","value":"로그인 상태를 확인하고 있어요.","type":"text"},
  "reward.authSetup": {"label":"로그인 연결 미설정 안내","value":"로그인 연결 설정이 아직 완료되지 않았어요.","type":"text"},
  "reward.authError": {"label":"로그인 정보 오류 안내","value":"로그인 정보를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.","type":"text"},
  "reward.authCancelled": {"label":"로그인 취소 안내","value":"로그인이 취소됐어요.","type":"text"},
  "reward.authExpired": {"label":"로그인 만료 안내","value":"로그인 요청이 만료됐어요. 다시 시작해 주세요.","type":"text"},
  "reward.authFailed": {"label":"로그인 실패 안내","value":"로그인을 마치지 못했어요. 다시 시도해 주세요.","type":"text"},
  "reward.subscriptionInfo": {"label":"현재 구독 정보","value":"{tier}티어 · {months}개월 구독 중","type":"text"},
  "reward.subscriptionNone": {"label":"구독 정보 없음 안내","value":"현재 확인된 구독 정보가 없어요.","type":"text"},
  "reward.subscriptionUnavailable": {"label":"구독 정보 확인 실패 안내","value":"구독 정보를 확인하지 못했어요. 잠시 후 새로고침해 주세요.","type":"text"},
  "reward.download": {"label":"원본 다운로드 버튼","value":"원본 받기","type":"text"},
  "reward.downloading": {"label":"다운로드 준비 안내","value":"파일을 준비하고 있어요.","type":"text"},
  "reward.downloadError": {"label":"다운로드 실패 안내","value":"파일을 받지 못했어요. 로그인과 수령 조건을 확인해 주세요.","type":"text"},
  "reward.filePending": {"label":"원본 준비 중 안내","value":"원본 파일을 준비하고 있어요.","type":"text"},
  "reward.loginRequired": {"label":"수령 전 로그인 안내","value":"로그인 후 수령 조건을 확인할 수 있어요.","type":"text"},
  "reward.claimLocked": {"label":"수령 조건 안내","value":"구독 티어와 개월 수 조건을 확인해 주세요.","type":"text"},
  "reward.myPhotoCount": {"label":"내 방셀 개수","value":"나에게 온 방셀 {count}장","type":"text"},
  "reward.myPhotosEmpty": {"label":"내 방셀 없음 제목","value":"아직 도착한 방셀이 없어요.","type":"text"},
  "reward.myPhotosBody": {"label":"내 방셀 없음 설명","value":"나에게 보낸 방셀이 등록되면 이곳에서 확인할 수 있어요.","type":"text"},
  "reward.myPhotosNote": {"label":"내 방셀 목록 안내","value":"나에게 도착한 방셀만 표시됩니다.","type":"text"},
  "reward.photosLoading": {"label":"내 방셀 불러오기 안내","value":"방셀을 불러오고 있어요.","type":"text"},
  "reward.photosError": {"label":"내 방셀 불러오기 실패 안내","value":"방셀을 불러오지 못했어요. 잠시 후 새로고침해 주세요.","type":"text"},
  "reward.receiptButton": {"label":"수령 이력 버튼","value":"리워드 수령 이력","type":"text"},
  "reward.receiptTitle": {"label":"수령 이력 제목","value":"내가 받은 리워드","type":"text"},
  "reward.receiptEmpty": {"label":"수령 이력 없음 안내","value":"아직 받은 리워드가 없어요.","type":"text"},
  "reward.receiptDate": {"label":"수령 날짜 표시","value":"{date} 수령","type":"text"},
  "reward.receiptError": {"label":"수령 이력 오류 안내","value":"수령 이력을 불러오지 못했어요.","type":"text"},
  "reward.privatePhotoDialog": {"label":"개인 방셀 확대 제목","value":"나에게 온 방셀","type":"text"},
  "reward.count": {
    "label": "리워드 개수 표기",
    "value": "{count}개의 편지",
    "type": "text"
  },
  "reward.emptyTitle": {
    "label": "리워드 빈 화면 제목",
    "value": "{fanName}의 선물을 준비하고 있어요",
    "type": "text"
  },
  "reward.emptyBody": {
    "label": "리워드 빈 화면 설명",
    "value": "새로운 구독 리워드가 도착하면 이곳에서 소개해 드릴게요.",
    "type": "text"
  },
  "reward.imageAlt": {
    "label": "리워드 이미지 설명",
    "value": "{title} 미리보기",
    "type": "text"
  },
  "reward.tierBadge": {
    "label": "리워드 티어 표시",
    "value": "{tier} TIER",
    "type": "text"
  },
  "reward.monthUnit": {
    "label": "구독 기간 단위",
    "value": "개월",
    "type": "text"
  },
  "reward.defaultDescription": {
    "label": "설명 없는 리워드",
    "value": "{fanName}에게 전하는 구독 선물",
    "type": "text"
  },
  "reward.detailButton": {
    "label": "리워드 상세 버튼",
    "value": "선물 안내 보기",
    "type": "text"
  },
  "reward.sampleBadge": {
    "label": "미리보기 표시",
    "value": "디자인 미리보기",
    "type": "text"
  },
  "reward.toFan": {
    "label": "리워드 상세 상단",
    "value": "FOR. {fanName}",
    "type": "text"
  },
  "reward.tierDetail": {
    "label": "상세 티어 표기",
    "value": "{tier}티어",
    "type": "text"
  },
  "reward.monthDetail": {
    "label": "상세 구독 기간",
    "value": "{months}개월 구독 리워드",
    "type": "text"
  },
  "reward.detailEmpty": {
    "label": "상세 설명 빈 화면",
    "value": "리워드 상세 안내를 준비하고 있어요.",
    "type": "text"
  },
  "reward.sampleWarningTitle": {
    "label": "샘플 안내 제목",
    "value": "디자인 확인용 샘플입니다.",
    "type": "text"
  },
  "reward.sampleWarningBody": {
    "label": "샘플 안내 설명",
    "value": "실제 리워드나 수령 조건이 아닙니다.",
    "type": "text"
  },
  "reward.photoCount": {
    "label": "방셀 미리보기 수",
    "value": "미리보기 {count}장",
    "type": "text"
  },
  "reward.photoOpen": {
    "label": "방셀 확대 접근성 이름",
    "value": "{title} 크게 보기",
    "type": "text"
  },
  "reward.photoPending": {
    "label": "방셀 이미지 빈 화면",
    "value": "사진 준비 중",
    "type": "text"
  },
  "reward.searchEmpty": {
    "label": "방셀 검색 결과 없음",
    "value": "검색한 제목이나 태그의 사진이 없어요.\n다른 단어로 찾아보세요.",
    "type": "text",
    "multiline": true
  },
  "reward.photoDialog": {
    "label": "방셀 확대 창 상단",
    "value": "PHOTO PREVIEW",
    "type": "text"
  },
  "reward.photoDisclaimer": {
    "label": "방셀 확대 설명",
    "value": "화면 확인용 미리보기입니다. 실제 수령 내역이 아닙니다.",
    "type": "text"
  },
  "reward.tierFilter": {
    "label": "티어 필터 접근성 이름",
    "value": "구독 티어 필터",
    "type": "text"
  },
  "reward.all": {
    "label": "전체 필터",
    "value": "전체",
    "type": "text"
  },
  "reward.tier1": {
    "label": "1티어 필터",
    "value": "1티어",
    "type": "text"
  },
  "reward.tier2": {
    "label": "2티어 필터",
    "value": "2티어",
    "type": "text"
  },
  "reward.conditions": {
    "label": "리워드 하단 안내",
    "value": "리워드마다 구독 티어와 수령 조건이 다를 수 있어요.\n각 선물의 상세 안내를 확인해 주세요.",
    "type": "text",
    "multiline": true
  },
  "reward.lockedTitle": {
    "label": "개인 방셀 잠금 제목",
    "value": "{fanName}만의 편지함",
    "type": "text"
  },
  "reward.lockedBody": {
    "label": "개인 방셀 잠금 설명",
    "value": "나에게 도착한 방셀을 모아 보고, 제목과 태그로 소중한 순간을 찾을 수 있는 공간이에요.",
    "type": "text"
  },
  "reward.searchLabel": {
    "label": "방셀 검색 접근성 이름",
    "value": "사진 제목 또는 태그 검색",
    "type": "text"
  },
  "reward.searchPlaceholder": {
    "label": "방셀 검색 입력 안내",
    "value": "제목이나 #태그로 찾아보기",
    "type": "text"
  },
  "reward.tagFilter": {
    "label": "태그 필터 접근성 이름",
    "value": "태그 필터",
    "type": "text"
  },
  "reward.previewPhotosNote": {
    "label": "방셀 미리보기 하단 안내",
    "value": "사진의 제목과 태그를 살펴보는 디자인 미리보기예요.\n실제 개인 방셀과 다운로드는 로그인 연결 후 제공됩니다.",
    "type": "text",
    "multiline": true
  },
  "reward.kicker": {
    "label": "리워드 페이지 상단 영문",
    "value": "DEAR. {fanName}",
    "type": "text"
  },
  "reward.heading": {
    "label": "리워드 페이지 큰 제목",
    "value": "마음을 담은 선물",
    "type": "text"
  },
  "reward.intro": {
    "label": "리워드 페이지 소개",
    "value": "함께한 시간을 편지 한 장, 사진 한 장에 담았어요.",
    "type": "text"
  },
  "reward.previewNote": {
    "label": "샘플 모드 상단 안내",
    "value": "샘플 목록이며 실제 리워드·수령 내역이 아닙니다.",
    "type": "text"
  },
  "reward.postmark": {
    "label": "리워드 카드 소인",
    "value": "{englishName} POST OFFICE",
    "type": "text"
  },
  "reward.passTitle": {
    "label": "리워드 카드 제목",
    "value": "{fanName} 앞으로",
    "type": "text"
  },
  "reward.passBody": {
    "label": "리워드 카드 소개",
    "value": "작고 다정한 마음을 담아,\n{name}가 보낸 편지예요.",
    "type": "text",
    "multiline": true
  },
  "reward.asideSymbol": {
    "label": "리워드 카드 아래 장식",
    "value": "♡",
    "type": "text"
  },
  "reward.asideNote": {
    "label": "리워드 카드 아래 문구",
    "value": "함께해 준 모든 순간,\n고마운 마음을 보내요.",
    "type": "text",
    "multiline": true
  },
  "reward.tabsLabel": {
    "label": "리워드 탭 접근성 이름",
    "value": "리워드와 방셀",
    "type": "text"
  },
  "reward.tabRewards": {
    "label": "리워드 탭 이름",
    "value": "구독 리워드",
    "type": "text"
  },
  "reward.tabPhotos": {
    "label": "방셀 탭 이름",
    "value": "방셀 보관함",
    "type": "text"
  }
});
  C.register("리워드 디자인 미리보기",{
  "rewardPreview.reward1.title": {
    "label": "리워드 샘플 1 제목",
    "value": "첫 번째 편지",
    "type": "text"
  },
  "rewardPreview.reward1.description": {
    "label": "리워드 샘플 1 설명",
    "value": "{fanName}에게 전하는 작은 선물",
    "type": "text"
  },
  "rewardPreview.reward1.image": {
    "label": "리워드 샘플 1 사진",
    "value": "assets/photo-01.png",
    "type": "image"
  },
  "rewardPreview.reward2.title": {
    "label": "리워드 샘플 2 제목",
    "value": "달콤한 하루",
    "type": "text"
  },
  "rewardPreview.reward2.description": {
    "label": "리워드 샘플 2 설명",
    "value": "함께한 시간을 차곡차곡",
    "type": "text"
  },
  "rewardPreview.reward2.image": {
    "label": "리워드 샘플 2 사진",
    "value": "assets/photo-02.png",
    "type": "image"
  },
  "rewardPreview.reward3.title": {
    "label": "리워드 샘플 3 제목",
    "value": "너에게 보내는 마음",
    "type": "text"
  },
  "rewardPreview.reward3.description": {
    "label": "리워드 샘플 3 설명",
    "value": "소중한 순간을 담아 보냈어요",
    "type": "text"
  },
  "rewardPreview.reward3.image": {
    "label": "리워드 샘플 3 사진",
    "value": "assets/photo-04.png",
    "type": "image"
  },
  "rewardPreview.reward4.title": {
    "label": "리워드 샘플 4 제목",
    "value": "우리의 계절",
    "type": "text"
  },
  "rewardPreview.reward4.description": {
    "label": "리워드 샘플 4 설명",
    "value": "오래오래 꺼내 보고 싶은 편지",
    "type": "text"
  },
  "rewardPreview.reward4.image": {
    "label": "리워드 샘플 4 사진",
    "value": "assets/photo-05.png",
    "type": "image"
  },
  "rewardPreview.photo1.title": {
    "label": "방셀 샘플 1 제목",
    "value": "{fanName}에게, 브이!",
    "type": "text"
  },
  "rewardPreview.photo1.tags": {
    "label": "방셀 샘플 1 태그",
    "value": "도토리바구니, {name}",
    "type": "text"
  },
  "rewardPreview.photo1.image": {
    "label": "방셀 샘플 1 사진",
    "value": "assets/photo-01.png",
    "type": "image"
  },
  "rewardPreview.photo2.title": {
    "label": "방셀 샘플 2 제목",
    "value": "웃음 가득한 오후",
    "type": "text"
  },
  "rewardPreview.photo2.tags": {
    "label": "방셀 샘플 2 태그",
    "value": "도토리바구니, 여름",
    "type": "text"
  },
  "rewardPreview.photo2.image": {
    "label": "방셀 샘플 2 사진",
    "value": "assets/photo-02.png",
    "type": "image"
  },
  "rewardPreview.photo3.title": {
    "label": "방셀 샘플 3 제목",
    "value": "오늘도 안녕!",
    "type": "text"
  },
  "rewardPreview.photo3.tags": {
    "label": "방셀 샘플 3 태그",
    "value": "{name}, 여름",
    "type": "text"
  },
  "rewardPreview.photo3.image": {
    "label": "방셀 샘플 3 사진",
    "value": "assets/photo-03.png",
    "type": "image"
  },
  "rewardPreview.photo4.title": {
    "label": "방셀 샘플 4 제목",
    "value": "분홍빛으로 물든 순간",
    "type": "text"
  },
  "rewardPreview.photo4.tags": {
    "label": "방셀 샘플 4 태그",
    "value": "도토리바구니, {name}",
    "type": "text"
  },
  "rewardPreview.photo4.image": {
    "label": "방셀 샘플 4 사진",
    "value": "assets/photo-04.png",
    "type": "image"
  },
  "rewardPreview.photo5.title": {
    "label": "방셀 샘플 5 제목",
    "value": "햇살 좋은 날",
    "type": "text"
  },
  "rewardPreview.photo5.tags": {
    "label": "방셀 샘플 5 태그",
    "value": "여름, {name}",
    "type": "text"
  },
  "rewardPreview.photo5.image": {
    "label": "방셀 샘플 5 사진",
    "value": "assets/photo-05.png",
    "type": "image"
  }
});
})();
