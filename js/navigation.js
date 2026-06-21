function moveTo(pageId) {
  const publicPages = ["login", "signup", "lrod"];
  const userArea = document.getElementById("userArea");
  const isLoggedIn = !!localStorage.getItem("currentUserName") && !userArea?.querySelector(".top-auth-btn");
  const requestedPageId = pageId;

  if (!isLoggedIn && !publicPages.includes(pageId)) {
    pageId = "login";
  }

  const pages = document.querySelectorAll(".page");
  const steps = document.querySelectorAll(".step");

  pages.forEach(page => page.classList.remove("active"));
  steps.forEach(step => step.classList.remove("active"));

  const targetPage = document.getElementById(pageId);

  if (targetPage) {
    targetPage.classList.add("active");
  }

  updateLoginRequiredNotice(!isLoggedIn && requestedPageId !== pageId ? requestedPageId : null);

  const stepMap = {
    lrod: 0,
    teo: 1,
    master: 2,
    map: 3,
    decision: 4
  };

  if (stepMap[pageId] !== undefined && steps[stepMap[pageId]]) {
    steps[stepMap[pageId]].classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function updateLoginRequiredNotice(pageId) {
  const loginPage = document.getElementById("login");
  const authBox = loginPage?.querySelector(".auth-box");
  const existingNotice = document.getElementById("loginRequiredNotice");

  if (existingNotice) {
    existingNotice.remove();
  }

  if (!pageId || !authBox) return;

  const pageNames = {
    teo: "Teo",
    master: "Master Tao",
    map: "Tao Map",
    decision: "의사결정",
    mypage: "마이페이지",
    preference: "라이프스타일 설정"
  };

  const notice = document.createElement("div");
  notice.id = "loginRequiredNotice";
  notice.className = "login-required-notice";
  notice.innerHTML = `
    <strong>${pageNames[pageId] || "해당 메뉴"}는 로그인 후 이용할 수 있습니다.</strong>
    <span>로그인하면 생활 기준과 분석 결과를 바탕으로 개인화된 정보를 확인할 수 있어요.</span>
  `;

  authBox.prepend(notice);
}

function goHome() {
  moveTo("lrod");

  const chatWindow = document.getElementById("chatWindow");

  if (chatWindow) {
    chatWindow.scrollTop = 0;
  }
}

function loginUser() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const loginError = document.getElementById("loginError");

  const savedName = localStorage.getItem("demoUserName");
  const savedEmail = localStorage.getItem("demoUserEmail");
  const savedPassword = localStorage.getItem("demoUserPassword");
  const savedHousehold = localStorage.getItem("demoUserHousehold");
  const savedJob = localStorage.getItem("demoUserJob");

  if (!email || !password) {
    loginError.textContent = "이메일과 비밀번호를 모두 입력해주세요.";
    return;
  }

  if (!savedEmail || !savedPassword) {
    loginError.textContent = "가입된 계정이 없습니다. 먼저 회원가입을 진행해주세요.";
    return;
  }

  if (email !== savedEmail || password !== savedPassword) {
    loginError.textContent = "이메일 또는 비밀번호가 일치하지 않습니다.";
    return;
  }

  loginError.textContent = "";

  setLoggedInUser(savedName, savedHousehold, savedJob);

  const hasPreference = localStorage.getItem("hasPreference");

  if (hasPreference) {
    activatePersonalizedResult();
    moveTo("lrod");
  } else {
    moveTo("preference");
  }
}

function signupUser() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const household = document.getElementById("signupHousehold").value;
  const job = document.getElementById("signupJob").value;
  const signupError = document.getElementById("signupError");

  if (!name || !email || !password || !household || !job) {
    signupError.textContent = "회원가입 정보를 모두 입력해주세요.";
    return;
  }

  localStorage.setItem("demoUserName", name);
  localStorage.setItem("demoUserEmail", email);
  localStorage.setItem("demoUserPassword", password);
  localStorage.setItem("demoUserHousehold", household);
  localStorage.setItem("demoUserJob", job);

  signupError.textContent = "";

  setLoggedInUser(name, household, job);
  moveTo("preference");
}

function setLoggedInUser(name, household, job) {
  localStorage.setItem("currentUserName", name);
  const userArea = document.getElementById("userArea");
  const mypageUserInfo = document.getElementById("mypageUserInfo");

  if (userArea) {
    userArea.innerHTML = `
      <div class="user-menu">
        <span class="user-profile">${name} · ${household} · ${job}</span>
        <button class="mypage-btn" onclick="moveTo('mypage')">마이페이지</button>
        <button class="logout-btn" onclick="logoutUser()">로그아웃</button>
      </div>
    `;
  }

  if (mypageUserInfo) {
    mypageUserInfo.textContent = `${name} · ${household} · ${job}`;
  }

  updateMypagePreference();
}

function logoutUser() {
  const userArea = document.getElementById("userArea");

  localStorage.removeItem("currentUserName");

  if (userArea) {
    userArea.innerHTML = `
      <button class="top-auth-btn" onclick="moveTo('login')">로그인</button>
      <button class="top-auth-btn signup" onclick="moveTo('signup')">회원가입</button>
    `;
  }

  location.reload();
}

function savePreference() {
  const region = document.getElementById("prefRegion").value;
  const dealType = document.getElementById("prefDealType").value;
  const noise = document.getElementById("prefNoise").value;
  const houseType = document.getElementById("prefHouseType").value;

  let budget = "";

  if (dealType === "월세") {
    const deposit = document.getElementById("prefDeposit").value;
    const monthlyRent = document.getElementById("prefMonthlyRent").value;

    budget = `보증금 ${deposit} / 월세 ${monthlyRent}`;

    localStorage.setItem("deposit", deposit);
    localStorage.setItem("monthlyRent", monthlyRent);
  } else {
    budget = document.getElementById("prefBudget").value;
  }

  const activeOptions = document.querySelectorAll(".pref-option.active");
  const priorities = Array.from(activeOptions).map(option => option.textContent.trim());

  localStorage.setItem("hasPreference", "true");
  localStorage.setItem("region", region);
  localStorage.setItem("dealType", dealType);
  localStorage.setItem("budget", budget);
  localStorage.setItem("noise", noise);
  localStorage.setItem("houseType", houseType);
  localStorage.setItem("priorities", priorities.join(", "));

  updateMypagePreference();
  activatePersonalizedResult();

  moveTo("lrod");
}

function changeDealType() {
  const dealType = document.getElementById("prefDealType").value;
  const saleBudgetBox = document.getElementById("saleBudgetBox");
  const rentBudgetBox = document.getElementById("rentBudgetBox");

  if (dealType === "월세") {
    saleBudgetBox.style.display = "none";
    rentBudgetBox.style.display = "block";
  } else {
    saleBudgetBox.style.display = "block";
    rentBudgetBox.style.display = "none";
  }
}

function updateMypagePreference() {
  const preferenceInfo = document.getElementById("mypagePreferenceInfo");

  if (!preferenceInfo) return;

  const region = localStorage.getItem("region") || "미설정";
  const dealType = localStorage.getItem("dealType") || "미설정";
  const budget = localStorage.getItem("budget") || "미설정";
  const noise = localStorage.getItem("noise") || "미설정";
  const houseType = localStorage.getItem("houseType") || "미설정";
  const priorities = localStorage.getItem("priorities") || "미설정";

  preferenceInfo.innerHTML = `
    지역: ${region}<br />
    거래 유형: ${dealType}<br />
    예산: ${budget}<br />
    중요 조건: ${priorities}<br />
    소음 민감도: ${noise}<br />
    주거 형태: ${houseType}
  `;
}

