let baseUrl = "https://web.whatsapp.com/";
let sendUrl = "https://web.whatsapp.com/send?phone=";
let lastNumber = "";

const loaderShown = document.querySelector("._132Kx") !== null;
window.isInitialized = false;
window.isLoaded = loaderShown;

function checkIsLoaded() {
  const loaderShown = document.querySelector("._132Kx") !== null;
  if (loaderShown && !isInitialized) {
    isInitialized = true;
  }
  if (!loaderShown && isInitialized) {
    clearInterval(window.isWpLoaded);
    document.querySelector("button._1E0Oz")?.click();
    //by alimert
  }
}
window.isWpLoaded = setInterval(function () {
  checkIsLoaded();
}, 200);

document.addEventListener("DOMContentLoaded", function () {
  try {
    var input = document.querySelector("#ePhoneNumber"),
      errorMsg = document.querySelector("#error-msg"),
      validMsg = document.querySelector("#valid-msg");

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
      errorMsg.innerHTML = "";
      errorMsg.classList.add("d-none");
      validMsg.classList.add("d-none");
    };
    input.addEventListener("keyup", function (event) {
      reset();
      if (input.value.trim()) {
        if (iti.isValidNumber()) {
          validMsg.classList.remove("d-none");
          document.querySelector("#btnSend").removeAttribute("disabled");
          var num = iti.getNumber();
          lastNumber = num;
        } else {
          input.classList.add("error");
          errorMsg.innerHTML = "Ge??ersiz telefon numaras??.";
          errorMsg.classList.remove("d-none");
          document
            .querySelector("#btnSend")
            .setAttribute("disabled", "disabled");
          lastNumber = "";
        }
      } else {
        document.querySelector("#btnSend").setAttribute("disabled", "disabled");
      }
      if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("btnSend").click();
      }
    });

    document.getElementById("btnSend").addEventListener("click", handler);
    document
      .getElementById("cbMessageStatus")
      .addEventListener("click", checkMessage);
  } catch (error) {}
});

function checkMessage() {
  var checkBox = document.getElementById("cbMessageStatus");
  if (checkBox.checked == true) {
    document.getElementById("divMessage").classList.remove("d-none");
  } else {
    document.getElementById("divMessage").classList.add("d-none");
    document.getElementById("eMessage").value = "";
  }
}

const detectWhatsapp = (phone, text) => {
  const uri = `whatsapp://send/?phone=${encodeURIComponent(
    phone
  )}&text=${encodeURIComponent(text)}`;

  const onIE = () => {
    return new Promise((resolve) => {
      window.navigator.msLaunchUri(
        uri,
        () => resolve(true),
        () => resolve(false)
      );
    });
  };

  const notOnIE = () => {
    return new Promise((resolve) => {
      const a =
        document.getElementById("wapp-launcher") || document.createElement("a");
      a.id = "wapp-launcher";
      a.href = uri;
      a.style.display = "none";
      document.body.appendChild(a);

      const start = Date.now();
      const timeoutToken = setTimeout(() => {
        if (Date.now() - start > 1250) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);

      const handleBlur = () => {
        clearTimeout(timeoutToken);
        resolve(true);
      };
      window.addEventListener("blur", handleBlur);

      a.click();
    });
  };

  return window.navigator.msLaunchUri ? onIE() : notOnIE();
};

function handler() {
  // detectWhatsapp(lastNumber, document.getElementById("eMessage").value).then(
  //   (hasWhatsapp) => {
  //     if (!hasWhatsapp) {

  //     } else {
  //     }
  //   }
  // );
  var phoneNumberInput = document.querySelector("#ePhoneNumber");
  try {
    var iti = intlTelInput(phoneNumberInput);
    if (phoneNumberInput.value.length === 0) {
      iti.destroy();
      document.getElementById("error").classList.remove("d-none");
      document.getElementById("error").innerHTML =
        "Telefon numaras?? bo?? ge??ilemez!";
      phoneNumberInput.focus();
      return;
    }
  } catch (error) {}
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.getAllInWindow(null, function (tabs) {
      const openedWhatsapp = tabs.filter((filter) => filter.url === baseUrl);
      if (openedWhatsapp.length > 0) {
        chrome.tabs.get(openedWhatsapp[0].id, function (tab) {
          chrome.tabs.update(openedWhatsapp[0].id, {
            url: `${
              sendUrl + encodeURIComponent(lastNumber)
            }}&text=${encodeURIComponent(
              document.getElementById("eMessage").value
            )}&app_absent=0`,
          });
          chrome.tabs.highlight({ tabs: tab.index }, function () {});
        });
        window.close();
      } else {
        chrome.tabs.create({
          url: `${
            sendUrl + encodeURIComponent(lastNumber)
          }&text=${encodeURIComponent(
            document.getElementById("eMessage").value
          )}&app_absent=0`,
          active: false,
        });
        window.close();
      }
    });
  });
  return;
}
