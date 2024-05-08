var data = {};
var batchSize = 1000; // 한 번에 가져올 데이터 양
var totalDataCount = 5000; // 총 데이터 개수
var requestsCompleted = 0;

$(document).ready(function () {
  var vilage_weather_url =
    "https://yczemtfqpyqbbw32mt4xm2gt7q0paxjx.lambda-url.us-east-1.on.aws/weather"; // 백엔드로의 요청으로 수정

  // AJAX 요청
  $.ajax({
    url: vilage_weather_url, // 백엔드로 요청 보내도록 수정
    type: "GET",
    beforeSend: function () {
      // AJAX 요청이 시작되기 전에 로더를 표시
      $("#weatherLoader").show();
      $("#loadingMessage1").show();
    },
    success: function (response) {
      // 데이터 불러오기 성공
      var data = response.CITYDATA.WEATHER_STTS;
      // 나머지는 그대로 유지
      var now = new Date();
      var y = now.getFullYear();
      var m = now.getMonth() + 1; // 월은 0부터 시작하므로 +1
      var d = now.getDate();
      var h = now.getHours() + 1; // 시간은 시차 보정값 없이 가져옴
      if (h >= 24) {
        d += 1;
        h = 0;
      }
      var t =
        y.toString() +
        m.toString().padStart(2, "0") +
        d.toString().padStart(2, "0") +
        h.toString().padStart(2, "0") +
        "00";

      var weatherInfoHTML = "";

      data.forEach(function (row) {
        // 이미지에 대한 조건문 추가
        var weatherImage = "image/basic.png"; // 기본 이미지 설정
        if ("FCST24HOURS" in row) {
          var forecasts = row["FCST24HOURS"];
          JSON.stringify(forecasts);
          forecasts.forEach(function (forecast) {
            if ("FCST_DT" in forecast && forecast["FCST_DT"] == t) {
              if (
                "PRECPT_TYPE" in forecast &&
                (forecast["PRECPT_TYPE"] == "비" ||
                  forecast["PRECPT_TYPE"] == "빗방울" ||
                  forecast["PRECPT_TYPE"] === "소나기" ||
                  forecast["PRECPT_TYPE"] === "비 또는 눈" ||
                  forecast["PRECPT_TYPE"] === "눈 또는 비")
              ) {
                weatherImage = "image/rain.png";
                weatherInfoHTML +=
                  "<div><img src='" + weatherImage + "' alt=''></div>";
                weatherInfoHTML +=
                  "<div id = 'w_contents'><p id = 'W_info'>오늘 서울 날씨는 " +
                  forecast["PRECPT_TYPE"] +
                  "</p>";
              } else {
                if (forecast["SKY_STTS"] === "맑음") {
                  weatherImage = "image/sun.png";
                } else if (
                  forecast["SKY_STTS"] === "흐림" ||
                  forecast["SKY_STTS"] === "안개"
                ) {
                  weatherImage = "image/fog.png";
                } else if (
                  forecast["SKY_STTS"] === "눈" ||
                  forecast["SKY_STTS"] === "눈날림"
                ) {
                  weatherImage = "img/snow.png";
                } else if (forecast["SKY_STTS"] === "낙뢰") {
                  weatherImage = "image/thunder.png";
                }
                // 날씨 정보에 따라 이미지를 변경하여 추가
                weatherInfoHTML +=
                  "<div><img src='" + weatherImage + "' alt=''></div>";
                weatherInfoHTML +=
                  "<div id = 'w_contents'><p id = 'W_info'>오늘 서울 날씨는 " +
                  forecast["SKY_STTS"] +
                  "</p>";
              }
              weatherInfoHTML +=
                "<p id='d_info'>기온은 " + row["TEMP"] + "도</p>";
            }
          });
        }
        weatherInfoHTML +=
          "<p id = 'dust_info'>미세먼지 농도는 " +
          row["PM10"] +
          "으로 " +
          row["PM10_INDEX"] +
          ", 초미세먼지 농도는 " +
          row["PM25"] +
          "으로 " +
          row["PM25_INDEX"] +
          "</p>";
        if (row["PM10_INDEX"] == "나쁨" || row["PM25_INDEX"] == "나쁨") {
          weatherInfoHTML +=
            "<p id = 'dust_info' >오늘은 미세먼지 수치가 나쁨입니다. 마스크를 착용하는 것이 좋아요</p>";
        }
        weatherInfoHTML += "</div>";

        /*weatherInfoHTML += "<p>최저기온은 " + row['MIN_TEMP'] + " 이며, 최고기온은 " + row['MAX_TEMP'] + " 으로 예상됩니다.</p>";*/
        /*weatherInfoHTML += "<p>현재 기온은 " + row['TEMP'] + "도 이며</p>";*/
        /* weatherInfoHTML += "<p>낮동안 " + row['UV_MSG'] + "</p><br>";*/
      });

      $("#weather-info").html(weatherInfoHTML);
      $("#weatherLoader").hide();
      $("#loadingMessage1").hide();
    },
    error: function (xhr, status, error) {
      // 에러 처리
      console.error("에러:", error);
      $("#weather-info").html(
        "<p>날씨 정보를 불러오는 중 오류가 발생했습니다.</p>"
      );
    },
    complete: function () {
      // 요청 완료되면 로더 숨기기
      $("#weatherLoader").hide();
    },
  });
});

