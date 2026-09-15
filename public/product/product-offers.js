(function () {
  "use strict";

  /* =========================================================
     COBBO PRODUCT OFFERS
     Wersja centralna:
     - PayU
     - gwarancja
     - promocja -10%
     - promocja -15%
     - cały CSS
     - automatyczna cena
     - automatyczny link gwarancji
  ========================================================= */


  /* =========================================================
     KONFIGURACJA
  ========================================================= */

  const CONFIG = {

    payu: {
      posId: "4149561",
      key: "e1"
    },

    promo10Url:
      "https://cobbo.pl/news/n/1527/Regulamin-promocji-1-1-20",

    /*
      Link gwarancji na podstawie ID produktu.
    */

    warrantyByProductId: {

      /* FRYTKOWNICE */
      630:
        "https://cobbo.pl/Frytkownice-beztluszczowe-c333",

      /* SUSZARKI */
      545:
        "https://cobbo.pl/Suszarki-do-wlosow-c304",

      553:
        "https://cobbo.pl/Suszarki-do-wlosow-c304",

      /* KUWETY */
      548:
        "https://cobbo.pl/Kuwety-dla-zwierzat-c302",

      549:
        "https://cobbo.pl/Kuwety-dla-zwierzat-c302",

      /* ODKURZACZE */
      490:
        "https://cobbo.pl/Odkurzacze-pionowe-c301",

      482:
        "https://cobbo.pl/Odkurzacze-pionowe-c301",

      451:
        "https://cobbo.pl/Odkurzacze-pionowe-c301",

      452:
        "https://cobbo.pl/Odkurzacze-pionowe-c301",

      /* PRASOWALNICE */
      546:
        "https://cobbo.pl/Prasowalnice-parowe-c303",

      547:
        "https://cobbo.pl/Prasowalnice-parowe-c303",

      /* ROBOTY DO OKIEN */
      255:
        "https://cobbo.pl/Roboty-do-okien-c298",

      317:
        "https://cobbo.pl/Roboty-do-okien-c298",

      349:
        "https://cobbo.pl/Roboty-do-okien-c298",

      559:
        "https://cobbo.pl/Roboty-do-okien-c298",

      419:
        "https://cobbo.pl/Roboty-do-okien-c298",

      634:
        "https://cobbo.pl/Roboty-do-okien-c298",

      /* ROBOTY SPRZĄTAJĄCE */
      352:
        "https://cobbo.pl/PRO-28-3D-ULTRA-c334",

      622:
        "https://cobbo.pl/PRO-28-ELITE-c335",

      /* ROBOTY KUCHENNE */
      411:
        "https://cobbo.pl/Roboty-kuchenne-c299",

      575:
        "https://cobbo.pl/Roboty-kuchenne-c299"
    }
  };


  /* =========================================================
     STAŁE
  ========================================================= */

  const GRID_ID =
    "cobbo-product-offers";

  const STYLE_ID =
    "cobbo-product-offers-styles";

  const PAYU_SCRIPT =
    "https://static.payu.com/res/v2/widget-mini-installments.js";


  let payuLoadPromise =
    null;

  let currentPayUPrice =
    null;

  let payuOpenWidget =
    null;


  /* =========================================================
     NORMALIZACJA TEKSTU
  ========================================================= */

  function normalizeText(text) {

    return String(text || "")

      .toLowerCase()

      .replace(/[–—-]/g, " ")

      .replace(/[()+]/g, " ")

      .replace(/\s+/g, " ")

      .trim();
  }


  /* =========================================================
     ID PRODUKTU
  ========================================================= */

  function getProductId() {

    let match;


    /* =====================================================
       1. URL
       np. ...-p634
    ===================================================== */

    match =
      window.location.pathname.match(
        /-p(\d+)(?:\/|$)/i
      );

    if (match) {

      return parseInt(
        match[1],
        10
      );
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
       3. DATA ATTRIBUTES SKYSHOP
    ===================================================== */

    const selectors = [

      "[data-product-id]",

      "[data-productid]",

      "[data-id-product]",

      'input[name="product_id"]',

      'input[name="productId"]'

    ];


    for (
      const selector
      of selectors
    ) {

      const element =
        document.querySelector(
          selector
        );

      if (!element) {
        continue;
      }


      const value =

        element.getAttribute(
          "data-product-id"
        )

        ||

        element.getAttribute(
          "data-productid"
        )

        ||

        element.getAttribute(
          "data-id-product"
        )

        ||

        element.value;


      if (
        value &&
        /^\d+$/.test(
          String(value)
        )
      ) {

        return parseInt(
          value,
          10
        );
      }
    }


    /* =====================================================
       4. FALLBACK NA NAZWĘ PRODUKTU
    ===================================================== */

    const h1 =
      document.querySelector("h1");

    const title =
      normalizeText(
        h1
          ? h1.textContent
          : document.title
      );


    /*
      WAŻNE:
      dłuższe / bardziej precyzyjne
      nazwy muszą być przed krótszymi.
    */

    const PRODUCT_NAME_MAP = [

      /* G7 */
      {
        names: [
          "g7 pro"
        ],
        id: 452
      },

      {
        names: [
          "g7"
        ],
        id: 451
      },


      /* Q6 */
      {
        names: [
          "q6 pro"
        ],
        id: 634
      },

      {
        names: [
          "q6"
        ],
        id: 419
      },


      /* E6 */
      {
        names: [
          "e6 pro"
        ],
        id: 559
      },

      {
        names: [
          "e6 slim",
          "e6"
        ],
        id: 349
      },


      /* E5 */
      {
        names: [
          "e5"
        ],
        id: 317
      },


      /* I5 */
      {
        names: [
          "i5"
        ],
        id: 255
      },


      /* ROBOTY KUCHENNE */
      {
        names: [
          "7 black pro",
          "black pro"
        ],
        id: 575
      },

      {
        names: [
          "7 smart i",
          "smart i"
        ],
        id: 411
      },


      /* ROBOTY SPRZĄTAJĄCE */
      {
        names: [
          "pro 28 3d ultra"
        ],
        id: 352
      },

      {
        names: [
          "pro 28 elite",
          "elite 2026"
        ],
        id: 622
      },


      /* ODKURZACZE */
      {
        names: [
          "m5 vapor",
          "vapor m5"
        ],
        id: 490
      },

      {
        names: [
          "ultra steam uv"
        ],
        id: 482
      },


      /* PRASOWALNICE */
      {
        names: [
          "steam one pro 40",
          'prasowalnica 40'
        ],
        id: 546
      },

      {
        names: [
          "steam one compact",
          "compact 32",
          'prasowalnica 32'
        ],
        id: 547
      },


      /* KUWETY */
      {
        names: [
          "kuweta k1",
          "cobbo k1"
        ],
        id: 548
      },

      {
        names: [
          "kuweta k2",
          "cobbo k2"
        ],
        id: 549
      },


      /* BEAUTY */
      {
        names: [
          "d9 supreme",
          "cobbo d9"
        ],
        id: 553
      },


      /* AIRFRYER */
      {
        names: [
          "smart fry 360",
          "smartfry 360",
          "smart fry"
        ],
        id: 630
      }

    ];


    for (
      const product
      of PRODUCT_NAME_MAP
    ) {

      for (
        const name
        of product.names
      ) {

        if (
          title.includes(
            normalizeText(name)
          )
        ) {

          return product.id;
        }
      }
    }


    console.warn(
      "COBBO Offers: nie rozpoznano ID produktu",
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
     GWARANCJA
  ========================================================= */

  function getWarrantyUrl() {

    const productId =
      getProductId();


    if (!productId) {
      return null;
    }


    return (
      CONFIG
        .warrantyByProductId[
          productId
        ]

      ||

      null
    );
  }


  /* =========================================================
     CSS
  ========================================================= */

  function injectStyles() {

    if (
      document.getElementById(
        STYLE_ID
      )
    ) {
      return;
    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      STYLE_ID;


    style.textContent = `

      /* =================================================
         RESET MODUŁU
      ================================================= */

      #${GRID_ID},
      #${GRID_ID} * {

        box-sizing:
          border-box;
      }


      /* =================================================
         GRID 2 x 2
      ================================================= */

      #${GRID_ID} {

        width:
          100%;

        display:
          grid;

        grid-template-columns:
          repeat(
            2,
            minmax(0, 1fr)
          );

        gap:
          10px;

        margin:
          12px 0 15px;

        font-family:
          "SF Pro Display",
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Arial,
          sans-serif;
      }


      /* =================================================
         KARTA
      ================================================= */

      #${GRID_ID}
      .cobbo-offer-card {

        position:
          relative;

        display:
          flex;

        flex-direction:
          column;

        justify-content:
          flex-end;

        width:
          100%;

        min-width:
          0;

        height:
          118px;

        min-height:
          118px;

        padding:
          16px 15px 15px;

        overflow:
          hidden;

        border-radius:
          16px;

        border:
          1px solid
          rgba(
            255,
            255,
            255,
            .16
          );

        text-decoration:
          none !important;

        color:
          #ffffff !important;

        box-shadow:
          0 6px 16px
          rgba(
            0,
            0,
            0,
            .15
          );

        transition:
          transform .18s ease,
          box-shadow .18s ease;
      }


      @media (hover: hover) {

        #${GRID_ID}
        a.cobbo-offer-card:hover,

        #${GRID_ID}
        .cobbo-offer-payu:hover {

          transform:
            translateY(-2px);

          box-shadow:
            0 9px 22px
            rgba(
              0,
              0,
              0,
              .19
            );
        }
      }


      /* =================================================
         ZŁOTA LINIA
      ================================================= */

      #${GRID_ID}
      .cobbo-offer-card::before {

        content:
          "";

        position:
          absolute;

        top:
          14px;

        left:
          15px;

        width:
          39px;

        height:
          3px;

        border-radius:
          999px;

        background:
          #f0c94d;

        z-index:
          5;
      }


      /* =================================================
         DUŻY SYMBOL W TLE
      ================================================= */

      #${GRID_ID}
      .cobbo-offer-ghost {

        position:
          absolute;

        right:
          -7px;

        bottom:
          -20px;

        z-index:
          1;

        pointer-events:
          none;

        user-select:
          none;

        font-size:
          82px;

        font-weight:
          900;

        line-height:
          1;

        letter-spacing:
          -5px;

        color:
          rgba(
            255,
            255,
            255,
            .10
          );
      }


      /* =================================================
         CONTENT
      ================================================= */

      #${GRID_ID}
      .cobbo-offer-content {

        position:
          relative;

        z-index:
          4;

        display:
          block;

        width:
          100%;

        min-width:
          0;
      }


      /* =================================================
         STANDARDOWY NAGŁÓWEK
      ================================================= */

      #${GRID_ID}
      .cobbo-offer-main {

        display:
          block;

        margin:
          0;

        padding:
          0;

        color:
          #ffffff;

        font-size:
          20px;

        font-weight:
          900;

        line-height:
          .98;

        letter-spacing:
          -.6px;

        text-transform:
          uppercase;
      }


      /* =================================================
         DUŻE -10% / -15%
      ================================================= */

      #${GRID_ID}
      .cobbo-offer-discount {

        display:
          inline-block;

        margin-right:
          3px;

        color:
          #ffffff;

        font-size:
          29px;

        font-weight:
          900;

        line-height:
          .9;

        letter-spacing:
          -1.2px;

        vertical-align:
          baseline;
      }


      #${GRID_ID}
      .cobbo-offer-main-text {

        display:
          inline;

        color:
          #ffffff;

        font-size:
          19px;

        font-weight:
          900;

        line-height:
          1;

        letter-spacing:
          -.6px;

        text-transform:
          uppercase;
      }


      /* =================================================
         PODPIS
      ================================================= */

      #${GRID_ID}
      .cobbo-offer-sub {

        display:
          block;

        margin-top:
          7px;

        color:
          rgba(
            255,
            255,
            255,
            .94
          );

        font-size:
          13px;

        font-weight:
          650;

        line-height:
          1.12;
      }


      /* =================================================
         PAYU - KARTA
      ================================================= */

      #${GRID_ID}
      .cobbo-offer-payu {

        background:
          linear-gradient(
            135deg,
            #0f6339 0%,
            #094225 100%
          );

        cursor:
          pointer;
      }


      /* =================================================
         PAYU - SLOT
      ================================================= */

      #${GRID_ID}
      #cobbo-payu-slot {

        position:
          relative;

        z-index:
          5;

        display:
          block;

        width:
          100%;

        min-width:
          0;

        min-height:
          46px;
      }


      /* =================================================
         PAYU
         CAŁKOWITE NADPISANIE DOMYŚLNEGO WIDGETU
      ================================================= */

      #${GRID_ID}
      #cobbo-payu-slot
      .payu-mini-installments-widget {

        position:
          relative !important;

        display:
          block !important;

        width:
          100% !important;

        max-width:
          none !important;

        height:
          auto !important;

        min-height:
          0 !important;

        max-height:
          none !important;

        margin:
          0 !important;

        padding:
          0 !important;

        overflow:
          visible !important;

        background:
          transparent !important;

        border:
          0 !important;

        border-radius:
          0 !important;

        box-shadow:
          none !important;

        color:
          #ffffff !important;

        font-family:
          "SF Pro Display",
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          Arial,
          sans-serif
          !important;
      }


      /* USUWAMY DEKORACJE PAYU */

      #${GRID_ID}
      #cobbo-payu-slot
      .payu-mini-installments-widget::before,

      #${GRID_ID}
      #cobbo-payu-slot
      .payu-mini-installments-widget::after {

        content:
          none !important;

        display:
          none !important;
      }


      /* LINK PAYU */

      #${GRID_ID}
      #cobbo-payu-slot
      .payu-mini-installments-widget a {

        position:
          relative !important;

        z-index:
          6 !important;

        display:
          block !important;

        width:
          100% !important;

        max-width:
          none !important;

        margin:
          0 !important;

        padding:
          0 !important;

        color:
          #ffffff !important;

        text-decoration:
          none !important;

        font-family:
          inherit !important;
      }


      /* =================================================
         PAYU
         "Rata 0% już od:"
      ================================================= */

      #${GRID_ID}
      #cobbo-payu-slot
      .payu-mini-installments-widget-label,

      #${GRID_ID}
      #cobbo-payu-slot
      .payu-mini-installments-widget-details {

        display:
          block !important;

        margin:
          0 0 6px 0 !important;

        padding:
          0 !important;

        color:
          #ffffff !important;

        font-size:
          14px !important;

        font-weight:
          600 !important;

        line-height:
          1.1 !important;

        letter-spacing:
          0 !important;

        white-space:
          nowrap !important;

        font-family:
          inherit !important;
      }


      /* PAYU SEPARATOR */

      #${GRID_ID}
      #cobbo-payu-slot
      .payu-mini-installments-widget-separator {

        color:
          #ffffff !important;

        font-size:
          14px !important;

        font-weight:
          600 !important;

        line-height:
          1.1 !important;

        font-family:
          inherit !important;
      }


      /* =================================================
         PAYU KWOTA RATY
      ================================================= */

      #${GRID_ID}
      #cobbo-payu-slot
      .payu-mini-installments-widget-amount {

        display:
          block !important;

        margin:
          0 !important;

        padding:
          0 !important;

        color:
          #ffffff !important;

        font-size:
          31px !important;

        font-weight:
          900 !important;

        line-height:
          .95 !important;

        letter-spacing:
          -1px !important;

        white-space:
          nowrap !important;

        font-family:
          inherit !important;
      }


      /* =================================================
         PAYU PLACEHOLDER
      ================================================= */

      #${GRID_ID}
      .cobbo-payu-loading-label {

        display:
          block;

        margin-bottom:
          6px;

        color:
          #ffffff;

        font-size:
          14px;

        font-weight:
          600;

        line-height:
          1.1;
      }


      #${GRID_ID}
      .cobbo-payu-loading-amount {

        display:
          block;

        color:
          #ffffff;

        font-size:
          31px;

        font-weight:
          900;

        line-height:
          .95;
      }


      /* =================================================
         GWARANCJA
      ================================================= */

      #${GRID_ID}
      .cobbo-offer-warranty {

        background:
          linear-gradient(
            135deg,
            #213577 0%,
            #111a3d 100%
          );
      }


      /* =================================================
         -10%
      ================================================= */

      #${GRID_ID}
      .cobbo-offer-promo10 {

        background:
          linear-gradient(
            135deg,
            #ef0715 0%,
            #c0000c 100%
          );
      }


      /* =================================================
         -15%
      ================================================= */

      #${GRID_ID}
      .cobbo-offer-promo15 {

        background:
          linear-gradient(
            135deg,
            #32322f 0%,
            #171714 100%
          );

        border-color:
          rgba(
            240,
            201,
            77,
            .34
          );

        cursor:
          default;
      }


      #${GRID_ID}
      .cobbo-offer-promo15::before {

        background:
          linear-gradient(
            90deg,
            #f0c94d,
            #ffe991
          );
      }


      #${GRID_ID}
      .cobbo-offer-promo15
      .cobbo-offer-ghost {

        color:
          rgba(
            240,
            201,
            77,
            .13
          );
      }


      /* =================================================
         MOBILE
      ================================================= */

      @media (max-width: 480px) {

        #${GRID_ID} {

          gap:
            8px;
        }


        #${GRID_ID}
        .cobbo-offer-card {

          height:
            114px;

          min-height:
            114px;

          padding:
            15px 12px 13px;
        }


        #${GRID_ID}
        .cobbo-offer-card::before {

          left:
            12px;

          width:
            36px;
        }


        #${GRID_ID}
        .cobbo-offer-main {

          font-size:
            18px;
        }


        #${GRID_ID}
        .cobbo-offer-discount {

          font-size:
            26px;
        }


        #${GRID_ID}
        .cobbo-offer-main-text {

          font-size:
            17px;
        }


        #${GRID_ID}
        .cobbo-offer-sub {

          margin-top:
            6px;

          font-size:
            12px;
        }


        #${GRID_ID}
        #cobbo-payu-slot
        .payu-mini-installments-widget-label,

        #${GRID_ID}
        #cobbo-payu-slot
        .payu-mini-installments-widget-details {

          font-size:
            13px !important;

          margin-bottom:
            5px !important;
        }


        #${GRID_ID}
        #cobbo-payu-slot
        .payu-mini-installments-widget-separator {

          font-size:
            13px !important;
        }


        #${GRID_ID}
        #cobbo-payu-slot
        .payu-mini-installments-widget-amount {

          font-size:
            29px !important;
        }


        #${GRID_ID}
        .cobbo-offer-ghost {

          font-size:
            76px;
        }
      }


      /* =================================================
         BARDZO MAŁE TELEFONY
      ================================================= */

      @media (max-width: 350px) {

        #${GRID_ID} {

          gap:
            7px;
        }


        #${GRID_ID}
        .cobbo-offer-card {

          height:
            110px;

          min-height:
            110px;

          padding:
            14px 10px 12px;
        }


        #${GRID_ID}
        .cobbo-offer-main {

          font-size:
            16px;
        }


        #${GRID_ID}
        .cobbo-offer-discount {

          font-size:
            23px;
        }


        #${GRID_ID}
        .cobbo-offer-main-text {

          font-size:
            15px;
        }


        #${GRID_ID}
        .cobbo-offer-sub {

          font-size:
            11px;
        }


        #${GRID_ID}
        #cobbo-payu-slot
        .payu-mini-installments-widget-label,

        #${GRID_ID}
        #cobbo-payu-slot
        .payu-mini-installments-widget-details {

          font-size:
            12px !important;
        }


        #${GRID_ID}
        #cobbo-payu-slot
        .payu-mini-installments-widget-amount {

          font-size:
            26px !important;
        }
      }

    `;


    document.head.appendChild(
      style
    );
  }


  /* =========================================================
     CENA PRODUKTU
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

    const priceElement =
      findPriceElement();


    if (!priceElement) {
      return null;
    }


    const raw =
      priceElement.getAttribute(
        "data-price"
      );


    if (!raw) {
      return null;
    }


    const normalized =
      String(raw)

        .trim()

        .replace(/\s/g, "")

        .replace(",", ".");


    const price =
      parseFloat(
        normalized
      );


    if (
      !Number.isFinite(price)
    ) {
      return null;
    }


    return price;
  }


  /* =========================================================
     TWORZENIE STANDARDOWEJ KARTY
  ========================================================= */

  function createCard({

    className,

    url,

    main,

    discount,

    sub,

    ghost

  }) {

    let card;


    if (url) {

      card =
        document.createElement(
          "a"
        );

      card.href =
        url;

    } else {

      card =
        document.createElement(
          "div"
        );
    }


    card.className =
      "cobbo-offer-card " +
      className;


    /* SYMBOL TŁA */

    const ghostElement =
      document.createElement(
        "span"
      );


    ghostElement.className =
      "cobbo-offer-ghost";


    ghostElement.textContent =
      ghost;


    /* CONTENT */

    const content =
      document.createElement(
        "span"
      );


    content.className =
      "cobbo-offer-content";


    /* NAGŁÓWEK */

    const mainElement =
      document.createElement(
        "span"
      );


    mainElement.className =
      "cobbo-offer-main";


    /*
      Jeżeli mamy discount,
      np. -10% lub -15%,
      wyróżniamy go większą czcionką.
    */

    if (discount) {

      const discountElement =
        document.createElement(
          "span"
        );


      discountElement.className =
        "cobbo-offer-discount";


      discountElement.textContent =
        discount;


      const mainTextElement =
        document.createElement(
          "span"
        );


      mainTextElement.className =
        "cobbo-offer-main-text";


      mainTextElement.textContent =
        main;


      mainElement.appendChild(
        discountElement
      );


      mainElement.appendChild(
        document.createTextNode(
          " "
        )
      );


      mainElement.appendChild(
        mainTextElement
      );

    } else {

      mainElement.textContent =
        main;
    }


    /* PODPIS */

    const subElement =
      document.createElement(
        "span"
      );


    subElement.className =
      "cobbo-offer-sub";


    subElement.textContent =
      sub;


    /* SKŁADANIE */

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
     BUDOWANIE GRIDU
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


    payuCard.id =
      "cobbo-payu-card";


    payuCard.innerHTML = `

      <span class="cobbo-offer-ghost">
        0%
      </span>

      <div class="cobbo-offer-content">

        <div
          id="cobbo-payu-slot"
        >

          <span
            class="cobbo-payu-loading-label"
          >
            Rata 0% już od:
          </span>

          <span
            class="cobbo-payu-loading-amount"
          >
            ...
          </span>

        </div>

      </div>

    `;


    /* =====================================================
       2. GWARANCJA
    ===================================================== */

    const warrantyUrl =
      getWarrantyUrl();


    let warrantyCard =
      null;


    if (warrantyUrl) {

      warrantyCard =
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
    }


    /* =====================================================
       3. -10%
    ===================================================== */

    const promo10Card =
      createCard({

        className:
          "cobbo-offer-promo10",

        url:
          CONFIG.promo10Url,

        discount:
          "-10%",

        main:
          "NA KOSZYK",

        sub:
          "Dobierz drugi produkt",

        ghost:
          "1+1"

      });


    /* =====================================================
       4. -15%
       BEZ LINKU
    ===================================================== */

    const promo15Card =
      createCard({

        className:
          "cobbo-offer-promo15",

        url:
          null,

        discount:
          "-15%",

        main:
          "NA TEN PRODUKT",

        sub:
          "przy dwóch dowolnych urządzeniach",

        ghost:
          "15%"

      });


    /* =====================================================
       KOLEJNOŚĆ
    ===================================================== */

    grid.appendChild(
      payuCard
    );


    if (warrantyCard) {

      grid.appendChild(
        warrantyCard
      );
    }


    grid.appendChild(
      promo10Card
    );


    grid.appendChild(
      promo15Card
    );


    /* =====================================================
       WSTAWIENIE POD CENĄ
    ===================================================== */

    productPrice.insertAdjacentElement(
      "afterend",
      grid
    );
  }


  /* =========================================================
     ŁADOWANIE BIBLIOTEKI PAYU
  ========================================================= */

  function loadPayU() {

    /*
      Jeśli PayU już istnieje,
      nie ładujemy drugi raz.
    */

    if (
      window.OpenPayU &&
      window.OpenPayU.Installments
    ) {

      return Promise.resolve();
    }


    /*
      Jeśli ładowanie już trwa,
      używamy istniejącego Promise.
    */

    if (payuLoadPromise) {

      return payuLoadPromise;
    }


    payuLoadPromise =
      new Promise(
        function (
          resolve,
          reject
        ) {

          /*
            Sprawdzamy, czy ktoś wcześniej
            dodał skrypt PayU.
          */

          const existing =
            document.querySelector(
              'script[src="' +
              PAYU_SCRIPT +
              '"]'
            );


          if (existing) {

            /*
              Jeśli API już istnieje,
              kończymy.
            */

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


          /*
            Tworzymy skrypt PayU dynamicznie.
          */

          const script =
            document.createElement(
              "script"
            );


          script.src =
            PAYU_SCRIPT;


          script.async =
            true;


          script.setAttribute(
            "data-cobbo-payu",
            "true"
          );


          script.onload =
            function () {

              resolve();
            };


          script.onerror =
            function () {

              reject(
                new Error(
                  "Nie udało się załadować biblioteki PayU."
                )
              );
            };


          /*
            Biblioteka ląduje fizycznie
            w HEAD, ale nie trzeba jej
            wpisywać ręcznie w SkyShop.
          */

          document.head.appendChild(
            script
          );

        }
      );


    return payuLoadPromise;
  }


  /* =========================================================
     PAYU - BRAK DOSTĘPNOŚCI
  ========================================================= */

  function hidePayUCard() {

    const card =
      document.getElementById(
        "cobbo-payu-card"
      );


    if (!card) {
      return;
    }


    /*
      Jeśli PayU nie jest dostępne
      dla danej kwoty, chowamy kafelek.
    */

    card.style.display =
      "none";
  }


  /* =========================================================
     PAYU - RENDER
  ========================================================= */

  function renderPayU() {

    const price =
      getProductPrice();


    const slot =
      document.getElementById(
        "cobbo-payu-slot"
      );


    const card =
      document.getElementById(
        "cobbo-payu-card"
      );


    if (
      !price ||
      !slot ||
      !card
    ) {
      return;
    }


    /*
      Nie renderujemy drugi raz,
      jeśli cena się nie zmieniła.
    */

    if (
      currentPayUPrice === price &&
      slot.querySelector(
        ".payu-mini-installments-widget"
      )
    ) {
      return;
    }


    currentPayUPrice =
      price;


    payuOpenWidget =
      null;


    /*
      Placeholder podczas ładowania.
    */

    slot.innerHTML = `

      <span
        class="cobbo-payu-loading-label"
      >
        Rata 0% już od:
      </span>

      <span
        class="cobbo-payu-loading-amount"
      >
        ...
      </span>

    `;


    card.style.display =
      "flex";


    loadPayU()

      .then(
        function () {

          if (
            !window.OpenPayU ||
            !window.OpenPayU.Installments
          ) {

            throw new Error(
              "OpenPayU.Installments niedostępne."
            );
          }


          /*
            Czyścimy placeholder tuż
            przed wygenerowaniem PayU.
          */

          slot.innerHTML =
            "";


          /*
            showLongDescription TRUE
            jak w pierwotnym działającym
            rozwiązaniu.
          */

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
                    true

                }

              )
          );
        }
      )


      .then(
        function (result) {

          /*
            Jeśli PayU dla tej kwoty
            nie jest dostępne.
          */

          if (
            !result ||
            result.isWidgetAvailable === false
          ) {

            hidePayUCard();

            return;
          }


          /*
            Zapamiętujemy oficjalną
            funkcję PayU do otwierania
            popupu.
          */

          if (
            typeof result.openWidget ===
            "function"
          ) {

            payuOpenWidget =
              result.openWidget;
          }


          /*
            Cały zielony kafelek
            będzie klikalny.
          */

          card.onclick =
            function (event) {

              /*
                Jeśli kliknięto bezpośrednio
                link PayU, pozwalamy mu
                działać normalnie.
              */

              if (
                event.target.closest(
                  "a"
                )
              ) {
                return;
              }


              if (
                typeof payuOpenWidget ===
                "function"
              ) {

                event.preventDefault();

                payuOpenWidget();
              }
            };


          card.setAttribute(
            "role",
            "button"
          );


          card.setAttribute(
            "tabindex",
            "0"
          );


          /*
            Obsługa Enter / Space.
          */

          card.onkeydown =
            function (event) {

              if (
                event.key === "Enter" ||
                event.key === " "
              ) {

                event.preventDefault();


                if (
                  typeof payuOpenWidget ===
                  "function"
                ) {

                  payuOpenWidget();
                }
              }
            };
        }
      )


      .catch(
        function (error) {

          console.error(
            "COBBO PayU:",
            error
          );


          hidePayUCard();
        }
      );
  }


  /* =========================================================
     USUWANIE STARYCH ELEMENTÓW
     zabezpieczenie na czas migracji
  ========================================================= */

  function removeLegacyWidgets() {

    /*
      STARY PAYU
    */

    const oldPayuWidgets =
      document.querySelectorAll(
        ".payu-mini-installments-widget"
      );


    oldPayuWidgets.forEach(
      function (widget) {

        if (
          widget.closest(
            "#" + GRID_ID
          )
        ) {
          return;
        }


        const installment =
          widget.closest(
            "#installment-mini"
          );


        const wrapper =
          installment
            ? installment.parentElement
            : widget.parentElement;


        if (
          wrapper &&
          wrapper.tagName === "P"
        ) {

          wrapper.remove();

        } else {

          widget.remove();
        }
      }
    );


    /*
      STARY KAFELEK GWARANCJI
    */

    const oldWarranty =
      document.getElementById(
        "cobbo-warranty-container"
      );


    if (
      oldWarranty &&
      !oldWarranty.closest(
        "#" + GRID_ID
      )
    ) {

      const wrapper =
        oldWarranty.closest("p");


      if (wrapper) {

        wrapper.remove();

      } else {

        oldWarranty.remove();
      }
    }


    /*
      STARY KAFELEK 1+1
    */

    const oldBundle =
      document.getElementById(
        "cobbo-bundle-container"
      );


    if (
      oldBundle &&
      !oldBundle.closest(
        "#" + GRID_ID
      )
    ) {

      const wrapper =
        oldBundle.closest("p");


      if (wrapper) {

        wrapper.remove();

      } else {

        oldBundle.remove();
      }
    }
  }


  /* =========================================================
     OBSERWACJA ZMIANY CENY
  ========================================================= */

  function observePrice() {

    const productPrice =
      document.querySelector(
        ".product-price"
      );


    if (!productPrice) {
      return;
    }


    let timeout =
      null;


    const observer =
      new MutationObserver(
        function () {

          clearTimeout(
            timeout
          );


          timeout =
            setTimeout(
              function () {

                const newPrice =
                  getProductPrice();


                if (
                  newPrice &&
                  newPrice !==
                    currentPayUPrice
                ) {

                  currentPayUPrice =
                    null;


                  renderPayU();
                }

              },
              180
            );
        }
      );


    observer.observe(
      productPrice,
      {

        subtree:
          true,

        childList:
          true,

        characterData:
          true,

        attributes:
          true,

        attributeFilter: [
          "data-price"
        ]

      }
    );
  }


  /* =========================================================
     KRÓTKI WATCHER STARYCH WIDGETÓW
     tylko na czas ładowania strony
  ========================================================= */

  function cleanupLegacyForMoment() {

    let attempts =
      0;


    const timer =
      setInterval(
        function () {

          attempts++;


          removeLegacyWidgets();


          if (
            attempts >= 20
          ) {

            clearInterval(
              timer
            );
          }

        },
        300
      );
  }


  /* =========================================================
     INIT
  ========================================================= */

  function init() {

    injectStyles();


    removeLegacyWidgets();


    let attempts =
      0;


    const timer =
      setInterval(
        function () {

          attempts++;


          const priceElement =
            findPriceElement();


          if (priceElement) {

            clearInterval(
              timer
            );


            /*
              Usuwamy pozostałości
              starego rozwiązania.
            */

            removeLegacyWidgets();


            /*
              Budujemy moduł.
            */

            buildGrid();


            /*
              Ładujemy PayU.
            */

            renderPayU();


            /*
              Obserwujemy ewentualną
              zmianę ceny produktu.
            */

            observePrice();


            /*
              Przez pierwsze kilka sekund
              pilnujemy, czy stary kod
              nie dorzuci elementów.
            */

            cleanupLegacyForMoment();


            return;
          }


          /*
            Maksymalnie ok. 10 sekund.
          */

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


  /* =========================================================
     START
  ========================================================= */

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