function editPreference() {
  loadPreferenceToForm();
  moveTo("preference");
}

function loadPreferenceToForm() {
  const region = localStorage.getItem("region");
  const dealType = localStorage.getItem("dealType");
  const budget = localStorage.getItem("budget");
  const noise = localStorage.getItem("noise");
  const houseType = localStorage.getItem("houseType");
  const priorities = localStorage.getItem("priorities");

  if (region && document.getElementById("prefRegion")) {
    document.getElementById("prefRegion").value = region;
  }

  if (dealType && document.getElementById("prefDealType")) {
    document.getElementById("prefDealType").value = dealType;
    changeDealType();
  }

  if (budget && dealType !== "월세" && document.getElementById("prefBudget")) {
    document.getElementById("prefBudget").value = budget;
  }

  if (noise && document.getElementById("prefNoise")) {
    document.getElementById("prefNoise").value = noise;
  }

  if (houseType && document.getElementById("prefHouseType")) {
    document.getElementById("prefHouseType").value = houseType;
  }

  if (priorities) {
    const selectedPriorities = priorities.split(",").map(item => item.trim());
    const buttons = document.querySelectorAll(".pref-option");

    buttons.forEach(button => {
      if (selectedPriorities.includes(button.textContent.trim())) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("pref-option")) {
    event.target.classList.toggle("active");
  }
});
function activatePersonalizedResult() {
  const userName = localStorage.getItem("currentUserName") || "사용자";
  const region = localStorage.getItem("region") || "용산구";
  const dealType = localStorage.getItem("dealType") || "매매";
  const budget = localStorage.getItem("budget") || "5억~7억";
  const noise = localStorage.getItem("noise") || "보통";
  const houseType = localStorage.getItem("houseType") || "오피스텔";
  const priorities = localStorage.getItem("priorities") || "직주근접, 역세권, 생활 인프라";

  const mainCard = document.querySelector("#lrod .main");
  const leftSubTexts = document.querySelectorAll("#lrod aside .sub");
  const lrodTags = document.getElementById("lrodTags");
  const lrodLoginBtn = document.getElementById("lrodLoginBtn");

  const lrodTitle = document.querySelector("#lrod .main h2");
  const lrodDesc = document.querySelector("#lrod .main > .sub");
  const scanBox = document.querySelector("#lrod .scan-box");
  const statusItems = document.querySelectorAll("#lrod .status");
  const propertyBox = document.querySelector("#lrod .property");
  const masterBubble = document.querySelector("#lrod .chat-window .bubble");
  const checkList = document.querySelector("#lrod .check-list");
  const chatInputBox = document.querySelector("#lrod .chat-input-box");
  const analysisStandby = document.querySelector("#lrod .analysis-standby");
  const lockedMap = document.querySelector("#lrod .locked-map");
  const taoMapPreviewSection = document.getElementById("taoMapPreviewSection");
  const taoMapPreviewDesc = document.getElementById("taoMapPreviewDesc");

  if (mainCard) {
    mainCard.classList.add("analyzed");
  }

  if (leftSubTexts[0]) {
    leftSubTexts[0].textContent = `${region} 라이프스타일 레이더`;
  }

  if (leftSubTexts[1]) {
    leftSubTexts[1].textContent = `${userName}님의 생활 기준이 ${region} 공간 분석에 반영되었습니다.`;
  }

  if (lrodTags) {
    const priorityList = priorities.split(",").map(item => item.trim());

    lrodTags.innerHTML = priorityList
      .slice(0, 4)
      .map(item => `<span class="tag">${item}</span>`)
      .join("");
  }

  if (lrodLoginBtn) {
    lrodLoginBtn.style.display = "none";
  }

  if (lrodTitle) {
    lrodTitle.textContent = "Teo 개인화 분석 완료";
  }

  if (lrodDesc) {
    lrodDesc.innerHTML = `
      ${userName}님이 선택하신 생활 기준을 바탕으로 ${region} 후보지를 분석했습니다.<br />
      거래 유형: ${dealType} · 예산: ${budget} · 주거 형태: ${houseType}
    `;
  }

  if (scanBox) {
    scanBox.style.display = "none";
  }

  if (statusItems.length >= 4) {
    statusItems[0].textContent = "강남 접근 24분";
    statusItems[1].textContent = "한강 접근 8분";
    statusItems[2].textContent = "생활 인프라 93%";
    statusItems[3].textContent = `소음 ${noise}`;
  }

  if (propertyBox) {
    propertyBox.className = "top-recommend-card";

    propertyBox.innerHTML = `
    <div class="rank-badge">1</div>

    <img 
      class="top-recommend-img"
      src="img/yongsan-prugio-summit.png"
      alt="용산 푸르지오 써밋 오피스텔"
    />

    <div class="top-recommend-info">
      <div class="recommend-label">🏆 추천 1위</div>

      <h2>용산 푸르지오 써밋</h2>

      <p class="recommend-meta">
        용산구 한강로2가 <span>|</span> 오피스텔 <span>|</span> 84㎡
      </p>

      <div class="price">5억 ~ 7억</div>

      <div class="mini-score-row">
        <div>
          <span>역세권</span>
          <strong>95</strong>
        </div>
        <div>
          <span>직주근접</span>
          <strong>93</strong>
        </div>
        <div>
          <span>생활인프라</span>
          <strong>94</strong>
        </div>
        <div>
          <span>환경접근성</span>
          <strong>91</strong>
        </div>
      </div>
    </div>

    <div class="score-circle" style="--score: 92;">
      <div class="score-inner">
        <strong>92<span>점</span></strong>
        <small>적합도</small>
      </div>
    </div>

    <button class="outline-data-btn" onclick="moveTo('teo')">
      환경 데이터 보기
    </button>
  `;
  }

  if (masterBubble) {
    masterBubble.innerHTML = `
      ${userName}님이 설정하신 조건을 기준으로 분석한 결과,
      ${region}에서는 <strong>용산 푸르지오 써밋 오피스텔</strong>이 가장 적합합니다.
      직주근접, 역세권, 생활 인프라 측면에서 높은 점수를 받았습니다.
    `;
  }

  if (checkList) {
    checkList.innerHTML = `
      · 신용산역 도보권으로 출퇴근 접근성이 우수합니다.<br />
      · 한강과 생활 인프라 접근성이 좋아 1인 가구 생활 만족도가 높습니다.<br />
      · 관리비와 가격대는 계약 전 확인이 필요합니다.
    `;
  }

  if (analysisStandby) {
    analysisStandby.style.display = "none";
  }

  const chatWindow = document.getElementById("chatWindow");

  if (chatWindow && !document.getElementById("quickQuestionBox")) {
    const quickBox = document.createElement("div");
    quickBox.id = "quickQuestionBox";
    quickBox.innerHTML = `
      <div class="quick-question" onclick="quickAsk('주변 소음은 어떤가요?')">주변 소음은 어떤가요?</div>
      <div class="quick-question" onclick="quickAsk('출퇴근은 괜찮나요?')">출퇴근은 괜찮나요?</div>
      <div class="quick-question" onclick="quickAsk('생활 인프라는 어떤가요?')">생활 인프라는 어떤가요?</div>
      <div class="quick-question" onclick="quickAsk('최종 추천 이유는?')">최종 추천 이유는?</div>
    `;

    chatWindow.appendChild(quickBox);
  }

  if (chatInputBox) {
    chatInputBox.classList.remove("locked-input");
    chatInputBox.innerHTML = `
      <input id="chatInput" type="text" placeholder="무엇이든 물어보세요..." onkeydown="handleEnter(event)" />
      <button class="send-btn" onclick="sendMessage()">➤</button>
    `;
  }

  if (taoMapPreviewSection) {
    taoMapPreviewSection.classList.remove("locked-card");
    taoMapPreviewSection.removeAttribute("onclick");
    taoMapPreviewSection.style.cursor = "default";
  }

  if (taoMapPreviewDesc) {
    taoMapPreviewDesc.textContent = `${region} 후보 공간을 거래유형, 방 구조, 가격대별로 비교합니다.`;
  }

  if (lockedMap) {
    lockedMap.className = "tao-preview-cards tao-preview-wide";

    const places = getTaoMapPreviewPlaces(dealType);

    lockedMap.innerHTML = places.map((place, index) => `
    <div class="tao-preview-card ${index === 0 ? "active" : ""}" onclick="moveTo('map')">
      <div class="tao-rank">${index + 1}</div>

      <img src="${place.image}" alt="${place.name}" />

      <div class="tao-preview-info">
        <h4>${place.name}</h4>

        <div class="tao-preview-meta">
          ${place.area}<br />
          ${place.propertyType || "오피스텔"} · ${place.size || "84㎡"}<br />
          ${place.dealType} ${place.price}
        </div>
      </div>

      <div class="tao-preview-score" style="--score:${place.score};">
        <strong>${place.score}<span>점</span></strong>
        <small>적합도</small>
      </div>

      <div class="tao-preview-arrow">›</div>
    </div>
  `).join("");
  }
}
function quickAsk(question) {

  const chatWindow = document.getElementById("chatWindow");

  if (!chatWindow) return;

  const userBubble = document.createElement("div");
  userBubble.className = "bubble user";
  userBubble.textContent = question;

  chatWindow.appendChild(userBubble);

  let answer = "";

  switch (question) {

    case "주변 소음은 어떤가요?":
      answer =
        "도로변과의 거리가 있어 실내 유입 소음은 낮은 편으로 분석됩니다. 다만 야간 시간대 차량 흐름은 실제 방문 시 확인하는 것이 좋습니다.";
      break;

    case "출퇴근은 괜찮나요?":
      answer =
        "신용산역 도보권에 위치하여 강남과 여의도 접근성이 우수합니다. 직주근접을 중요하게 생각하는 직장인에게 적합합니다.";
      break;

    case "생활 인프라는 어떤가요?":
      answer =
        "반경 500m 내 편의점, 카페, 병원, 대형마트가 위치해 있어 생활 편의성이 높은 편입니다.";
      break;

    case "최종 추천 이유는?":
      answer =
        "설정하신 직주근접, 역세권, 생활 인프라 조건과 예산 범위를 가장 잘 충족하여 1순위 후보로 추천되었습니다.";
      break;

    default:
      answer =
        "추가 분석 기능은 준비 중입니다.";
  }

  const botWrap = document.createElement("div");
  botWrap.className = "chat-row";

  botWrap.innerHTML = `
    <div class="avatar">T</div>
    <div class="bubble">
      ${answer}
    </div>
  `;

  chatWindow.appendChild(botWrap);

  chatWindow.scrollTop = chatWindow.scrollHeight;
}
function deleteAccount() {

  if (!confirm("정말 회원탈퇴 하시겠습니까?")) {
    return;
  }

  localStorage.removeItem("demoUserName");
  localStorage.removeItem("demoUserEmail");
  localStorage.removeItem("demoUserPassword");
  localStorage.removeItem("demoUserHousehold");
  localStorage.removeItem("demoUserJob");

  localStorage.removeItem("currentUserName");

  localStorage.removeItem("hasPreference");
  localStorage.removeItem("region");
  localStorage.removeItem("dealType");
  localStorage.removeItem("budget");
  localStorage.removeItem("noise");
  localStorage.removeItem("houseType");
  localStorage.removeItem("priorities");

  alert("회원탈퇴가 완료되었습니다.");

  location.reload();
}
function getTaoMapPreviewPlaces(dealType) {
  if (dealType === "월세") {
    return [
      {
        name: "용산역 원룸 오피스텔",
        area: "한강로2가",
        dealType: "월세",
        roomType: "원룸형",
        price: "보증금 1,000~3,000 / 월세 60~80",
        score: 89,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "신용산 투룸 오피스텔",
        area: "한강로3가",
        dealType: "월세",
        roomType: "투룸형",
        price: "보증금 5,000~1억 / 월세 80~100",
        score: 86,
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "후암동 소형 주거지",
        area: "후암동",
        dealType: "월세",
        roomType: "원룸형",
        price: "보증금 500~1,000 / 월세 40~60",
        score: 82,
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"
      }
    ];
  }

  if (dealType === "전세") {
    return [
      {
        name: "시티파크 오피스텔",
        area: "한강로3가",
        dealType: "전세",
        roomType: "투룸형",
        price: "전세 3억~5억",
        score: 90,
        image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "용산시티하우스",
        area: "한강로3가",
        dealType: "전세",
        roomType: "원룸형",
        price: "전세 2억~3억",
        score: 86,
        image: "https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "효창동 소형 아파트",
        area: "효창동",
        dealType: "전세",
        roomType: "투룸형",
        price: "전세 3억~5억",
        score: 84,
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
      }
    ];
  }

  return [
    {
      name: "용산 푸르지오 써밋 오피스텔",
      area: "한강로2가",
      dealType: "매매",
      propertyType: "오피스텔",
      size: "84㎡",
      roomType: "투룸형",
      price: "5억~7억",
      score: 92,
      image: "img/yongsan-prugio-summit.png"
    },
    {
      name: "시티파크 라이트룸",
      area: "한강로3가",
      dealType: "전세",
      propertyType: "투룸형",
      size: "59㎡",
      roomType: "투룸형",
      price: "4.8억",
      score: 88,
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "후암 슬로우하우스",
      area: "후암동",
      dealType: "월세",
      propertyType: "원룸형",
      size: "36㎡",
      roomType: "원룸형",
      price: "1000/78",
      score: 84,
      image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80"
    }
  ];
}
const teoProperties = {
  a: {
    title: "용산 푸르지오 써밋",
    score: 92,
    text: "1번 핀 · 용산 푸르지오 써밋. 신용산역 도보권. 강남 24분, 용산역 7분, 한강공원 8분 접근. 생활 인프라 상, 업무지구 접근성이 강한 매매형 가상 매물입니다."
  },
  b: {
    title: "시티파크 라이트룸",
    score: 88,
    text: "2번 핀 · 여의도 18분, 용산공원 6분, 아이파크몰 생활권. 산책 동선과 상업시설 접근이 균형적인 전세형 가상 매물입니다."
  },
  c: {
    title: "후암 슬로우하우스",
    score: 84,
    text: "3번 핀 · 서울역 14분, 후암동 골목 상권과 카페 접근. 예산 부담은 낮지만 언덕·골목 동선 확인이 필요한 월세 가상 매물입니다."
  }
};

const teoPropertyMapMeta = {
  a: {
    title: "용산 푸르지오 써밋",
    meta: "한강로2가 · 오피스텔 · 84㎡ · 매매 5억~7억",
    img: "img/yongsan-prugio-summit.png",
    chips: ["용산역 7분", "강남 24분", "생활인프라 상", "적합도 92"]
  },
  b: {
    title: "시티파크 라이트룸",
    meta: "한강로3가 · 투룸형 · 59㎡ · 전세 4.8억",
    img: "img/yongsan-prugio-summit.png",
    chips: ["여의도 18분", "공원 접근", "아이파크몰 생활권", "적합도 88"]
  },
  c: {
    title: "후암 슬로우하우스",
    meta: "후암동 · 원룸형 · 36㎡ · 월세 1000/78",
    img: "img/yongsan-prugio-summit.png",
    chips: ["서울역 14분", "골목 상권", "예산 절감형", "적합도 84"]
  }
};

function updateTeoMapPropertyCard(id) {
  const data = teoPropertyMapMeta[id] || teoPropertyMapMeta.a;
  const card = document.getElementById("teoMapPropertyCard");
  if (!card) return;
  const img = card.querySelector("img");
  const title = document.getElementById("teoMapPropertyTitle");
  const meta = document.getElementById("teoMapPropertyMeta");
  const grid = card.querySelector(".teo-property-map-grid");
  if (img) img.src = data.img;
  if (title) title.textContent = data.title;
  if (meta) meta.textContent = data.meta;
  if (grid) grid.innerHTML = data.chips.map(item => `<span>${item}</span>`).join("");
}

const teoOptions = {
  sunlight: {
    title: "일조량",
    label: "일조량 영상",
    desc: "남향 기준 오전부터 오후까지 빛의 이동을 확인하는 실내 뷰입니다.",
    score: 86,
    video: "video/sunlight.mp4",
    hasVideo: false
  },
  dust: {
    title: "미세먼지",
    label: "미세먼지 영상",
    desc: "외부 도로와 창호 위치를 기준으로 실내 유입 가능성을 보여주는 뷰입니다.",
    score: 81,
    video: "video/finedust.mp4",
    hasVideo: false
  },
  ventilation: {
    title: "환기",
    label: "환기 영상",
    desc: "창문 위치와 실내 동선을 기준으로 공기 흐름을 확인하는 뷰입니다.",
    score: 78,
    video: "video/KakaoTalk_Video_2026-06-17-16-31-50.mp4",
    hasVideo: true
  }
};

function selectTeoProperty(id) {
  document.querySelectorAll(".teo-property-card, .teo-pin").forEach(el => el.classList.remove("active"));
  const card = document.getElementById(`teoProperty${id.toUpperCase()}`);
  const pin = document.querySelector(`.pin-${id}`);
  const localText = document.getElementById("teoLocalText");
  const property = teoProperties[id] || teoProperties.a;
  if (card) card.classList.add("active");
  if (pin) pin.classList.add("active");
  if (localText) localText.textContent = property.text;
  updateTeoMapPropertyCard(id);
}

function openTeoIndoor(id) {
  selectTeoProperty(id);
  const property = teoProperties[id] || teoProperties.a;
  const outdoor = document.getElementById("teoOutdoorStage");
  const indoor = document.getElementById("teoIndoorStage");
  const back = document.getElementById("teoBackBtn");
  const title = document.getElementById("teoIndoorTitle");
  const score = document.getElementById("teoIndoorScore");

  if (outdoor) outdoor.classList.remove("active");
  if (indoor) indoor.classList.add("active");
  if (back) back.classList.add("active");
  if (title) title.textContent = property.title;
  if (score) score.textContent = `적합도 ${property.score}`;

  changeTeoOption("sunlight");
}

function showTeoOutdoor() {
  const outdoor = document.getElementById("teoOutdoorStage");
  const indoor = document.getElementById("teoIndoorStage");
  const back = document.getElementById("teoBackBtn");

  if (indoor) indoor.classList.remove("active");
  if (outdoor) outdoor.classList.add("active");
  if (back) back.classList.remove("active");
}

function changeTeoOption(optionId) {
  const option = teoOptions[optionId] || teoOptions.sunlight;
  const video = document.getElementById("teoVideo");
  const source = document.getElementById("teoVideoSource");

  document.querySelectorAll(".teo-option").forEach(btn => btn.classList.remove("active"));
  const activeButton = Array.from(document.querySelectorAll(".teo-option"))
    .find(btn => btn.textContent.trim() === option.title);
  if (activeButton) activeButton.classList.add("active");

  const title = document.getElementById("teoOptionTitle");
  const desc = document.getElementById("teoOptionDesc");
  const score = document.getElementById("teoOptionScore");
  const bar = document.getElementById("teoMeterBar");
  const label = document.getElementById("teoVideoLabel");
  const placeholder = document.getElementById("teoVideoPlaceholder");

  if (title) title.textContent = option.title;
  if (desc) desc.textContent = option.desc;
  if (score) score.textContent = option.score;
  if (bar) bar.style.width = `${option.score}%`;
  if (label) label.textContent = option.label;
  if (placeholder) {
    const span = placeholder.querySelector("span");
    if (span) span.textContent = option.hasVideo
      ? "환기 시뮬레이션 영상을 재생합니다."
      : `${option.video} 파일을 넣으면 이 영역에서 재생됩니다.`;
    placeholder.style.display = option.hasVideo ? "none" : "flex";
  }

  if (source && video) {
    source.src = option.video;
    video.load();
    if (option.hasVideo) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }
}

// L-Rod / Teo / Master Tao updated interaction layer
const profileDefaults = {
  nickname: "Jun",
  age: "34",
  area: "용산구·마포구",
  hobby: "산책, 카페, 전시",
  job: "직장인",
  activeTime: "평일 저녁"
};

const masterPropertyDetails = {
  a: {
    name: "용산 푸르지오 써밋",
    score: 92,
    local: "신용산역과 용산역을 동시에 쓰는 생활권입니다. 대형몰, 영화관, 병원, 카페 접근성이 좋아 퇴근 후 생활 동선이 짧습니다. 야간에도 유동 인구가 있어 편의성은 높지만 조용한 주거감을 원하면 층수와 창 방향 확인이 필요합니다.",
    price: "5억~7억 구간의 후보입니다. 교통·상업 인프라 프리미엄이 반영된 가격대로 보고, 관리비와 실거래 변동 폭을 함께 확인하는 방식의 시세 분석이 필요합니다."
  },
  b: {
    name: "시티파크 라이트룸",
    score: 88,
    local: "한강로3가 투룸형 후보로 여의도 접근 18분, 공원 접근성, 대형몰 생활권이 강점입니다. 생활 편의와 산책 동선이 균형적이며 주말 외출 동선도 짧은 편입니다.",
    price: "전세 4.8억 구간의 후보입니다. 대표 후보보다 초기 부담을 조절하면서도 한강로3가 생활권과 공원 접근성을 함께 확보하는 매물입니다."
  },
  c: {
    name: "후암 슬로우하우스",
    score: 84,
    local: "후암동 원룸형 후보로 서울역 14분, 골목 상권, 카페 접근성이 강점입니다. 예산 절감형 생활권이지만 언덕과 골목 동선은 실제 이동감 확인이 필요합니다.",
    price: "월세 1000/78 구간의 예산 절감형 후보입니다. 시세 상승 기대보다 월 지출 안정성과 서울역 접근성을 중심으로 판단하는 매물입니다."
  }
};

function getProfileValue(key) {
  return localStorage.getItem(`lrod_${key}`) || profileDefaults[key];
}

function renderLrodState() {
  const section = document.getElementById("lrod");
  const panel = document.getElementById("lrodProfilePanel");
  const tags = document.getElementById("lrodTags");
  const radar = document.getElementById("lrodRadar");
  const logged = !!localStorage.getItem("currentUserName");
  if (!section || !panel || !tags || !radar) return;

  radar.classList.add("radar-paused");
  radar.classList.remove("radar-scanning");
  section.classList.remove("lrod-ready", "lrod-scanning");

  if (!logged) {
    panel.innerHTML = `<div class="lrod-profile-empty">로그인 전에는 레이더가 작동하지 않습니다.</div>`;
    tags.innerHTML = `<span class="tag">로그인 필요</span><span class="tag">레이더 정지</span><span class="tag">프로필 대기</span>`;
    return;
  }

  section.classList.add("lrod-ready");
  radar.classList.remove("radar-paused");
  radar.classList.add("radar-scanning");

  const name = localStorage.getItem("currentUserName") || getProfileValue("nickname");
  panel.innerHTML = `
    <div class="lrod-profile-summary">
      <strong>${getProfileValue("nickname")}</strong> · ${getProfileValue("age")}세<br />
      주요활동지역: ${getProfileValue("area")}<br />
      직업: ${getProfileValue("job")} · 활동시간대: ${getProfileValue("activeTime")}
    </div>
    <div class="lrod-profile-grid">
      <div class="lrod-profile-row"><span>닉네임</span><input id="lrodNickname" value="${getProfileValue("nickname")}" oninput="saveLrodProfile()" /></div>
      <div class="lrod-profile-row"><span>나이</span><input id="lrodAge" type="number" min="19" max="90" value="${getProfileValue("age")}" oninput="saveLrodProfile()" /></div>
      <div class="lrod-profile-row"><span>활동지역</span><input id="lrodArea" value="${getProfileValue("area")}" oninput="saveLrodProfile()" /></div>
      <div class="lrod-profile-row"><span>취미</span><input id="lrodHobby" value="${getProfileValue("hobby")}" oninput="saveLrodProfile()" /></div>
      <div class="lrod-profile-row"><span>직업</span><input id="lrodJob" value="${getProfileValue("job")}" oninput="saveLrodProfile()" /></div>
      <div class="lrod-profile-row"><span>활동시간</span><select id="lrodActiveTime" onchange="saveLrodProfile()"><option>아침형</option><option>평일 저녁</option><option>야간형</option><option>주말 중심</option></select></div>
    </div>`;
  const sel = document.getElementById("lrodActiveTime");
  if (sel) sel.value = getProfileValue("activeTime");
  tags.innerHTML = `<span class="tag">${name}</span><span class="tag">${getProfileValue("job")}</span><span class="tag">${getProfileValue("activeTime")}</span><span class="tag">탐색 대기</span>`;
}

function saveLrodProfile() {
  const map = { nickname:"lrodNickname", age:"lrodAge", area:"lrodArea", hobby:"lrodHobby", job:"lrodJob", activeTime:"lrodActiveTime" };
  Object.entries(map).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) localStorage.setItem(`lrod_${key}`, el.value);
  });
  const tags = document.getElementById("lrodTags");
  if (tags) tags.innerHTML = `<span class="tag">${getProfileValue("nickname")}</span><span class="tag">${getProfileValue("job")}</span><span class="tag">${getProfileValue("activeTime")}</span><span class="tag">탐색 대기</span>`;
}

