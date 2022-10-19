class I18N {
  /**
   * Initialize a new i18n class.
   *
   * @param {object} i18nConfig
   * @param {array}  i18nConfig.locales
   * @param {string} i18nConfig.directory
   * @param {string} i18nConfig.fallbackLocale
   *
   * @constructor
   */
  constructor(i18nConfig) {
    this.config = i18nConfig;

    this._checkLocale();
  }

  /**
   * Get current locale.
   *
   * @return {string}
   */
  get locale() {
    return this.config.locale;
  }

  /**
   * Set current locale.
   *
   * @param {string} locale
   */
  set locale(locale) {
    this.config.locale = locale;

    this._checkLocale();
  }

  /**
   * Return object with date format options for current locale.
   *
   * @return {object}
   */
  get dateFormat() {
    this._checkLocale();

    return this.config.details[this.locale].date;
  }

  /**
   * Return object with money format options for current locale.
   *
   * @return {object}
   */
  get moneyFormat() {
    this._checkLocale();

    return this.config.details[this.locale].money;
  }

  /**
   * Return currency for current locale.
   *
   * @return {string}
   */
  get currency() {
    this._checkLocale();

    return this.config.details[this.locale].currency;
  }

  /**
   * Return currency for current locale.
   *
   * @return {string}
   */
  get currencySymbol() {
    this._checkLocale();

    return this.config.details[this.locale].currencySymbol;
  }

  /**
   * Translate a string.
   *
   * @param {string} key
   * @param {int} count - If it's an object, it becomes "params" arg
   * @param {object} params
   * @return {string}
   */
  t(key, count = null, params = null) {
    this._checkLocale();

    // If count is an object, assume it is the params value
    if (typeof count === "object" && !params) {
      params = count;
    }

    // Load document
    const languageFile = [
      this.config.directory,
      this.config.locale + ".json",
    ].join("/");

    // Retrieve language string or fallback to key (last arg)
    let translatedString = languageFile[key] || key;

    // Check if there's a pipe for p11n
    if (translatedString.indexOf("|") > -1 && typeof count === "number") {
      const [singular, plural] = translatedString.split("|");
      translatedString = count === 1 ? singular : plural;
    }

    // Replace variables if there's a valid iterable object
    if (params) {
      for (let [paramName, paramValue] of Object.entries(params)) {
        const regex = new RegExp(`{${paramName}}`, "g");
        translatedString = translatedString.replace(regex, paramValue);
      }
    }

    return translatedString;
  }

  /**
   * Format a money value.
   *
   * THIS FUNCTION REQURES A TS LIBRARY THAT IS NOT INSTALLED - USE PRICE INSTEAD
   *
   * @param {number}  amount
   * @param {object}  options
   * @param {boolean} options.symbol - Show the symbol. False will hide it.
   * @param {string}  options.symbolPosition - Position of the currency symbol in the string. Available values: left|right
   * @param {boolean} options.symbolSpacing - Put a space between the symbol and the value.
   * @return {string}
   */
  money(amount, formatOptions = {}) {
    this._checkLocale();

    // Apply default values to user defined options
    const options = {
      ...{
        symbol: true,
        symbolPosition: "right",
        symbolSpacing: false,
      },
      ...formatOptions,
    };

    return currency(amount, {
      symbol: options.symbol ? this.currencySymbol : "",
      formatWithSymbol: options.symbol,
      separator: this.moneyFormat.separator.thousands,
      decimal: this.moneyFormat.separator.decimal,
      precision: this.moneyFormat.decimals,
      pattern: this._currencyPattern(options),
    }).format();
  }

  price(amount, decimals) {
    this._checkLocale();

    // legacy impementation

    if (amount === undefined) return;

    return new Intl.NumberFormat(this.locale, {
      style: "currency",
      currency: this.currency,
      maximumFractionDigits: decimals || this.moneyFormat.decimals,
      mimimumFractionDigits: decimals || this.moneyFormat.decimals,
    }).format(amount);
  }

  /**
   * Check if provided locale is allowed or fallback.
   *
   * @private
   */
  _checkLocale() {
    // If current locale is not enabled, fallback
    if (this.config.locales.indexOf(this.config.locale) === -1) {
      this.config.locale = this.config.fallbackLocale;
    }
  }

  /**
   * Create a string pattern for the currency lib.
   *
   * @private
   *
   * @param {object} options
   * @return {string}
   */
  _currencyPattern(options) {
    let pattern = "";

    // Add symbol at the left if needed
    if (options.symbol && options.symbolPosition === "left") {
      pattern += "!";

      if (options.symbolSpacing) pattern += " ";
    }

    // Add amount
    pattern += "#";

    // Add symbol at the right if needed
    if (options.symbol && options.symbolPosition === "right") {
      if (options.symbolSpacing) pattern += " ";

      pattern += "!";
    }

    return pattern;
  }

  _areRouteParamsValid(pageKey, routeParams) {
    const configParams = this.config.frontEndParamsByRoute[pageKey];
    let exceptionParams = [];

    if (routeParams) {
      Object.keys(routeParams).forEach((key) => {
        if (configParams[key] !== "") {
          exceptionParams.push(key);
        }
      });
    }

    return exceptionParams.length === 0;
  }

  _createQueryString(routeParams, isRouteParam = false) {
    return Object.keys(routeParams)
      .map((key) => {
        const value = routeParams[key];
        if (isRouteParam) return `p.${key}=${value}`;
        return `${key}=${value}`;
      })
      .join("&");
  }

  getUrl(pageKey, routeParams, baseUrl, extraParams = {}) {
    if (!this._areRouteParamsValid(pageKey, routeParams))
      throw "Provided route params are not valid"; // something bad
    if (baseUrl[baseUrl.length - 1] !== "/") {
      baseUrl = `${baseUrl}/`;
    }

    const queryString = this._createQueryString(routeParams, true);
    let url = `${baseUrl}?routingKey=${pageKey}&${queryString}`;

    if (!!extraParams) {
      url += `&${this._createQueryString(extraParams)}`;
    }
    console.log(url);
    return url;
  }
}

