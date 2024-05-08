var data = [];

function loadData(selectedItem) {
  data = []; // 데이터 초기화

  // 로딩 아이콘 및 메시지 표시
  document.getElementById("loader").style.display = "block";
  document.getElementById("loadingMessage").style.display = "block";

  var allData = []; // 모든 데이터를 저장할 배열 추가

  var baseUrl =
    "https://yczemtfqpyqbbw32mt4xm2gt7q0paxjx.lambda-url.us-east-1.on.aws/base-url"; // 수정된 부분: baseUrl 변수 추가

  fetch(baseUrl) // 수정된 부분: fetch로 데이터 요청
    .then((response) => response.json())
    .then((responseData) => {
      responseData.forEach((batchData) => {
        var processedData = processDataFromJSON(batchData, selectedItem);
        allData = allData.concat(processedData);
      });

      allData.sort(function (a, b) {
        return a.price - b.price;
      });
      displayTopSix(allData);
      document.getElementById("loader").style.display = "none";
      document.getElementById("loadingMessage").style.display = "none";
    })
    .catch((error) => console.error("Error fetching data:", error));
}

function processDataFromJSON(jsonData, selectedItem) {
  var batchData = [];

  jsonData.ListNecessariesPricesService.row.forEach(function (row) {
    var marketName = row.M_NAME;
    var guName = row.M_GU_NAME;
    var itemName = row.A_NAME;
    var itemPrice = parseInt(row.A_PRICE.replace(/[^0-9.-]+/g, ""));
    var itemDate = row.P_YEAR_MONTH;

    if (
      itemDate === "2024-04" &&
      itemName.includes(selectedItem) &&
      itemPrice !== 0
    ) {
      batchData.push({
        market: marketName,
        gu: guName,
        item: itemName,
        price: itemPrice,
      });
    }
  });

  return batchData;
}

function displayTopSix(allData) {
  var dataDisplayHTML = "";

  if (allData.length === 0) {
    dataDisplayHTML = "데이터가 존재하지 않습니다.";
  } else {
    for (var i = 0; i < Math.min(1, allData.length); i++) {
      var entry = allData[i];
      dataDisplayHTML += "<div class='data-item'>";
      dataDisplayHTML +=
        "<div id='itemName'>" +
        entry.item +
        "에 대한 최저가는" +
        "<div id='enPrice'> " +
        entry.price +
        "</div>원입니다</div>";
      dataDisplayHTML +=
        "<div id='marketName'>최저가로 판매하는 시장은 " +
        entry.gu +
        "의 " +
        "<div id='enMarket'> " +
        entry.market +
        "</div>입니다</div>";
      dataDisplayHTML += "</div>";
    }
  }

  document.getElementById("dataDisplay").innerHTML = dataDisplayHTML;

  // 중분류 업데이트
  updateSubcategories();
}

function updateSubcategories() {
  var categorySelect = document.getElementById("categorySelect");
  var itemSelect = document.getElementById("itemSelect");
  var selectedCategory = categorySelect.value;
  itemSelect.innerHTML = ""; // 중분류 메뉴 초기화
  var options = [];
  if (selectedCategory === "식재료 (채소)") {
    options = [
      "감자 1kg",
      "갓 1kg",
      "당근 1kg",
      "대파 1kg",
      "도라지 100g",
      "무 1개",
      "미나리 100g",
      "배추 1포기",
      "부추 1단",
      "애호박 1개",
      "양배추 1포기",
      "양파 1망",
      "오이(다다기) 1개",
      "시금치 1단",
      "쪽파 1kg",
      "콩 1kg",
      "콩나물 500g",
      "깻잎 100g",
      "풋고추 100g",
    ];
  } else if (selectedCategory === "식재료 (과일)") {
    options = [
      "귤 10개",
      "딸기 100g",
      "토마토 1kg",
      "복숭아 1개",
      "사과 1개",
      "살구 100g",
      "참외 1개",
      "오렌지 1개",
      "바나나 1송이",
      "포도(샤인머스켓) 1kg",
    ];
  } else if (selectedCategory === "식재료 (육류)") {
    options = [
      "닭고기 1kg",
      "소고기(국산) 100g",
      "소고기(수입) 100g",
      "돼지고기 100g",
      "고등어 1마리",
      "명태 1마리",
      "조기 1마리",
      "전복 5마리",
      "새우(흰다리새우) 1kg",
    ];
  } else if (selectedCategory === "식재료 (해산물)") {
    options = [
      "고등어 1마리",
      "꽃게(암게) 1kg",
      "낙지 1마리",
      "새우(흰다리새우) 1kg",
      "오징어 1마리",
      "조개(바지락) 1kg",
    ];
  } else if (selectedCategory === "식재료 (가공식품)") {
    options = [
      "라면 5개입 1봉",
      "만두 1800g",
      "맛김 16팩",
      "밀가루 1kg",
      "빵 3개입",
      "통조림(참치) 150g",
      "즉석밥 210g 3개입",
    ];
  } else if (selectedCategory === "식재료 (양념 및 조미료)") {
    options = [
      "간장 1통",
      "고추장 1kg",
      "고춧가루(국산) 1kg",
      "굵은소금(천일염) 1kg",
      "깐마늘 1kg",
      "마요네즈 500g",
      "된장 1kg",
      "멸치액젓 1kg",
      "생강 1kg",
      "설탕 1kg",
      "식초 1.8L",
      "참기름 320ml",
    ];
  } else if (selectedCategory === "음료") {
    options = [
      "맥주 500ml 1캔",
      "사이다 1.5L 1병",
      "소주 360ml, 1병",
      "콜라 1.5L(1병)",
      "생수 500ml 1병",
      "우유 1L",
    ];
  } else if (selectedCategory === "기타 생활 용품") {
    options = [
      "바디워시 1000ml 1개",
      "비누 4개입 1개",
      "샴푸 680ml 1통",
      "치약 160g 1개",
      "칫솔 4입 1개",
    ];
  }

  options.forEach(function (option) {
    var optionElement = document.createElement("option");
    optionElement.textContent = option;
    optionElement.value = option;
    itemSelect.appendChild(optionElement);
  });
}

// 페이지 로드시 한번 실행하여 초기화
updateSubcategories();