function startLrodSearch() {
  saveLrodProfile();
  const radar = document.getElementById("lrodRadar");
  const section = document.getElementById("lrod");
  const tags = document.getElementById("lrodTags");
  if (radar) { radar.classList.remove("radar-paused"); radar.classList.add("radar-scanning"); }
  if (section) section.classList.add("lrod-scanning");
  if (tags) tags.innerHTML = `<span class="tag">레이더 작동</span><span class="tag">${getProfileValue("area")}</span><span class="tag">${getProfileValue("hobby")}</span>`;
  activatePersonalizedResult();
}

function updateTeoRegion() {
  const gu = document.getElementById("teoGu")?.value || "용산구";
  const dong = document.getElementById("teoDong")?.value || "한강로2가";
  const msg = document.getElementById("teoRegionMessage");
  if (!msg) return;
  if (gu !== "용산구") {
    msg.textContent = "현재 시험 단계에서는 서울시 용산구만 제공합니다.";
    msg.classList.add("warning");
  } else {
    msg.textContent = `서울시 용산구 ${dong} 데이터를 표시합니다.`;
    msg.classList.remove("warning");
  }
}

const oldOpenTeoIndoor = openTeoIndoor;
openTeoIndoor = function(id) {
  oldOpenTeoIndoor(id);
  updateMasterAnalysis(id);
  updateTaoArchive(id);
};