angular.module("viaggiApp").service("$i18n", service);

function service() {
  const self = this;
  const fallbackLocale = "it-IT";

  const getLocaleCodeFromDomain = function () {
    const u = new URL(window.location.href);
    const urlString = u.host.split(".");

    const domainLocale = urlString[urlString.length - 1];

    switch (domainLocale) {
      case "wr":
        return "it-IT";
      case "eswr":
        return "es-ES";
      case "ukwr":
        return "en-GB";
      case "it":
        return "it-IT";
      case "es":
        return "es-ES";
      case "travel":
        return "en-GB";
      default:
        return "it-IT";
    }
  };

  self.locale = getLocaleCodeFromDomain();
  self._locale = self.locale.replace("-", "_");

  self.i18nConfig = {
    locale: self.locale,
    _locale: self._locale,
    countryCode: self.locale.split("-")[1],
    // Fallback locale if the current is not valid
    fallbackLocale: fallbackLocale,
    // Allowed locales
    locales: ["it-IT", "es-ES", "en-GB"],
    // Path of language files
    directory: "/lang/json",
    // Configuration per language
    details: {
      "it-IT": {
        currency: "EUR",
        currencySymbol: "€",
        date: {
          dayMonth: "DD/MM",
          dayMonthYear: "DD/MM/YYYY",
          fullNumber: "dddd, DD/MM/YYYY",
          full: "dddd DD MMMM",
        },
        money: {
          decimals: 2,
          separator: {
            decimal: ",",
            thousands: ".",
          },
        },
      },
      "es-ES": {
        currency: "EUR",
        currencySymbol: "€",
        date: {
          dayMonth: "DD/MM",
          dayMonthYear: "DD/MM/YYYY",
          fullNumber: "dddd, DD/MM/YYYY",
          full: "dddd DD MMMM",
        },
        money: {
          decimals: 2,
          separator: {
            decimal: ",",
            thousands: ".",
          },
        },
      },
      "en-US": {
        currency: "USD",
        currencySymbol: "$",
        date: {
          dayMonth: "MM-DD",
          dayMonthYear: "YYYY-MM-DD",
          fullNumber: "dddd, YYYY-MM-DD",
          full: "dddd DD MMMM",
        },
        money: {
          decimals: 2,
          separator: {
            decimal: ".",
            thousands: ",",
          },
        },
      },
      "en-GB": {
        currency: "GBP",
        currencySymbol: "£",
        date: {
          dayMonth: "DD-MM",
          dayMonthYear: "DD-MM-YYYYY",
          fullNumber: "dddd, DD-MM-YYYY",
          full: "dddd DD MMMM",
        },
        money: {
          decimals: 2,
          separator: {
            decimal: ".",
            thousands: ",",
          },
        },
      },
    },
    // Necessary for dynamic frontend link created from backoffice
    frontEndParamsByRoute: {
      index: {},
      boom: {},
      "how-it-works": {},
      contacts: {},
      dark: {},
      questions: {},
      "age-groups": {},
      "last-minute": {},
      "work-with-us": {},
      login: {},
      logout: {},
      maintenance: {},
      mood: {},
      "no-sharing-room": {},
      "departures-new-year": {},
      "departures-september": {},
      "confirmed-travel-departures": {},
      "session-expired": {},
      "special-turns": {},
      "weroad-selfie": {},
      "activation-token": { token: "" },
      "activation-regenerate-token": { token: "" },
      "booking-turn-account": { turn: "" },
      "booking-turn-payment": { turn: "" },
      "booking-turn-start": { turn: "" },
      "booking-turn-success": { turn: "" },
      "booking-turn-travelers": { turn: "" },
      "booking-turn-waiting-list": { turn: "" },
      "communication-optin-token-notifyme": { token: "" },
      coordinators: {},
      "coordinators-coordinator": { coordinator: "" },
      "how-are-you-token": { token: "" },
      "my-weroad-bookings": {},
      "my-weroad-profile": {},
      "my-weroad-communication-management": {},
      "my-weroad-payment-transaction-method-success": {
        transaction: "",
        method: "",
      },
      "my-weroad-payment-transaction-creditcard": { transaction: "" },
      "my-weroad-payment-transaction-transfer": { transaction: "" },
      "my-weroad-travelers-booking": { booking: "" },
      "reset-password": {},
      "reset-password-token": { token: "" },
      "retrieve-cart-token": { token: "" },
      travels: {},
      "travels-travels-itineraries": {},
      "travels-travel": { travel: "" },
      "travels-travel-available-dates": { travel: "" },
      "travels-travel-questions": { travel: "" },
      "travels-travel-itinerary": { travel: "" },
      "travels-travel-turn": { travel: "", turn: "" },
    },
  };

  self.i18n = new I18N(self.i18nConfig);

  self.getLocaleFromDomain = function () {
    const u = new URL(window.location.href);
    const urlString = u.host.split(".");

    const domainLocale = urlString[urlString.length - 1];
    return domainLocale === "wr" ? "it" : domainLocale;
  };

  self.getLocaleCodeFromDomain = getLocaleCodeFromDomain;

  self.getUrl = function (pageKey, routeParams, baseUrl, extraParams = {}) {
    return self.i18n.getUrl(pageKey, routeParams, baseUrl, extraParams);
  };
}
