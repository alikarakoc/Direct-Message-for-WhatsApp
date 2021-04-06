let baseUrl = "https://web.whatsapp.com/";
let sendUrl = "https://web.whatsapp.com/send?phone=";
let lastNumber = "";

document.addEventListener("DOMContentLoaded", function () {
  var input = document.querySelector("#ePhoneNumber"),
    errorMsg = document.querySelector("#error-msg"),
    validMsg = document.querySelector("#valid-msg");

  var errorMap = [
    "Girilen değer telefon numarası gibi durmuyor.",
    "Geçersiz ülke kodu",
    "Girilen değer telefon numarası gibi durmuyor.",
    "Girilen değer telefon numarası gibi durmuyor.",
    "Girilen değer telefon numarası gibi durmuyor.",
  ];

  var iti = window.intlTelInput(input, {
    initialCountry: "auto",
    separateDialCode: true,
    allowExtensions: true,
    autoFormat: false,
    autoHideDialCode: true,
    autoPlaceholder: "polite",
    defaultCountry: "auto",
    ipinfoToken: "yolo",
    nationalMode: true,
    numberType: "MOBILE",
    utilsScript: "/scripts/utils.js?1613236686837",
    preventInvalidNumbers: true,
    geoIpLookup: function (success, failure) {
      $.get("https://ipinfo.io", function () {}, "jsonp").always(function (
        resp
      ) {
        var countryCode = resp && resp.country ? resp.country : "tr";
        success(countryCode);
      });
    },
  });

  var reset = function () {
    input.classList.remove("error");
    errorMsg.innerHTML = "";
    errorMsg.classList.add("d-none");
    validMsg.classList.add("d-none");
  };

  input.addEventListener("blur", function () {
    reset();
    if (input.value.trim()) {
      if (iti.isValidNumber()) {
        validMsg.classList.remove("d-none");
        document.querySelector("#btnSend").removeAttribute("disabled");
        var num = iti.getNumber();
        lastNumber = num;
      } else {
        input.classList.add("error");
        var errorCode = iti.getValidationError();
        errorMsg.innerHTML =
          errorMap[errorCode] === undefined ? errorMap[0] : errorMap[errorCode];
        errorMsg.classList.remove("d-none");
        document.querySelector("#btnSend").setAttribute("disabled", "disabled");
        lastNumber = "";
      }
    }
  });
  input.addEventListener("change", reset);
  input.addEventListener("keyup", reset);

  document.getElementById("btnSend").addEventListener("click", handler);
});
function handler() {
  var phoneNumberInput = document.querySelector("#ePhoneNumber");
  var iti = intlTelInput(phoneNumberInput);
  if (phoneNumberInput.value.length === 0) {
    iti.destroy();
    document.getElementById("error").classList.remove("d-none");
    document.getElementById("error").innerHTML =
      "Telefon numarası boş geçilemez!";
    phoneNumberInput.focus();
    return;
  }
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.getAllInWindow(null, function (tabs) {
      const openedWhatsapp = tabs.filter((filter) => filter.url === baseUrl);
      if (openedWhatsapp.length > 0) {
        chrome.tabs.get(openedWhatsapp[0].id, function (tab) {
          chrome.tabs.highlight({ tabs: tab.index }, function () {});
          chrome.tabs.update(openedWhatsapp[0].id, {
            url: `${sendUrl + lastNumber}&text=${
              document.getElementById("eMessage").value
            }&app_absent=0`,
          });
        });
        window.close();
      } else {
        chrome.tabs.create({
          url: `${sendUrl + lastNumber}&text=${
            document.getElementById("eMessage").value
          }&app_absent=0`,
          active: false,
        });
        window.close();
      }
    });
  });
}