function updateMasterAnalysis(id) {
  const d = masterPropertyDetails[id] || masterPropertyDetails.a;
  const selected = document.getElementById("masterSelectedText");
  const score = document.getElementById("masterScore");
  const local = document.getElementById("masterLocalText");
  const price = document.getElementById("masterPriceText");
  const note = document.getElementById("masterNote");
  if (selected) selected.textContent = `${d.name}은 선택한 생활 기준에서 ${d.score}점으로 분석됩니다. 접근성, 생활 인프라, 실내 환경 데이터를 함께 읽는 후보입니다.`;
  if (score) score.textContent = d.score;
  if (local) local.textContent = d.local;
  if (price) price.textContent = d.price;
  if (note) note.textContent = "Master Tao는 시세 해석과 동네 생활감을 함께 말하는 상담형 페르소나입니다. 숫자 기반 분석과 커뮤니티형 체감 정보를 분리해서 보여줍니다.";
}

function updateTaoArchive(id) {
  const d = masterPropertyDetails[id] || masterPropertyDetails.a;
  localStorage.setItem("taoSelected", id);
  const body = document.getElementById("taoArchiveBody");
  if (!body) return;
  Array.from(body.querySelectorAll("tr")).forEach(row => row.classList.remove("selected-archive"));
  const rows = Array.from(body.querySelectorAll("tr"));
  const target = rows.find(row => row.cells[0]?.textContent.includes(d.name.replace("용산 ", "")) || row.cells[0]?.textContent.includes(d.name));
  if (target) target.classList.add("selected-archive");
}

