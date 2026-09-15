(function () {
  "use strict";

  const CONFIG = {
    maxWidth: 400,

    payu: {
      posId: "4149561",
      key: "e1"
    },

    warrantyUrl: "https://cobbo.pl/Gwarancja-c309",

    promo10Url:
      "https://cobbo.pl/news/n/1527/Regulamin-promocji-1-1-20",

    /*
      Tutaj później wpisujesz JEDEN link do promocji -15%.
      Nie trzeba zmieniać niczego na kartach produktów.
    */
    promo15Url: ""
  };

  const GRID_ID = "cobbo-product-offers";
  const STYLE_ID = "cobbo-product-offers-styles";
  const PAYU_SCRIPT =
    "https://static.payu.com/res/v2/widget-mini-installments.js";

  let lastPrice = null;
  let payuLoadPromise = null;

  /* ==========================================
     STYLE
  ========================================== */

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
      #${GRID_ID},
      #${GRID_ID} * {
        box-sizing: border-box;
      }

      #${GRID_ID} {
        width: 100%;
        max-width: ${CONFIG.maxWidth}px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 9px;
        margin: 10px 0 12px 0;
        font-family:
          "SF Pro Display",
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Arial,
          sans-serif;
      }

      #${GRID_ID} .cobbo-offer-card {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;

        min-width: 0;
        min-height: 102px;

        padding: 14px 14px 13px;

        overflow: hidden;

        border-radius: 15px;
        border: 1px solid rgba(255,255,255,.14);

        color: #fff;
        text-decoration: none !important;

        box-shadow:
          0 5px 14px rgba(0,0,0,.12);

        transition:
          transform .18s ease,
          box-shadow .18s ease;
      }

      @media (hover:hover) {
        #${GRID_ID} a.cobbo-offer-card:hover {
          transform: translateY(-2px);

          box-shadow:
            0 8px 20px rgba(0,0,0,.17);
        }
      }

      #${GRID_ID} .cobbo-offer-card::before {
        content: "";
        position: absolute;
        left: 14px;
        top: 13px;

        width: 38px;
        height: 3px;

        border-radius: 999px;

        background: #f0c94d;

        z-index: 2;
      }

      #${GRID_ID} .cobbo-offer-ghost {
        position: absolute;

        right: -7px;
        bottom: -19px;

        font-size: 73px;
        font-weight: 900;
        line-height: 1;

        letter-spacing: -4px;

        color: rgba(255,255,255,.11);

        z-index: 1;
        pointer-events: none;
        user-select: none;
      }

      #${GRID_ID} .cobbo-offer-content {
        position: relative;
        z-index: 2;

        min-width: 0;
      }

      #${GRID_ID} .cobbo-offer-main {
        display: block;

        margin: 0;

        color: #fff;

        font-size: 18px;
        font-weight: 900;

        line-height: 1.05;

        text-transform: uppercase;

        letter-spacing: -.25px;
      }

      #${GRID_ID} .cobbo-offer-sub {
        display: block;

        margin-top: 5px;

        color: rgba(255,255,255,.88);

        font-size: 12.5px;
        font-weight: 600;

        line-height: 1.15;
      }


      /* PAYU */

      #${GRID_ID} .cobbo-offer-payu {
        background:
          linear-gradient(
            135deg,
            #0f5e35 0%,
            #09391f 100%
          );
      }


      /* GWARANCJA */

      #${GRID_ID} .cobbo-offer-warranty {
        background:
          linear-gradient(
            135deg,
            #1a2a6c 0%,
            #101835 100%
          );
      }


      /* -10% */

      #${GRID_ID} .cobbo-offer-promo10 {
        background:
          linear-gradient(
            135deg,
            #e30613 0%,
            #b8000b 100%
          );
      }


      /* -15% */

      #${GRID_ID} .cobbo-offer-promo15 {
        background:
          linear-gradient(
            135deg,
            #262626 0%,
            #050505 100%
          );

        border-color:
          rgba(240,201,77,.28);
      }

      #${GRID_ID} .cobbo-offer-promo15::before {
        background:
          linear-gradient(
            90deg,
            #f0c94d,
            #ffe58a
          );
      }

      #${GRID_ID} .cobbo-offer-promo15 .cobbo-offer-ghost {
        color: rgba(240,201,77,.15);
      }


      /* ====================================
         PAYU - NADPISANIE DOMYŚLNYCH STYLI
      ==================================== */

      #${GRID_ID} #cobbo-payu-slot {
        position: relative;
        z-index: 3;

        width: 100%;
        min-width: 0;
      }

      #${GRID_ID}
      #cobbo-payu-slot
      .payu-mini-installments-widget {

        position: relative !important;

        display: block !important;

        width: 100% !important;
        max-width: none !important;

        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;

        margin: 0 !important;
        padding: 0 !important;

        background: transparent !important;

        border: 0 !important;
        border-radius: 0 !important;

        box-shadow: none !important;

        overflow: visible !important;

        color: #fff !important;
      }

      #${GRID_ID}
      #cobbo-payu-slot
      .payu-mini-installments-widget::before,

      #${GRID_ID}
      #cobbo-payu-slot
      .payu-mini-installments-widget::after {
        display: none !important;
        content: none !important;
      }

      #${GRID_ID}
      #cobbo-payu-slot
      .payu-mini-installments-widget a {

        position: relative !important;

        display: flex !important;
        flex-direction: column !important;

        width: 100% !important;

        color: #fff !important;

        text-decoration: none !important;

        z-index: 3 !important;
      }

      #${GRID_ID}
      #cobbo-payu-slot
      .payu-mini-installments-widget-amount {

        order: 1 !important;

        display: block !important;

        margin: 0 !important;

        color: #fff !important;

        font-size: 22px !important;
        font-weight: 900 !important;

        line-height: 1 !important;

        white-space: nowrap !important;
      }

      #${GRID_ID}
      #cobbo-payu-slot
      .payu-mini-installments-widget-label {

        order: 2 !important;

        display: block !important;

        margin: 5px 0 0 !important;

        color: rgba(255,255,255,.88) !important;

        font-size: 12.5px !important;
        font-weight: 600 !important;

        line-height: 1.15 !important;

        white-space: normal !important;
      }


      /* PAYU LOADING / FALLBACK */

      #${GRID_ID} .cobbo-payu-fallback-main {
        display: block;

        color: #fff;

        font-size: 18px;
        font-weight: 900;

        line-height: 1.05;
      }

      #${GRID_ID} .cobbo-payu-fallback-sub {
        display: block;

        margin-top: 5px;

        color: rgba(255,255,255,.88);

        font-size: 12.5px;
        font-weight: 600;

        line-height: 1.15;
      }


      /* MOBILE */

      @media (max-width: 370px) {

        #${GRID_ID} {
          gap: 7px;
        }

        #${GRID_ID} .cobbo-offer-card {
          min-height: 100px;
          padding:
            13px 11px
            12px;
        }

        #${GRID_ID} .cobbo-offer-card::before {
          left: 11px;
          width: 32px;
        }

        #${GRID_ID} .cobbo-offer-main {
          font-size: 16px;
        }

        #${GRID_ID} .cobbo-offer-sub {
          font-size: 11.5px;
        }

        #${GRID_ID}
        #cobbo-payu-slot
        .payu-mini-installments-widget-amount {
          font-size: 19px !important;
        }

        #${GRID_ID}
        #cobbo-payu-slot
        .payu-mini-installments-widget-label {
          font-size: 11.5px !important;
        }
      }
    `;

    document.head.appendChild(style);
  }


  /* ==========================================
     CENA
  ========================================== */

  function findPriceElement() {
    return (
      document.querySelector(
        ".product-price .price-special .core_cardPriceSpecial[data-price]"
      ) ||
      document.querySelector(
        ".product-price .price-special .core_priceFormat[data-price]"
      ) ||
      document.querySelector(
        ".product-price [data-price]"
      )
    );
  }

  function getProductPrice() {
    const priceEl = findPriceElement();

    if (!priceEl) return null;

    const raw =
      priceEl.getAttribute("data-price");

    if (!raw) return null;

    const price =
      parseFloat(
        String(raw)
          .replace(/\s/g, "")
          .replace(",", ".")
      );

    if (!Number.isFinite(price)) {
      return null;
    }

    return price;
  }


  /* ==========================================
     TWORZENIE KAFELKA
  ========================================== */

  function createLinkCard(options) {
    const {
      className,
      url,
      main,
      sub,
      ghost
    } = options;

    const element =
      url
        ? document.createElement("a")
        : document.createElement("div");

    element.className =
      "cobbo-offer-card " + className;

    if (url) {
      element.href = url;
    }

    const ghostEl =
      document.createElement("span");

    ghostEl.className =
      "cobbo-offer-ghost";

    ghostEl.textContent =
      ghost;

    const content =
      document.createElement("span");

    content.className =
      "cobbo-offer-content";

    const mainEl =
      document.createElement("span");

    mainEl.className =
      "cobbo-offer-main";

    mainEl.textContent =
      main;

    const subEl =
      document.createElement("span");

    subEl.className =
      "cobbo-offer-sub";

    subEl.textContent =
      sub;

    content.appendChild(mainEl);
    content.appendChild(subEl);

    element.appendChild(ghostEl);
    element.appendChild(content);

    return element;
  }


  /* ==========================================
     GRID
  ========================================== */

  function buildGrid() {
    if (document.getElementById(GRID_ID)) {
      return;
    }

    const priceEl =
      findPriceElement();

    if (!priceEl) return;

    const productPrice =
      priceEl.closest(".product-price");

    if (!productPrice) return;

    const grid =
      document.createElement("div");

    grid.id = GRID_ID;


    /* PAYU */

    const payuCard =
      document.createElement("div");

    payuCard.className =
      "cobbo-offer-card cobbo-offer-payu";

    payuCard.innerHTML = `
      <span class="cobbo-offer-ghost">0%</span>

      <div
        id="cobbo-payu-slot"
        class="cobbo-offer-content"
      >
        <span class="cobbo-payu-fallback-main">
          RATY 0%
        </span>

        <span class="cobbo-payu-fallback-sub">
          Sprawdź wysokość raty
        </span>
      </div>
    `;


    /* GWARANCJA */

    const warranty =
      createLinkCard({
        className:
          "cobbo-offer-warranty",

        url:
          CONFIG.warrantyUrl,

        main:
          "DOKUP GWARANCJĘ",

        sub:
          "Dodatkowa ochrona urządzenia",

        ghost:
          "+"
      });


    /* -10% */

    const promo10 =
      createLinkCard({
        className:
          "cobbo-offer-promo10",

        url:
          CONFIG.promo10Url,

        main:
          "-10% NA KOSZYK",

        sub:
          "Dobierz drugi produkt",

        ghost:
          "1+1"
      });


    /* -15% */

    const promo15 =
      createLinkCard({
        className:
          "cobbo-offer-promo15",

        url:
          CONFIG.promo15Url,

        main:
          "-15% NA TEN PRODUKT",

        sub:
          "przy dwóch dowolnych urządzeniach",

        ghost:
          "15%"
      });


    grid.appendChild(payuCard);
    grid.appendChild(warranty);
    grid.appendChild(promo10);
    grid.appendChild(promo15);

    productPrice.insertAdjacentElement(
      "afterend",
      grid
    );
  }


  /* ==========================================
     PAYU
  ========================================== */

  function loadPayU() {

    if (
      window.OpenPayU &&
      window.OpenPayU.Installments
    ) {
      return Promise.resolve();
    }

    if (payuLoadPromise) {
      return payuLoadPromise;
    }

    payuLoadPromise =
      new Promise(function (
        resolve,
        reject
      ) {

        let existing =
          document.querySelector(
            'script[src="' +
            PAYU_SCRIPT +
            '"]'
          );

        if (existing) {

          if (
            window.OpenPayU &&
            window.OpenPayU.Installments
          ) {
            resolve();
            return;
          }

          existing.addEventListener(
            "load",
            resolve,
            { once: true }
          );

          existing.addEventListener(
            "error",
            reject,
            { once: true }
          );

          return;
        }

        const script =
          document.createElement("script");

        script.src =
          PAYU_SCRIPT;

        script.async =
          true;

        script.dataset.cobboPayu =
          "1";

        script.onload =
          resolve;

        script.onerror =
          reject;

        document.head.appendChild(
          script
        );
      });

    return payuLoadPromise;
  }


  function payuFallback() {
    const slot =
      document.getElementById(
        "cobbo-payu-slot"
      );

    if (!slot) return;

    slot.innerHTML = `
      <span class="cobbo-payu-fallback-main">
        RATY 0%
      </span>

      <span class="cobbo-payu-fallback-sub">
        Sprawdź dostępne opcje płatności
      </span>
    `;
  }


  function renderPayU() {

    const price =
      getProductPrice();

    const slot =
      document.getElementById(
        "cobbo-payu-slot"
      );

    if (!price || !slot) {
      return;
    }

    if (price === lastPrice) {
      return;
    }

    lastPrice = price;

    slot.innerHTML = "";

    loadPayU()
      .then(function () {

        if (
          !window.OpenPayU ||
          !window.OpenPayU.Installments
        ) {
          payuFallback();
          return;
        }

        return window.OpenPayU
          .Installments
          .miniInstallment(
            "#cobbo-payu-slot",
            {
              creditAmount:
                price,

              posId:
                CONFIG.payu.posId,

              key:
                CONFIG.payu.key,

              showLongDescription:
                false
            }
          );
      })
      .then(function (result) {

        if (
          result &&
          result.isWidgetAvailable === false
        ) {
          payuFallback();
        }

      })
      .catch(function (error) {

        console.error(
          "COBBO PayU:",
          error
        );

        payuFallback();
      });
  }


  /* ==========================================
     OBSERWACJA ZMIANY CENY
  ========================================== */

  function observePrice() {
    const productPrice =
      document.querySelector(
        ".product-price"
      );

    if (!productPrice) return;

    let timer = null;

    const observer =
      new MutationObserver(function () {

        clearTimeout(timer);

        timer =
          setTimeout(function () {
            renderPayU();
          }, 150);
      });

    observer.observe(
      productPrice,
      {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [
          "data-price"
        ]
      }
    );
  }


  /* ==========================================
     START
  ========================================== */

  function init() {

    injectStyles();

    let attempts = 0;

    const timer =
      setInterval(function () {

        attempts++;

        const price =
          getProductPrice();

        if (price) {

          clearInterval(timer);

          buildGrid();

          renderPayU();

          observePrice();

          return;
        }

        if (attempts >= 40) {
          clearInterval(timer);
        }

      }, 250);
  }


  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }

})();
