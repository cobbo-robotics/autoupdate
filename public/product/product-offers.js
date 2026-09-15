(function () {
  "use strict";

  /* =========================================================
     COBBO PRODUCT OFFERS
     centralny moduł promocji na karcie produktu
  ========================================================= */

  const CONFIG = {
    payu: {
      posId: "4149561",
      key: "e1"
    },

    promo10Url:
      "https://cobbo.pl/news/n/1527/Regulamin-promocji-1-1-20",

    /*
      Link gwarancji dobierany automatycznie wg ID produktu.
      ID odczytywane jest z URL, np.:
      ...Q6-PRO-p634 -> 634
    */
    warrantyByProductId: {

      /* FRYTKOWNICE */
      630: "https://cobbo.pl/Frytkownice-beztluszczowe-c333",

      /* SUSZARKI */
      545: "https://cobbo.pl/Suszarki-do-wlosow-c304",
      553: "https://cobbo.pl/Suszarki-do-wlosow-c304",

      /* KUWETY */
      548: "https://cobbo.pl/Kuwety-dla-zwierzat-c302",
      549: "https://cobbo.pl/Kuwety-dla-zwierzat-c302",

      /* ODKURZACZE */
      490: "https://cobbo.pl/Odkurzacze-pionowe-c301",
      482: "https://cobbo.pl/Odkurzacze-pionowe-c301",
      451: "https://cobbo.pl/Odkurzacze-pionowe-c301",
      452: "https://cobbo.pl/Odkurzacze-pionowe-c301",

      /* PRASOWALNICE */
      546: "https://cobbo.pl/Prasowalnice-parowe-c303",
      547: "https://cobbo.pl/Prasowalnice-parowe-c303",

      /* ROBOTY DO OKIEN */
      255: "https://cobbo.pl/Roboty-do-okien-c298",
      317: "https://cobbo.pl/Roboty-do-okien-c298",
      349: "https://cobbo.pl/Roboty-do-okien-c298",
      559: "https://cobbo.pl/Roboty-do-okien-c298",
      419: "https://cobbo.pl/Roboty-do-okien-c298",
      634: "https://cobbo.pl/Roboty-do-okien-c298",

      /* ROBOT SPRZĄTAJĄCY ULTRA */
      352: "https://cobbo.pl/PRO-28-3D-ULTRA-c334",

      /* ROBOTY KUCHENNE */
      411: "https://cobbo.pl/Roboty-kuchenne-c299",
      575: "https://cobbo.pl/Roboty-kuchenne-c299",

      /* ELITE */
      622: "https://cobbo.pl/PRO-28-ELITE-c335"
    }
  };


  const GRID_ID = "cobbo-product-offers";
  const STYLE_ID = "cobbo-product-offers-styles";

  const PAYU_SCRIPT =
    "https://static.payu.com/res/v2/widget-mini-installments.js";

  let lastPrice = null;
  let payuLoadPromise = null;


  /* =========================================================
     PRODUCT ID
  ========================================================= */

  function getProductId() {

  /* =====================================================
     1. ID Z ADRESU
     np. Q6 PRO ...-p634
  ===================================================== */

  let match =
    window.location.pathname.match(
      /-p(\d+)(?:\/|$)/i
    );

  if (match) {
    return parseInt(match[1], 10);
  }


  /* =====================================================
     2. CANONICAL
  ===================================================== */

  const canonical =
    document.querySelector(
      'link[rel="canonical"]'
    );

  if (
    canonical &&
    canonical.href
  ) {

    match =
      canonical.href.match(
        /-p(\d+)(?:\/|$)/i
      );

    if (match) {
      return parseInt(
        match[1],
        10
      );
    }
  }


  /* =====================================================
     3. PRÓBA ODCZYTU ID Z HTML SKYSHOP
  ===================================================== */

  const possibleElements = [
    '[data-product-id]',
    '[data-productid]',
    '[data-product]',
    '[data-id-product]',
    'input[name="product_id"]',
    'input[name="productId"]'
  ];


  for (
    const selector
    of possibleElements
  ) {

    const element =
      document.querySelector(
        selector
      );

    if (!element) {
      continue;
    }


    const possibleId =

      element.dataset.productId ||

      element.dataset.productid ||

      element.getAttribute(
        "data-product"
      ) ||

      element.getAttribute(
        "data-id-product"
      ) ||

      element.value;


    if (
      possibleId &&
      /^\d+$/.test(
        String(possibleId)
      )
    ) {

      return parseInt(
        possibleId,
        10
      );
    }
  }


  /* =====================================================
     4. FALLBACK NA NAZWĘ PRODUKTU

     To zabezpiecza produkty SkyShop,
     których URL nie zawiera -pXXX.
  ===================================================== */

  const titleElement =
    document.querySelector("h1");

  const title =
    titleElement
      ? titleElement.textContent
          .trim()
          .toLowerCase()
      : "";


  /*
    WAŻNE:
    bardziej szczegółowe nazwy muszą
    być PRZED krótszymi.

    Czyli:
    G7 PRO przed G7
    Q6 PRO przed Q6
    e6 PRO przed e6
  */

  const PRODUCT_NAME_MAP = [

    {
      text: "g7 pro",
      id: 452
    },

    {
      text: "g7",
      id: 451
    },

    {
      text: "q6 pro",
      id: 634
    },

    {
      text: "q6",
      id: 419
    },

    {
      text: "e6 pro",
      id: 559
    },

    {
      text: "e6",
      id: 349
    },

    {
      text: "e5",
      id: 317
    },

    {
      text: "i5",
      id: 255
    },

    {
      text: "7 smart-i",
      id: 411
    },

    {
      text: "7 smart i",
      id: 411
    },

    {
      text: "7 black pro",
      id: 575
    },

    {
      text: "pro 28 elite",
      id: 622
    },

    {
      text: "pro 28 3d ultra",
      id: 352
    },

    {
      text: "m5 vapor",
      id: 490
    },

    {
      text: "ultra steam uv",
      id: 482
    },

    {
      text: "steam one pro",
      id: 546
    },

    {
      text: "compact 32",
      id: 547
    },

    {
      text: "kuweta k1",
      id: 548
    },

    {
      text: "kuweta k2",
      id: 549
    },

    {
      text: "d9",
      id: 553
    },

    {
      text: "smart fry",
      id: 630
    }

  ];


  for (
    const product
    of PRODUCT_NAME_MAP
  ) {

    if (
      title.includes(
        product.text
      )
    ) {

      return product.id;
    }
  }


  console.warn(
    "COBBO: nie udało się rozpoznać ID produktu",
    {
      pathname:
        window.location.pathname,

      title:
        title
    }
  );


  return null;
}


  /* =========================================================
     WARRANTY URL
  ========================================================= */

  function getWarrantyUrl() {

    const productId =
      getProductId();

    if (!productId) {
      return null;
    }

    return (
      CONFIG.warrantyByProductId[productId] ||
      null
    );
  }


  /* =========================================================
     STYLE
  ========================================================= */

  function injectStyles() {

    if (
      document.getElementById(STYLE_ID)
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      STYLE_ID;

    style.textContent = `

      /* ======================================
         GRID
      ====================================== */

      #${GRID_ID},
      #${GRID_ID} * {
        box-sizing: border-box;
      }

      #${GRID_ID} {

        width: 100%;

        display: grid;

        grid-template-columns:
          repeat(2, minmax(0, 1fr));

        gap: 10px;

        margin:
          12px 0 14px 0;

        font-family:
          "SF Pro Display",
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Arial,
          sans-serif;
      }


      /* ======================================
         CARD
      ====================================== */

      #${GRID_ID}
      .cobbo-offer-card {

        position: relative;

        display: flex;

        flex-direction: column;

        justify-content: flex-end;

        min-width: 0;

        height: 118px;

        min-height: 118px;

        padding:
          16px 15px 15px;

        overflow: hidden;

        border-radius: 16px;

        border:
          1px solid
          rgba(255,255,255,.16);

        color: #fff;

        text-decoration: none !important;

        box-shadow:
          0 5px 15px
          rgba(0,0,0,.14);

        transition:
          transform .18s ease,
          box-shadow .18s ease;
      }


      @media (hover:hover) {

        #${GRID_ID}
        a.cobbo-offer-card:hover {

          transform:
            translateY(-2px);

          box-shadow:
            0 8px 21px
            rgba(0,0,0,.18);
        }
      }


      /* ======================================
         GOLD LINE
      ====================================== */

      #${GRID_ID}
      .cobbo-offer-card::before {

        content: "";

        position: absolute;

        left: 15px;

        top: 14px;

        width: 38px;

        height: 3px;

        border-radius: 999px;

        background:
          #f0c94d;

        z-index: 3;
      }


      /* ======================================
         BACKGROUND SYMBOL
      ====================================== */

      #${GRID_ID}
      .cobbo-offer-ghost {

        position: absolute;

        right: -8px;

        bottom: -20px;

        font-size: 80px;

        font-weight: 900;

        line-height: 1;

        letter-spacing: -5px;

        color:
          rgba(255,255,255,.10);

        z-index: 1;

        pointer-events: none;

        user-select: none;
      }


      #${GRID_ID}
      .cobbo-offer-content {

        position: relative;

        z-index: 3;

        width: 100%;

        min-width: 0;
      }


      /* ======================================
         TEXT
      ====================================== */

      #${GRID_ID}
      .cobbo-offer-main {

        display: block;

        margin: 0;

        color: #fff;

        font-size: 20px;

        font-weight: 900;

        line-height: .98;

        letter-spacing: -.5px;

        text-transform: uppercase;
      }


      #${GRID_ID}
      .cobbo-offer-sub {

        display: block;

        margin-top: 7px;

        color:
          rgba(255,255,255,.92);

        font-size: 13px;

        font-weight: 650;

        line-height: 1.12;
      }


      /* ======================================
         PAYU
      ====================================== */

      #${GRID_ID}
      .cobbo-offer-payu {

        background:
          linear-gradient(
            135deg,
            #0f6339 0%,
            #0a4226 100%
          );

        cursor: pointer;
      }


      #${GRID_ID}
      .cobbo-payu-label {

        display: block;

        margin-bottom: 5px;

        color:
          rgba(255,255,255,.94);

        font-size: 13px;

        font-weight: 650;

        line-height: 1.1;
      }


      #${GRID_ID}
      .cobbo-payu-slot {

        display: block;

        width: 100%;

        min-height: 31px;
      }


      /*
        Czyścimy wygląd oryginalnego
        widgetu PayU, żeby został
        praktycznie tylko wynik raty.
      */

      #${GRID_ID}
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

        background:
          transparent !important;

        border: 0 !important;

        border-radius: 0 !important;

        box-shadow: none !important;

        overflow: visible !important;

        color: #fff !important;
      }


      #${GRID_ID}
      .payu-mini-installments-widget::before,

      #${GRID_ID}
      .payu-mini-installments-widget::after {

        content: none !important;

        display: none !important;
      }


      #${GRID_ID}
      .payu-mini-installments-widget a {

        display: block !important;

        margin: 0 !important;

        padding: 0 !important;

        color: #fff !important;

        text-decoration: none !important;
      }


      /*
        Ukrywamy tekst generowany przez PayU,
        ponieważ własny tekst:
        "Rata 0% już od:"
        mamy zawsze nad kwotą.
      */

      #${GRID_ID}
      .payu-mini-installments-widget-label {

        display: none !important;
      }


      #${GRID_ID}
      .payu-mini-installments-widget-amount {

        display: block !important;

        margin: 0 !important;

        color: #fff !important;

        font-size: 28px !important;

        font-weight: 900 !important;

        line-height: 1 !important;

        letter-spacing: -.7px !important;

        white-space: nowrap !important;
      }


      /* ======================================
         WARRANTY
      ====================================== */

      #${GRID_ID}
      .cobbo-offer-warranty {

        background:
          linear-gradient(
            135deg,
            #213375 0%,
            #111a3d 100%
          );
      }


      /* ======================================
         PROMO -10
      ====================================== */

      #${GRID_ID}
      .cobbo-offer-promo10 {

        background:
          linear-gradient(
            135deg,
            #ef0715 0%,
            #c0000c 100%
          );
      }


      /* ======================================
         PROMO -15
      ====================================== */

      #${GRID_ID}
      .cobbo-offer-promo15 {

        background:
          linear-gradient(
            135deg,
            #242421 0%,
            #080808 100%
          );

        border-color:
          rgba(240,201,77,.30);

        cursor: default;
      }


      #${GRID_ID}
      .cobbo-offer-promo15::before {

        background:
          linear-gradient(
            90deg,
            #f0c94d,
            #ffe892
          );
      }


      #${GRID_ID}
      .cobbo-offer-promo15
      .cobbo-offer-ghost {

        color:
          rgba(240,201,77,.12);
      }


      /* ======================================
         WARRANTY NOT AVAILABLE
      ====================================== */

      #${GRID_ID}
      .cobbo-offer-disabled {

        cursor: default;

        opacity: .86;
      }


      /* ======================================
         MOBILE
      ====================================== */

      @media
      (max-width: 380px) {

        #${GRID_ID} {

          gap: 8px;
        }


        #${GRID_ID}
        .cobbo-offer-card {

          height: 113px;

          min-height: 113px;

          padding:
            15px 12px 13px;
        }


        #${GRID_ID}
        .cobbo-offer-card::before {

          left: 12px;
        }


        #${GRID_ID}
        .cobbo-offer-main {

          font-size: 18px;
        }


        #${GRID_ID}
        .cobbo-offer-sub {

          font-size: 12px;
        }


        #${GRID_ID}
        .cobbo-payu-label {

          font-size: 12px;
        }


        #${GRID_ID}
        .payu-mini-installments-widget-amount {

          font-size: 25px !important;
        }
      }

    `;

    document.head.appendChild(
      style
    );
  }


  /* =========================================================
     PRICE
  ========================================================= */

  function findPriceElement() {

    return (

      document.querySelector(
        ".product-price .price-special .core_cardPriceSpecial[data-price]"
      )

      ||

      document.querySelector(
        ".product-price .price-special .core_priceFormat[data-price]"
      )

      ||

      document.querySelector(
        ".product-price [data-price]"
      )

    );
  }


  function getProductPrice() {

    const priceEl =
      findPriceElement();

    if (!priceEl) {
      return null;
    }

    const raw =
      priceEl.getAttribute(
        "data-price"
      );

    if (!raw) {
      return null;
    }

    const price =
      parseFloat(

        String(raw)

          .replace(/\s/g, "")

          .replace(",", ".")

      );

    if (
      !Number.isFinite(price)
    ) {

      return null;
    }

    return price;
  }


  /* =========================================================
     NORMAL CARD
  ========================================================= */

  function createCard({
    className,
    url,
    main,
    sub,
    ghost
  }) {

    let card;


    /*
      Jeżeli jest URL:
      <a>

      Jeżeli nie:
      zwykły <div>
    */

    if (url) {

      card =
        document.createElement("a");

      card.href =
        url;

    } else {

      card =
        document.createElement("div");

      card.classList.add(
        "cobbo-offer-disabled"
      );
    }


    card.classList.add(
      "cobbo-offer-card",
      className
    );


    const ghostElement =
      document.createElement("span");

    ghostElement.className =
      "cobbo-offer-ghost";

    ghostElement.textContent =
      ghost;


    const content =
      document.createElement("span");

    content.className =
      "cobbo-offer-content";


    const mainElement =
      document.createElement("span");

    mainElement.className =
      "cobbo-offer-main";

    mainElement.textContent =
      main;


    const subElement =
      document.createElement("span");

    subElement.className =
      "cobbo-offer-sub";

    subElement.textContent =
      sub;


    content.appendChild(
      mainElement
    );

    content.appendChild(
      subElement
    );


    card.appendChild(
      ghostElement
    );

    card.appendChild(
      content
    );


    return card;
  }


  /* =========================================================
     GRID
  ========================================================= */

  function buildGrid() {

    if (
      document.getElementById(
        GRID_ID
      )
    ) {
      return;
    }


    const priceElement =
      findPriceElement();

    if (!priceElement) {
      return;
    }


    const productPrice =
      priceElement.closest(
        ".product-price"
      );

    if (!productPrice) {
      return;
    }


    const grid =
      document.createElement(
        "div"
      );

    grid.id =
      GRID_ID;


    /* =====================================================
       1. PAYU
    ===================================================== */

    const payuCard =
      document.createElement(
        "div"
      );

    payuCard.className =
      "cobbo-offer-card cobbo-offer-payu";


    payuCard.innerHTML = `

      <span
        class="cobbo-offer-ghost"
      >
        0%
      </span>

      <div
        class="cobbo-offer-content"
      >

        <span
          class="cobbo-payu-label"
        >
          Rata 0% już od:
        </span>

        <div
          id="cobbo-payu-slot"
          class="cobbo-payu-slot"
        ></div>

      </div>

    `;


    /* =====================================================
       2. WARRANTY
    ===================================================== */

    const warrantyUrl =
      getWarrantyUrl();


    const warrantyCard =
      createCard({

        className:
          "cobbo-offer-warranty",

        url:
          warrantyUrl,

        main:
          "DOKUP GWARANCJĘ",

        sub:
          "Dodatkowa ochrona urządzenia",

        ghost:
          "+"

      });


    /* =====================================================
       3. -10%
    ===================================================== */

    const promo10Card =
      createCard({

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


    /* =====================================================
       4. -15%
       BRAK LINKU CELOWO
    ===================================================== */

    const promo15Card =
      createCard({

        className:
          "cobbo-offer-promo15",

        url:
          null,

        main:
          "-15% NA TEN PRODUKT",

        sub:
          "przy dwóch dowolnych urządzeniach",

        ghost:
          "15%"

      });


    grid.appendChild(
      payuCard
    );

    grid.appendChild(
      warrantyCard
    );

    grid.appendChild(
      promo10Card
    );

    grid.appendChild(
      promo15Card
    );


    productPrice.insertAdjacentElement(
      "afterend",
      grid
    );
  }


  /* =========================================================
     LOAD PAYU
  ========================================================= */

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
      new Promise(
        function (
          resolve,
          reject
        ) {

          const existing =
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
              {
                once: true
              }
            );


            existing.addEventListener(
              "error",
              reject,
              {
                once: true
              }
            );


            return;
          }


          const script =
            document.createElement(
              "script"
            );


          script.src =
            PAYU_SCRIPT;


          script.async =
            true;


          script.onload =
            resolve;


          script.onerror =
            reject;


          document.head.appendChild(
            script
          );

        }
      );


    return payuLoadPromise;
  }


  /* =========================================================
     PAYU FALLBACK
  ========================================================= */

  function payuFallback() {

    const slot =
      document.getElementById(
        "cobbo-payu-slot"
      );


    if (!slot) {
      return;
    }


    slot.innerHTML =
      '<span style="' +

        'display:block;' +

        'font-size:26px;' +

        'font-weight:900;' +

        'line-height:1;' +

        'color:#fff;' +

      '">' +

        'Sprawdź raty' +

      '</span>';
  }


  /* =========================================================
     PAYU
  ========================================================= */

  function renderPayU() {

    const price =
      getProductPrice();


    const slot =
      document.getElementById(
        "cobbo-payu-slot"
      );


    if (
      !price ||
      !slot
    ) {
      return;
    }


    if (
      price === lastPrice &&
      slot.children.length
    ) {
      return;
    }


    lastPrice =
      price;


    slot.innerHTML =
      "";


    loadPayU()

      .then(function () {

        if (
          !window.OpenPayU ||
          !window.OpenPayU.Installments
        ) {

          throw new Error(
            "OpenPayU unavailable"
          );
        }


        return (
          window
            .OpenPayU
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

            )
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


  /* =========================================================
     REMOVE OLD PAYU
  ========================================================= */

  function removeLegacyPayU() {

    /*
      Jeżeli na stronie nadal znajduje się
      stary widget PayU, usuwamy jego kopię.

      NIE ruszamy PayU znajdującego się
      wewnątrz naszego nowego gridu.
    */

    const widgets =
      document.querySelectorAll(
        ".payu-mini-installments-widget"
      );


    widgets.forEach(
      function (widget) {

        if (
          !widget.closest(
            "#" + GRID_ID
          )
        ) {

          const parent =
            widget.parentElement;


          widget.remove();


          /*
            Usuwamy pusty wrapper starego
            #installment-mini.
          */

          if (
            parent &&
            (
              parent.id ===
              "installment-mini"

              ||

              (
                parent.children.length === 0 &&
                parent.textContent.trim() === ""
              )
            )
          ) {

            const maybeP =
              parent.parentElement;


            parent.remove();


            if (
              maybeP &&
              maybeP.tagName === "P" &&
              maybeP.children.length === 0 &&
              maybeP.textContent.trim() === ""
            ) {

              maybeP.remove();
            }
          }
        }
      }
    );
  }


  /* =========================================================
     PRICE OBSERVER
  ========================================================= */

  function observePrice() {

    const productPrice =
      document.querySelector(
        ".product-price"
      );


    if (!productPrice) {
      return;
    }


    let timer =
      null;


    const observer =
      new MutationObserver(
        function () {

          clearTimeout(
            timer
          );


          timer =
            setTimeout(
              function () {

                /*
                  Jeżeli cena produktu
                  się zmieni, odświeżamy PayU.
                */

                const newPrice =
                  getProductPrice();


                if (
                  newPrice !== lastPrice
                ) {

                  lastPrice =
                    null;


                  renderPayU();
                }


                removeLegacyPayU();

              },
              180
            );
        }
      );


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


  /* =========================================================
     GLOBAL LEGACY PAYU WATCHER
  ========================================================= */

  function watchLegacyPayU() {

    /*
      Dzięki temu nawet jeśli stary kod
      PayU uruchomi się chwilę PO naszym,
      jego drugi duży widget zniknie.
    */

    const observer =
      new MutationObserver(
        function () {

          removeLegacyPayU();

        }
      );


    observer.observe(
      document.body,
      {

        childList: true,

        subtree: true

      }
    );
  }


  /* =========================================================
     INIT
  ========================================================= */

  function init() {

    injectStyles();


    let attempts =
      0;


    const timer =
      setInterval(
        function () {

          attempts++;


          const price =
            getProductPrice();


          if (price) {

            clearInterval(
              timer
            );


            buildGrid();


            renderPayU();


            observePrice();


            watchLegacyPayU();


            /*
              Czyścimy również PayU,
              które zdążyło się załadować
              przed naszym modułem.
            */

            setTimeout(
              removeLegacyPayU,
              500
            );


            setTimeout(
              removeLegacyPayU,
              1500
            );


            return;
          }


          if (
            attempts >= 40
          ) {

            clearInterval(
              timer
            );
          }

        },
        250
      );
  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();
  }

})();