const oldSetLoggedInUser = setLoggedInUser;
setLoggedInUser = function(name, household, job) {
  oldSetLoggedInUser(name, household, job);
  if (!localStorage.getItem("lrod_nickname")) localStorage.setItem("lrod_nickname", name || profileDefaults.nickname);
  if (!localStorage.getItem("lrod_job")) localStorage.setItem("lrod_job", job || profileDefaults.job);
  renderLrodState();
};

const oldLogoutUser = logoutUser;
logoutUser = function() {
  localStorage.removeItem("lrod_nickname");
  localStorage.removeItem("lrod_age");
  localStorage.removeItem("lrod_area");
  localStorage.removeItem("lrod_hobby");
  localStorage.removeItem("lrod_job");
  localStorage.removeItem("lrod_activeTime");
  oldLogoutUser();
};

document.addEventListener("DOMContentLoaded", function() {
  const name = localStorage.getItem("currentUserName");
  if (name) {
    renderLrodState();
  } else {
    renderLrodState();
  }
  updateTeoRegion();
  updateMasterAnalysis(localStorage.getItem("taoSelected") || "a");
});

/* ===== 0614 final interaction override ===== */
(function(){
  const PRUGIO_IMG = 'img/yongsan-prugio-summit.png';
  const PROPERTY = {
    name:'용산 푸르지오 써밋', area:'서울시 용산구 한강로2가', type:'오피스텔', size:'84㎡', price:'5억 ~ 7억', score:92,
    meta:'신용산역 도보권 · 용산역 7분 · 한강공원 8분 · 생활 인프라 상'
  };
  const baseActivate = window.activatePersonalizedResult;

  function promoHTML(){
    return `<div class="lrod-promo">
      <div class="recommend-label">MYOUNGDANG AI SPACE SCANNER</div>
      <h2>내 생활 패턴에 맞는 공간을 먼저 읽어보는 서비스</h2>
      <p>활동지역, 생활시간, 직업, 취미와 예산을 바탕으로 주거 후보를 탐색합니다.<br>탐색 전에는 라이프스타일 기준만 정리합니다.</p>
      <div class="promo-metrics">
        <div class="promo-metric"><strong>L-Rod</strong><span>생활 기준 스캔</span></div>
        <div class="promo-metric"><strong>Teo</strong><span>매물·실내 뷰포트</span></div>
        <div class="promo-metric"><strong>Tao</strong><span>시세·생활권 분석</span></div>
        <div class="promo-metric"><strong>Map</strong><span>후보 아카이빙</span></div>
      </div>
    </div>`;
  }
  function setPromoState(){
    const mainCard = document.querySelector('#lrod .main');
    const title = document.querySelector('#lrod .main h2');
    const desc = document.querySelector('#lrod .main > .sub');
    const scanBox = document.querySelector('#lrod .scan-box');
    const propertyBox = document.querySelector('#lrod .property, #lrod .top-recommend-card');
    const statuses = document.querySelectorAll('#lrod .status');
    const taoMapPreviewSection = document.getElementById('taoMapPreviewSection');
    const taoMapPreviewDesc = document.getElementById('taoMapPreviewDesc');
    const taoMapPreview = document.getElementById('taoMapPreview');
    const bubble = document.querySelector('#lrod .chat-window .bubble');
    const checkList = document.querySelector('#lrod .check-list');
    const quickBox = document.getElementById('quickQuestionBox');
    const chatInputBox = document.querySelector('#lrod .chat-input-box');
    const analysisStandby = document.querySelector('#lrod .analysis-standby');

    if(mainCard) mainCard.classList.remove('analyzed');
    if(title) title.textContent = 'Teo AI Scanning';
    if(desc) desc.innerHTML = '로그인 후 서울시 내 원하는 지역, 거래 조건, 생활 인프라, 소음 민감도 등을 입력하면 개인화된 명당 분석이 시작됩니다.';
    if(scanBox) scanBox.style.display = '';
    statuses.forEach((el,i)=>{el.textContent = ['지역 선택 대기','예산 입력 대기','생활 기준 대기','분석 전'][i] || '분석 전';});
    if(propertyBox){
      propertyBox.className='property locked-property';
      propertyBox.innerHTML = promoHTML();
    }
    if(bubble) bubble.textContent = '로그인 후 Master Tao와 개인 맞춤형 입지 상담을 시작할 수 있습니다.';
    if(analysisStandby) analysisStandby.style.display = '';
    if(checkList) {
      checkList.innerHTML = `
        · 원하는 지역을 입력하면 후보지를 분석합니다.<br />
        · 예산과 생활 패턴에 따라 적합도를 계산합니다.<br />
        · 소음, 역세권, 생활 인프라 기준을 반영합니다.
      `;
    }
    if(quickBox) quickBox.remove();
    if(chatInputBox) {
      chatInputBox.className = 'chat-input-box locked-input';
      chatInputBox.innerHTML = `
        <input type="text" placeholder="로그인 후 질문할 수 있어요." disabled />
        <button class="send-btn" onclick="moveTo('login')">➤</button>
      `;
    }
    if(taoMapPreviewSection) {
      taoMapPreviewSection.classList.add('locked-card');
      taoMapPreviewSection.setAttribute('onclick', "moveTo('login')");
      taoMapPreviewSection.style.cursor = 'pointer';
    }
    if(taoMapPreviewDesc) taoMapPreviewDesc.textContent = '로그인 후 후보 공간 비교 지도를 확인할 수 있습니다.';
    if(taoMapPreview) {
      taoMapPreview.className = 'locked-map';
      taoMapPreview.innerHTML = `🔒 아직 추천 후보가 없습니다.<br />로그인 후 생활 기준을 설정하면 후보지가 표시됩니다.`;
    }
  }
  function polishResult(){
    const img = document.querySelector('#lrod .top-recommend-img');
    if(img) img.src = PRUGIO_IMG;
    const title = document.querySelector('#lrod .main h2');
    if(title) title.textContent = 'L-Rod 탐색 결과';
    const desc = document.querySelector('#lrod .main > .sub');
    if(desc) desc.innerHTML = `${getProfileValue('nickname')}님의 생활 기준을 기준으로 1순위 후보를 도출했습니다.<br>${PROPERTY.area} · ${PROPERTY.type} · ${PROPERTY.size} · ${PROPERTY.price}`;
  }
  window.activatePersonalizedResult = function(){
    const hasAnalysis = localStorage.getItem('hasPreference') === 'true' || localStorage.getItem('lrodSearchStarted') === 'true';
    if(!hasAnalysis) { setPromoState(); return; }
    localStorage.setItem('lrodSearchStarted','true');
    if(typeof baseActivate === 'function') baseActivate();
    polishResult();
  };

  const baseRender = window.renderLrodState;
  window.renderLrodState = function(){
    if(typeof baseRender === 'function') baseRender();
    const hasAnalysis = localStorage.getItem('hasPreference') === 'true' || localStorage.getItem('lrodSearchStarted') === 'true';
    if(hasAnalysis) {
      window.activatePersonalizedResult();
    } else {
      setPromoState();
    }
  };

  window.startLrodSearch = function(){
    saveLrodProfile();
    localStorage.setItem('lrodSearchStarted','true');
    const radar = document.getElementById('lrodRadar');
    const section = document.getElementById('lrod');
    const tags = document.getElementById('lrodTags');
    if(radar){radar.classList.remove('radar-paused');radar.classList.add('radar-scanning');}
    if(section) section.classList.add('lrod-scanning');
    if(tags) tags.innerHTML = `<span class="tag">SCANNING...</span><span class="tag">${getProfileValue('area')}</span><span class="tag">${getProfileValue('hobby')}</span>`;
    window.activatePersonalizedResult();
    typeMaster('lrod', `${getProfileValue('nickname')}님의 조건을 기준으로 탐색을 시작했습니다. 1순위 후보는 ${PROPERTY.name}입니다. ${PROPERTY.meta}. 시세는 ${PROPERTY.price} 구간으로 설정 조건과 맞습니다.`);
  };

  function typeMaster(where, text){
    const bubble = where === 'lrod' ? document.querySelector('#lrod .chat-window .bubble') : document.getElementById('masterNote');
    if(!bubble) return;
    bubble.classList.add('typing-caret');
    bubble.textContent = '';
    let i=0; const timer=setInterval(()=>{ bubble.textContent = text.slice(0, i++); if(i>text.length){clearInterval(timer); bubble.classList.remove('typing-caret');}}, 18);
  }
  window.typeMaster = typeMaster;

  // Teo map search overlay and pin popup labels
  function setupTeoMap(){
    document.querySelectorAll('.teo-pin').forEach(pin=>{
      if(pin.classList.contains('pin-a')) pin.setAttribute('data-popup','용산 푸르지오 써밋 · 84㎡ · 매매 5억~7억 · 용산역 7분 · 생활인프라 상');
      if(pin.classList.contains('pin-b')) pin.setAttribute('data-popup','시티파크 라이트룸 · 59㎡ · 전세 4.8억 · 여의도 18분 · 공원 접근');
      if(pin.classList.contains('pin-c')) pin.setAttribute('data-popup','후암 슬로우하우스 · 36㎡ · 월세 1000/78 · 서울역 14분 · 골목 상권');
    });
    const search = document.getElementById('teoMapSearch');
    if(search) search.remove();
  }

  // Override Teo property data for consistency
  if(window.teoProperties){
    teoProperties.a.title = PROPERTY.name;
    teoProperties.a.score = PROPERTY.score;
    teoProperties.a.text = `1번 핀 · ${PROPERTY.name}. ${PROPERTY.meta}. ${PROPERTY.type} ${PROPERTY.size}, 매매 ${PROPERTY.price}의 1순위 가상 매물입니다.`;
  }
  const baseOpen = window.openTeoIndoor;
  window.openTeoIndoor = function(id){
    if(typeof baseOpen === 'function') baseOpen(id);
    const title = document.getElementById('teoIndoorTitle');
    if(id === 'a' && title) title.textContent = PROPERTY.name;
    updateMasterAnalysis(id || 'a');
    typeMaster('master', masterTabAnswers.summary);
  };

  const masterTabAnswers = {
    summary:`${PROPERTY.name}은 직주근접, 용산역·신용산역 접근, 대형 상업시설 이용성이 강한 1순위 후보입니다. 예산 ${PROPERTY.price} 범위에서 생활 편의와 상징성이 높은 매물로 분류됩니다.`,
    env:'일조량은 남향 기준 우수한 편으로 설정했고, 미세먼지와 환기는 도로 접근성과 창호 방향을 함께 확인해야 합니다. 실내 뷰포트에서는 일조량·미세먼지·환기 버튼으로 조건별 화면을 전환합니다.',
    infra:'당근 동네생활에서 나올 법한 정보로 보면 카페, 편의점, 병원, 대형몰 접근성이 좋고 퇴근 후 동선이 짧습니다. 야간 유동인구가 있어 편의성은 높지만 조용함은 층수와 방향에 따라 달라집니다.',
    price:'시세 분석 관점에서는 용산역세권·업무지구·상업시설 프리미엄이 반영된 후보입니다. 계약 전에는 최근 실거래, 관리비, 전월세 전환 가능성, 향후 개발 이슈를 함께 확인해야 합니다.'
  };
  function setupMasterTabs(){
    const tabs = document.querySelectorAll('.chat-tab');
    const keys = ['summary','env','infra','price'];
    tabs.forEach((tab,i)=>{
      tab.onclick = function(){
        tabs.forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        const chatWindow = document.getElementById('chatWindow');
        if(chatWindow){
          const row = document.createElement('div'); row.className = 'chat-row bot-chat';
          row.innerHTML = `<div class="avatar">T</div><div class="bubble typing-caret"></div>`;
          chatWindow.appendChild(row);
          const bubble = row.querySelector('.bubble'); let text = masterTabAnswers[keys[i]] || masterTabAnswers.summary; let n=0;
          const timer=setInterval(()=>{bubble.textContent=text.slice(0,n++); if(n>text.length){clearInterval(timer); bubble.classList.remove('typing-caret');}},16);
          chatWindow.scrollTop = chatWindow.scrollHeight;
        }
        typeMaster('master', masterTabAnswers[keys[i]] || masterTabAnswers.summary);
      };
    });
  }
  const baseUpdateMaster = window.updateMasterAnalysis;
  window.updateMasterAnalysis = function(id){
    if(typeof baseUpdateMaster === 'function') baseUpdateMaster(id);
    if(id === 'a'){
      const selected=document.getElementById('masterSelectedText');
      if(selected) selected.textContent = `${PROPERTY.name}은 ${PROPERTY.score}점으로 분석됩니다. 용산역·신용산역 접근, 대형 생활 인프라, 실내 환경 데이터를 함께 읽는 1순위 후보입니다.`;
    }
  };

  document.addEventListener('DOMContentLoaded', function(){
    setupTeoMap(); setupMasterTabs();
    if(localStorage.getItem('currentUserName') && localStorage.getItem('hasPreference') === 'true') {
      localStorage.setItem('lrodSearchStarted','true');
      window.activatePersonalizedResult();
    } else {
      localStorage.removeItem('lrodSearchStarted');
      setPromoState();
    }
  });
})();