// 초기 데이터 로딩 시 로더 표시
$(document).ready(function () {
  var vilage_base_url =
    "https://yczemtfqpyqbbw32mt4xm2gt7q0paxjx.lambda-url.us-east-1.on.aws/base-url"; // 백엔드로의 요청으로 수정

  // 서버로부터 데이터 로드
  loadData(vilage_base_url);
});

function loadData(baseUrl) {
  if (!baseUrl) {
    console.error("Base URL is missing");
    return;
  }

  console.log(baseUrl);

  // 로딩 아이콘 및 메시지 표시
  $("#loader").show();
  $("#loadingMessage").show();

  $.ajax({
    url: baseUrl,
    type: "GET",
    success: function (data) {
      processDataFromJSON(data);
      displayLowestPrices();
      $("#loader").hide();
      $("#loadingMessage").hide();
    },
    error: function (error) {
      console.error("Error fetching data from server:", error);
      $("#loader").hide();
      $("#loadingMessage").hide();
    },
  });
}

function processDataFromJSON(jsonData) {
  // Ensure jsonData is not empty or undefined
  if (!jsonData || !Array.isArray(jsonData) || jsonData.length !== 5) {
    console.error("Invalid JSON data:", jsonData);
    return;
  }

  // Process each batch of data
  jsonData.forEach(function (batchData) {
    if (
      !batchData.ListNecessariesPricesService ||
      !batchData.ListNecessariesPricesService.row
    ) {
      console.error("Invalid batch data:", batchData);
      return;
    }

    var dataRows = batchData.ListNecessariesPricesService.row;

    // Process each row of data
    dataRows.forEach(function (row) {
      var yearMonth = row.P_YEAR_MONTH;
      var itemName = row.A_NAME;
      var itemPrice = parseFloat(row.A_PRICE);

      // Check if the yearMonth is '2024-04' and the item is in the desired list
      if (
        yearMonth === "2024-04" &&
        (itemName.includes("감자 1kg") ||
          itemName.includes("대파 1kg") ||
          itemName.includes("콩나물 500g") ||
          itemName.includes("양파 1망") ||
          itemName.includes("포도(샤인머스켓) 1kg") ||
          itemName.includes("사과 1개") ||
          itemName.includes("복숭아 1개") ||
          itemName.includes("닭고기 1kg") ||
          itemName.includes("돼지고기 100g") ||
          itemName.includes("고등어 1마리"))
      ) {
        // Update data with the lowest price for each item
        if (
          itemPrice !== 0 &&
          (!data[itemName] || data[itemName].price > itemPrice)
        ) {
          data[itemName] = {
            market: row.M_NAME,
            price: itemPrice,
          };
        }
      }
    });
  });
}

function displayLowestPrices() {
  var dataDisplayHTML = "";

  // 각 과일에 대한 최저가 정보를 HTML로 변환하여 표시
  Object.keys(data).forEach((itemName) => {
    var item = data[itemName];
    dataDisplayHTML += "<div class='data-item'>";
    dataDisplayHTML += "<div id='itemName'>" + itemName + "</div>";
    dataDisplayHTML += "<div id='itemPrice'>" + item.price + "원</div>";
    dataDisplayHTML +=
      "<div id='marketName'>최저가 : " + item.market + "</div>";
    dataDisplayHTML += "</div>";
  });

  document.getElementById("dataDisplay").innerHTML = dataDisplayHTML;
}