document.addEventListener('DOMContentLoaded', function(){
  updateTeoMapPropertyCard('a');
  const search = document.getElementById('teoMapSearch');
  if (search) search.remove();
});


/* ===== Final requested behavior patch: no pre-login personal data, Teo right-side listings, clean map ===== */
(function(){
  function isLogged(){
    const userArea = document.getElementById('userArea');
    return !!localStorage.getItem('currentUserName') && !userArea?.querySelector('.top-auth-btn');
  }

  function currentDisplayName(){
    return localStorage.getItem('currentUserName') || getProfileValue('nickname') || '사용자';
  }

  function syncLrodTagGrid(){
    const tags = document.getElementById('lrodTags');
    if(!tags) return;
    const count = tags.querySelectorAll('.tag').length;
    tags.dataset.count = String(Math.min(Math.max(count, 1), 4));
  }

  function syncLrodIntro(){
    const intro = document.querySelector('#lrod .grid > .locked-card:first-child > .sub:nth-of-type(2)');
    if(intro && isLogged()) intro.textContent = `${currentDisplayName()}님의 공간 분석입니다.`;
    syncLrodTagGrid();
  }

  function requireSignupLrod(){
    const panel = document.getElementById('lrodProfilePanel');
    const tags = document.getElementById('lrodTags');
    const radar = document.getElementById('lrodRadar');
    const section = document.getElementById('lrod');
    const intro = document.querySelector('#lrod .grid > .locked-card:first-child > .sub:nth-of-type(2)');
    if(radar){ radar.classList.add('radar-paused'); radar.classList.remove('radar-scanning'); }
    if(section){ section.classList.remove('lrod-ready','lrod-scanning'); }
    if(intro) intro.textContent = '로그인 후 생활 기준을 설정하면 AI 공간 분석이 시작됩니다.';
    if(panel){
      panel.innerHTML = `<div class="lrod-profile-empty lrod-join-required"><strong>로그인 후 진행해주세요.</strong><span>로그인 전에는 퍼스널 데이터와 추천 매물 정보를 표시하지 않습니다. 로그인 후 프로필 파라미터를 입력하면 L-Rod 탐색을 시작할 수 있습니다.</span></div>`;
    }
    if(tags){ tags.innerHTML = `<span class="tag">로그인 필요</span><span class="tag">레이더 정지</span><span class="tag">프로필 대기</span>`; }
    syncLrodTagGrid();
  }

  function resetPreLoginLrodContent(){
    const mainCard = document.querySelector('#lrod .main');
    const title = document.querySelector('#lrod .main h2');
    const desc = document.querySelector('#lrod .main > .sub');
    const scanBox = document.querySelector('#lrod .scan-box');
    const propertyBox = document.querySelector('#lrod .property, #lrod .top-recommend-card');
    const statuses = document.querySelectorAll('#lrod .status');
    const taoMapPreviewSection = document.getElementById('taoMapPreviewSection');
    const taoMapPreviewDesc = document.getElementById('taoMapPreviewDesc');
    const taoMapPreview = document.getElementById('taoMapPreview');
    const quickBox = document.getElementById('quickQuestionBox');
    const chatInputBox = document.querySelector('#lrod .chat-input-box');
    const analysisStandby = document.querySelector('#lrod .analysis-standby');

    if(mainCard) mainCard.classList.remove('analyzed');
    if(title) title.textContent = 'Teo AI Scanning';
    if(desc) desc.innerHTML = '로그인 후 서울시 내 원하는 지역, 거래 조건, 생활 인프라, 소음 민감도 등을 입력하면 개인화된 명당 분석이 시작됩니다.';
    if(scanBox) scanBox.style.display = '';
    statuses.forEach((el,i)=>{el.textContent = ['지역 선택 대기','예산 입력 대기','생활 기준 대기','분석 전'][i] || '분석 전';});
    if(propertyBox){
      propertyBox.className = 'property locked-property';
      propertyBox.innerHTML = promoHTML();
    }
    if(analysisStandby) analysisStandby.style.display = '';
    if(quickBox) quickBox.remove();
    if(chatInputBox) {
      chatInputBox.className = 'chat-input-box locked-input';
      chatInputBox.innerHTML = `<input type="text" placeholder="로그인 후 질문할 수 있어요." disabled /><button class="send-btn" onclick="moveTo('login')">➤</button>`;
    }
    if(taoMapPreviewSection) {
      taoMapPreviewSection.classList.add('locked-card');
      taoMapPreviewSection.setAttribute('onclick', "moveTo('login')");
      taoMapPreviewSection.style.cursor = 'pointer';
    }
    if(taoMapPreviewDesc) taoMapPreviewDesc.textContent = '로그인 후 후보 공간 비교 지도를 확인할 수 있습니다.';
    if(taoMapPreview) {
      taoMapPreview.className = 'locked-map';
      taoMapPreview.innerHTML = `🔒 아직 추천 후보가 없습니다.<br />로그인 후 생활 기준을 설정하면 후보지가 표시됩니다.`;
    }
  }

  const previousActivatePersonalizedResult = window.activatePersonalizedResult;
  window.activatePersonalizedResult = function(){
    if(!isLogged()){
      requireSignupLrod();
      resetPreLoginLrodContent();
      return;
    }
    if(typeof previousActivatePersonalizedResult === 'function') previousActivatePersonalizedResult();
    syncLrodIntro();
  };

  const previousRenderLrodState = window.renderLrodState;
  window.renderLrodState = function(){
    if(!isLogged()){
      requireSignupLrod();
      resetPreLoginLrodContent();
      if(typeof window.activatePersonalizedResult === 'function') window.activatePersonalizedResult();
      return;
    }
    if(typeof previousRenderLrodState === 'function') previousRenderLrodState();
    syncLrodIntro();
  };

  const previousStartLrodSearch = window.startLrodSearch;
  window.startLrodSearch = function(){
    if(!isLogged()){
      requireSignupLrod();
      moveTo('signup');
      return;
    }
    if(typeof previousStartLrodSearch === 'function') previousStartLrodSearch();
    syncLrodIntro();
  };

  const previousSaveLrodProfile = window.saveLrodProfile;
  window.saveLrodProfile = function(){
    if(typeof previousSaveLrodProfile === 'function') previousSaveLrodProfile();
    syncLrodIntro();
  };

  function syncTeoListings(){
    const panel = document.querySelector('#teo .teo-list-panel');
    if(panel){ panel.style.display = 'flex'; }
    const title = panel?.querySelector('.teo-panel-title span');
    const small = panel?.querySelector('.teo-panel-title small');
    if(title) title.textContent = '매물 후보 3';
    if(small) small.textContent = '목록 클릭 또는 지도 핀 선택';

    const cardA = document.getElementById('teoPropertyA');
    const cardB = document.getElementById('teoPropertyB');
    const cardC = document.getElementById('teoPropertyC');
    if(cardA) cardA.innerHTML = `<strong>1. 용산 푸르지오 써밋</strong><span>서울시 용산구 한강로2가 · 오피스텔 · 84㎡ · 매매 5억~7억</span><em>🚇 용산역 7분 · 🛒 생활인프라 상 · 🏙 한강공원 8분</em>`;
    if(cardB) cardB.innerHTML = `<strong>2. 시티파크 라이트룸</strong><span>서울시 용산구 한강로3가 · 투룸형 · 59㎡ · 전세 4.8억</span><em>🚇 여의도 18분 · 🌳 공원 접근 · 🛍 대형몰 생활권</em>`;
    if(cardC) cardC.innerHTML = `<strong>3. 후암 슬로우하우스</strong><span>서울시 용산구 후암동 · 원룸형 · 36㎡ · 월세 1000/78</span><em>🚇 서울역 14분 · ☕ 골목 상권 · 💸 예산 절감형</em>`;

    document.querySelectorAll('#teo .teo-map-label,#teo .teo-map-note,#teo .teo-map-tint,#teo .teo-grid-map,#teoMapSearch').forEach(el=>el.remove());
    document.querySelectorAll('#teo .teo-pin').forEach(pin=>{
      if(pin.classList.contains('pin-a')) pin.setAttribute('data-popup','1순위 · 용산 푸르지오 써밋 · 84㎡ · 매매 5억~7억');
      if(pin.classList.contains('pin-b')) pin.setAttribute('data-popup','2순위 · 시티파크 라이트룸 · 59㎡ · 전세 4.8억');
      if(pin.classList.contains('pin-c')) pin.setAttribute('data-popup','3순위 · 후암 슬로우하우스 · 36㎡ · 월세 1000/78');
    });
  }

  const previousSelectTeoProperty = window.selectTeoProperty;
  window.selectTeoProperty = function(id){
    if(typeof previousSelectTeoProperty === 'function') previousSelectTeoProperty(id);
    syncTeoListings();
  };

  document.addEventListener('DOMContentLoaded', function(){
    // Prevent stale demo login data from showing personal data on first opening this revised file.
    if(!sessionStorage.getItem('md0614Initialized')){
      localStorage.removeItem('currentUserName');
      localStorage.removeItem('lrodSearchStarted');
      sessionStorage.setItem('md0614Initialized','true');
    }
    if(!isLogged()) requireSignupLrod();
    syncLrodIntro();
    syncTeoListings();
  });
})();
