angular.module("viaggiApp").service("$core", service);

function service(
  $http,
  $state,
  $q,
  $injector,
  $cookies,
  $rootScope,
  $timeout,
  $interval,
  $window,
  $stateParams,
  $auth
) {
  var self = this,
    $mdToast,
    $mdDialog,
    $mail,
    $i18n;

  self._api = $window.apiEndpoint;
  self._env = undefined;
  self._token = undefined;
  self._baseAccountMeta = [];

  self.api = function (v) {
    return self._api + (v ? v : "v0") + "/";
  };

  self.env = function () {
    return self._env;
  };
  // self.token = function(){
  //     if ( !self._token ) self._token = $cookies.get('_tkn');
  //     return self._token;
  // }
  // self.setToken = function ( token ) {
  //     self._token = token;
  //     $cookies.put('_tkn' , token);
  // }
  // self.getToken = function(){
  //     return new Promise(function(resolve,reject){
  //         if ( !self.token() ) {
  //             $http.get(self.api() + 'token')
  //                 .then(function(response) {
  //                     $cookies.put('_tkn', response.data);
  //                     resolve();
  //                 });
  //         } else resolve();
  //     });
  // }

  self.init = function () {
    var deferred = $q.defer();
    if (self._env) deferred.resolve();
    else {
      $http
        .get(self.api() + "settings")
        .then(function (response) {
          if (!response.error) {
            self._env = response.data;
            self.pagination = [50, 100, 150];
            self.listPagination = self.pagination[0];
            self.timer = self.env()._timer;
            self.notifiche = [];
            self.seo = {};
            self.generalSeo = angular.fromJson(
              self.env().global.meta_tag.setting_value
            );
            self.prenotazionePrezzo = 0;

            $rootScope.menuHeader = angular.fromJson(
              self.env().global.menu_header.setting_value
            );
            $rootScope.menuFooter = angular.fromJson(
              self.env().global.menu_footer.setting_value
            );
            $rootScope.logoDark = "/public/images/logo/weroad-dark.png";
            $rootScope.logoLight = "/public/images/logo/weroad-light.png";

            $rootScope.footerColor =
              self.env().global.footerColor.setting_value;

            $mail = $injector.get("$mail");
            $mail.initSettings();

            $i18n = $injector.get("$i18n");
            window.i18n = $i18n.i18n;

            $rootScope.flagIcon =
              "/public/images/flag-" + $i18n.getLocaleFromDomain() + ".png";

            deferred.resolve();
          } else deferred.reject();
        })
        .catch(function (errorSettings) {
          console.log(errorSettings);
        });
    }
    return deferred.promise;
  };

  self.baseAccountMeta = function () {
    var deferred = $q.defer();
    if (self._baseAccountMeta.length) deferred.resolve(self._baseAccountMeta);
    else {
      $http
        .get(self.api("v1") + "settings/keys", {
          params: { keys: ["accountMeta"] },
        })
        .then(function (response) {
          if (!response.data.error) {
            if (response.data.data.hasOwnProperty("accountMeta")) {
              self._baseAccountMeta = JSON.parse(
                response.data.data.accountMeta
              );
            } else {
              self._baseAccountMeta = [];
            }
            deferred.resolve(self._baseAccountMeta);
          }
        });
    }
    return deferred.promise;
  };

  self._date = function (date) {
    if (!date) return;
    if (date instanceof Date) return date;
    return new Date(date.replace(/-/g, "/"));
  };

  self.daysBetween = function (start, end) {
    start = self._date(start);
    end = self._date(end);

    return Math.round(
      Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  // query e pagination
  self.Query = function (total, limit, offset) {
    var _this = this;
    _this.__pagination = 1;
    _this._pagination = 1;
    _this._load = true;
    _this._total = total ? total : 0;
    _this._limit = limit ? limit : 100;
    _this._offset = offset ? offset : 0;
    _this._isOpenFilters = false;
    _this.filters = {};
    _this._filters = {};
    _this.promise;

    _this._query = function () {
      return {
        offset: _this._offset,
        limit: _this._limit,
        filters: _this._filters,
      };
    };

    _this.load = function () {
      return _this._load;
    };

    _this.pagination = {
      now: function () {
        return _this.__pagination;
      },
      all: function () {
        return Math.ceil(_this._total / _this._limit);
      },
      total: function () {
        return _this._total;
      },
    };

    _this.setTotal = function (total) {
      _this._total = total;
    };

    _this._build = function () {
      _this._offset = (_this._pagination - 1) * _this._limit;
    };

    _this.canPrev = function () {
      return _this.__pagination > 1;
    };
    _this.canNext = function () {
      return _this._limit * _this.__pagination < _this._total;
    };

    _this.prev = function () {
      _this._load = false;
      _this._pagination--;
      _this.promise().then(function () {
        _this.__pagination--;
        if (_this._total == 0) {
          _this._offset = 0;
          _this.__pagination = 1;
          _this._pagination = 1;
        }
        _this._load = true;
      });
    };
    _this.next = function () {
      _this._load = false;
      _this._pagination++;
      _this.promise().then(function () {
        _this.__pagination++;
        if (_this._total == 0) {
          _this._offset = 0;
          _this.__pagination = 1;
          _this._pagination = 1;
        }
        _this._load = true;
      });
    };

    _this.set = function (name, value) {
      _this._query[name] = value;
    };
    _this.get = function () {
      _this._build();
      return _this._query();
    };

    // filters
    _this.isActiveFilters = function () {
      return Object.keys(_this._filters).length > 0;
    };
    _this.isOpenFilters = function () {
      return _this._isOpenFilters;
    };
    _this.toggleFilters = function () {
      _this._isOpenFilters = !_this._isOpenFilters;
    };
    _this.applyFilter = function () {
      _this._load = false;
      _this._filters = angular.copy(_this.filters);
      _this._offset = 0;
      _this.__pagination = 1;
      _this._pagination = 1;
      _this.promise().then(function () {
        if (_this._total == 0) {
          _this._offset = 0;
          _this.__pagination = 1;
          _this._pagination = 1;
        }
        _this._isOpenFilters = false;
        _this._load = true;
      });
    };
    _this.removeFilter = function () {
      _this._load = false;
      _this._offset = 0;
      _this._filters = {};
      _this.__pagination = 1;
      _this._pagination = 1;
      _this.promise().then(function () {
        _this.filters = {};
        if (_this._total == 0) {
          _this._offset = 0;
          _this.__pagination = 1;
          _this._pagination = 1;
        }
        _this._isOpenFilters = false;
        _this._load = true;
      });
    };
  };

  ////////// vecchiop global service

  self.initSettings = function (settings) {};

  self.resetSeo = function () {
    self.generalSeo = angular.fromJson(
      self.env().global.meta_tag.setting_value
    );
  };

  self.mediaMenu = function () {
    return window.innerWidth >= 1900;
  };

  self.startScrollHeaderTrasparente = function () {
    angular.element(window).on("scroll", function () {
      var scrollTop = angular.element(window).scrollTop();
      if (scrollTop > 120) {
        if (angular.element("html").hasClass("header-trasparente"))
          angular.element("html").removeClass("header-trasparente");
      } else {
        if (!angular.element("html").hasClass("header-trasparente"))
          angular.element("html").addClass("header-trasparente");
      }
    });
  };

  self.stopScrollHeaderTrasparente = function () {
    angular.element(window).off("scroll");
  };

  self.listIconFonts = {
    "icon-facebook-group": "Facebook Group",
    "icon-alloggi": "Alloggi",
    "icon-ico-cal": "Calendario",
    "icon-ico-tragitto": "Pin",
    "icon-staff": "Staff",
    "icon-transporti": "Transporti",
    "icon-food": "Food",
    "icon-plane": "Aeroplano",
    "icon-diamante": "Diamante",
    "icon-whatsapp": "Whatsapp",
    "icon-youtube-play": "Yuotube",
  };

  self.textAngular = {
    tooltip: {
      simple: [["bold", "italics", "ul", "addLink", "html"]],
      full: [
        [
          "h1",
          "h2",
          "h3",
          "p",
          "pre",
          "bold",
          "italics",
          "underline",
          "ul",
          "ol",
          "redo",
          "undo",
          "clear",
        ],
        [
          "justifyLeft",
          "justifyCenter",
          "justifyRight",
          "justifyFull",
          "html",
          "addLink",
          "insertMedia",
          "embedYoutube",
        ],
      ],
    },
    methods: {
      clearInput: function (data) {
        return data ? String(data).replace(/<[^>]+>/gm, "") : "";
      },
    },
  };

  /**
   * Calculate booking price
   *
   * @param checkAnnA
   * @param checkAnnB
   * @param checkNoShare
   * @param numViaggiatori
   * @param obj
   * @param numViaggiatoriAnnullamento
   * @returns {number}
   */
  self.calculatePrice = function (
    checkAnnA,
    checkAnnB,
    checkNoShare,
    numViaggiatori,
    obj,
    numViaggiatoriAnnullamento,
    promoItem
  ) {
    var price = 0;
    var promo = promoItem && promoItem.attivo ? promoItem.costo : 0;

    // Calcola giorni
    var giorni = self.getIntervalDate(
      new Date(obj.turno_data_partenza),
      new Date(obj.turno_data_ritorno)
    );

    // Costi no sharing room
    var noSharingBase = parseFloat(
      obj.no_sharing_room
        ? obj.no_sharing_room
        : self.env().global.no_sharing_room.setting_value
    );

    // Sconto
    var sconto = 0;
    if (obj.hasOwnProperty("_sconto_costo") && obj._sconto_costo !== null) {
      sconto = parseFloat(obj._sconto_costo);
    } else if (
      obj.hasOwnProperty("prenotazione_sconto") &&
      obj.prenotazione_sconto !== null
    ) {
      sconto = parseFloat(obj.prenotazione_sconto);
    }

    var noSharing = 0;
    var annullamento = 0;

    if (checkAnnA === true) {
      annullamento = parseFloat(
        self.env().global.opzione_annullamento.setting_value *
          numViaggiatoriAnnullamento
      );
    }

    if (checkNoShare === true) {
      noSharing = parseFloat(noSharingBase * (giorni - 1));
    }

    return (
      numViaggiatori * (obj.turno_prezzo_base - sconto - promo) +
      noSharing +
      annullamento
    );
  };

  /**
   * Calculate transaction status.
   *
   * @param transazioni
   * @returns {{payed: number, toPay: number, refunded: number, toRefund: number}}
   */
  self.transactionStatus = function (transazioni) {
    var status = {
      payed: 0,
      toPay: 0,
      refunded: 0,
      toRefund: 0,
    };

    angular.forEach(transazioni, function (transazione) {
      if (transazione.transazione_rimborsata == 1) {
        status.refunded += transazione.transazione_valore;
      } else if (transazione.transazione_is_pagato == 1) {
        status.payed += transazione.transazione_valore;
      } else if (transazione.transazione_is_pagato == 0) {
        status.toPay += transazione.transazione_valore;
      }
    });

    return status;
  };

  self.goToScroll = function (id) {
    var top =
      angular.element(id).offset().top - angular.element("header").height();
    angular.element("html,body").animate({ scrollTop: top }, "slow");
  };

  self.getIntervalDate = function (dateFrom, dateTo) {
    if (!dateFrom || !dateTo) return;
    if (typeof dateFrom === "number") {
      dateFrom = new Date(dateFrom * 1000);
      dateTo = new Date(dateTo * 1000);
    } else if (typeof dateFrom === "string") {
      dateFrom = new Date(dateFrom.replace(/-/g, "/"));
      dateTo = new Date(dateTo.replace(/-/g, "/"));
    }

    dateFrom.setHours(0);
    dateFrom.setMinutes(0);
    dateFrom.setSeconds(0);

    dateTo.setHours(23);
    dateTo.setMinutes(59);
    dateTo.setSeconds(59);

    return Math.round(
      Math.abs((dateFrom.getTime() - dateTo.getTime()) / (1000 * 60 * 60 * 24))
    );
  };

  self.getClassStatoTurno = function (min, max, prenotazioni, soldout) {
    var css = "turno-tipo-";
    if (soldout) css += "soldout";
    else {
      if (prenotazioni < min) css += "da-confermare";
      else if (prenotazioni < max && prenotazioni >= min) css += "confermato";
      else if (prenotazioni >= max) css += "waiting-list";
      else return;
    }

    return css;
  };

  // Timer prenotazione
  self.stopTimer = function () {
    $interval.cancel(self.checkTimer);
    self.checkTimer = undefined;
  };

  self.reloadTimer = function () {
    self.timer = self.env()._timer;
  };

  self.openTimerModal = function () {
    angular.element(".overlay-base").fadeIn(300, function () {
      $timeout(function () {
        self.modale = "timer";
      });
    });
  };

  self.startTimer = function () {
    self.checkTimer = $interval(function () {
      self.timer -= 1;

      if (self.timer == 60) {
        self.openTimerModal();
      } else if (self.timer == 50) {
        var params = {};

        if (self.prenotazione_id) {
          var params = {
            prenotazione_id: self.prenotazione_id,
          };
        }

        $core.modale = "";
        angular.element(".overlay-base").fadeOut(300);

        self.stopTimer();
        $state.go("expired", params);
      }
      if (self.timer <= 0) {
        self.reloadTimer();
      }
    }, 1000);
  };

  self.inListRelation = function (id, list) {
    return list.indexOf(id) != -1;
  };

  self.addRelation = function (relations, exclude, item, field) {
    relations.push(item);
    exclude.push(item[field]);
  };

  self.removeRelation = function (relations, exclude, item, field) {
    relations.filter(function (relation, index) {
      if (relation[field] == item[field]) {
        relations.splice(index, 1);
        exclude.splice(exclude.indexOf(item[field]), 1);
      }
    });
  };

  self.actionToModal = function (modale, callback) {
    var apri = false;
    if (modale && modale != "") apri = true;
    if (apri) {
      var overlay;
      if (modale == "prenota" || modale == "strutture")
        overlay = ".overlay-turni";
      else if (modale == "ritenta") overlay = ".overlay-prenotazione";
      else if (modale == "errore-stripe") overlay = ".overlay-messaggio-stripe";
      else overlay = ".overlay-base";

      if (!angular.element("html").hasClass("ovh")) {
        angular.element("html").addClass("ovh");
        angular.element(overlay).fadeIn(300, function () {
          $timeout(function () {
            if (self.modale != modale) self.modale = modale;
            if (callback && typeof callback == "function") callback();
          });
        });
      } else {
        if (callback && typeof callback == "function") callback();
      }
    } else {
      self.modale = "";
      angular
        .element(".overlay-base,.overlay-turni,.overlay-prenotazione")
        .fadeOut(300, function () {
          angular.element("html").removeClass("ovh");
          if (callback && typeof callback == "function") callback();
        });
    }
  };

  /**
   *
   *
   * gestione tabelle
   */
  self.prepareOffsetPagination = function (page, limit) {
    return page === undefined || page == 1 ? 0 : limit * (page - 1);
  };

  self.prepareQueryOrderTable = function (order) {
    var by, ord;
    if (order.indexOf("-") == 0) {
      by = "DESC";
      ord = order.replace("-", "");
    } else {
      by = "ASC";
      ord = order;
    }
    return ord + " " + by;
  };

  /**
   *
   *
   * EVENTI ROOTSCOPE
   * EMIT ON
   *
   */
  self.emit = function () {
    return {
      save: function (stato, data) {
        $rootScope.$emit("mlb:cms:salva", stato, data);
      },
      message: function (message) {
        $rootScope.$emit("mlb:cms:message", message);
      },
    };
  };
  self.on = function () {
    return {
      siteLogin: function (event, logout) {
        if (logout) angular.element("html").removeClass("user-login");
        else angular.element("html").addClass("user-login");
      },

      message: function (event, message) {
        $mdToast = $injector.get("$mdToast");
        if (message !== "") {
          $mdToast.show(
            $mdToast
              .simple()
              .textContent(message)
              .position("bottom right")
              .hideDelay(2000)
              .parent("#content-view")
          );
        }
      },

      save: function (event, stato, data) {
        $mdToast = $injector.get("$mdToast");
        if (stato === undefined || stato == "") stato = "success";
        if (data === undefined || data == "") data = "dati salvati";

        $mdToast.show(
          $mdToast
            .simple()
            .textContent(data)
            .position("bottom right")
            .hideDelay(2000)
            .parent("#content-view")
        );
        /*
                        var page = angular.element("#page > .content-view");
                        page.append("<div class=\"notifica stato-"+stato+" \"><div class=\"msg\"><md-icon class=\"material-icons\">info_outline</md-icon>"+data+"</div></div>");
                        var notifica = page.find(".notifica").eq(0);

                        if( notifica.length ) {
                            $timeout(function(){
                                notifica.addClass("opened");
                                $timeout(function(){
                                    notifica.removeClass("opened");
                                    $timeout(function(){
                                        notifica.remove();
                                    },510);
                                },2000);
                            },100);

                        }*/
      },
    };
  };

  self.logoutSite = function () {
    $auth.removeToken();
    self.userLogin = undefined;
    $rootScope.$emit("mlb:www:login", true);
    $window.location.href = "/";
  };

  self.buildParamsUserLogin = function (user) {
    var u = {};
    angular.forEach(user, function (field, k) {
      if (k == "role_params") field = JSON.parse(field);
      if (k.indexOf("extra_") != -1) {
        if (!u._extra) u._extra = {};
        u._extra[k] = field;
      } else if (k == "role_label" || k == "role_params" || k == "role_attivo")
        u["_" + k] = field;
      else u[k] = field;
    });
    return u;
  };

  self.paramsQuery = {
    sconti: {
      order: "sconto_id DESC",
    },

    transazioni: {
      order: "transazione_data_creazione DESC",
    },

    turni: {
      order: "turno_data_partenza ASC",
    },

    utenti: {
      role: true,
      order: "utente_data_creazione DESC",
    },

    report: {
      order: "turno_data_partenza DESC",
    },

    viaggi: {
      order: "viaggio_id DESC",
    },

    viaggiUtente: {
      order: "viaggio_data_creazione DESC",
    },

    guide: {
      order: "guida_id DESC",
    },

    gruppi: {
      order: "gruppo_id DESC",
    },

    prenotazioni: {
      order: "prenotazione_id DESC",
    },

    viaggiatori: {
      order: "viaggiatore_id DESC",
    },
  };

  self.trackPush = function (prezzo, callback) {
    if ($window.hasOwnProperty("google_trackConversion")) {
      $window.google_trackConversion({
        google_conversion_id: 857959509,
        google_conversion_language: "en",
        google_conversion_format: "3",
        google_conversion_color: "ffffff",
        google_conversion_label: "qkhfCJG",
        google_conversion_currency: "EUR",
        google_conversion_value: parseFloat(prezzo),
        google_remarketing_only: false,
      });
    }

    if (callback && typeof callback == "function")
      $timeout(function () {
        callback();
      }, 600);
  };

  self.miniFormatMenu = false;

  self.getMiniFormatMenu = function () {
    return self.miniFormatMenu;
  };

  self.setMiniFormatMenu = function (stato) {
    self.miniFormatMenu = stato;
  };

  self.miniFormatMenuOpen = false;

  self.getMiniFormatMenuOpen = function () {
    return self.miniFormatMenuOpen;
  };

  self.setMiniFormatMenuOpen = function (stato) {
    self.miniFormatMenuOpen = stato;
  };

  /**
   *
   * upgrade acconto saldo
   *
   */
  self.getDate = function (date) {
    if (!date) return;
    if (date instanceof Date) return date;

    return new Date(date.replace(/-/g, "/"));
  };

  self.keyCookieAuthTravel = "authTravelerWrd";
  self.keyCookieAuthTravelRedirect = "authTravelerRedirectWrd";
  self.keyCookieBookingData = "wrd_booking_data";

  self.checkAuthTraveler = function (state, params) {
    var deferred = $q.defer();
    var c = $cookies.getObject(self.keyCookieAuthTravel);
    if (c !== undefined) {
      $cookies.remove(self.keyCookieAuthTravelRedirect);
      deferred.resolve(c);
    } else {
      console.log(self.keyCookieAuthTravel, $cookies.getAll());
      $cookies.putObject(self.keyCookieAuthTravelRedirect, {
        go: state,
        params: params,
      });
      deferred.reject("reload_authTravel");
    }
    return deferred.promise;
  };

  self.bookingsForDashboard = function (attrs) {
    var deferred = $q.defer();
    var params, query;
    if (attrs) {
      params = attrs;
    } else {
      query = new self.Query();
      params = query.get();
    }
    $http
      .get(self.api("v1") + "bookings/dashboard", { params: params })
      .then(function (response) {
        if (!response.error) {
          deferred.resolve(response.data.data);
        } else deferred.reject();
      });
    return deferred.promise;
  };
}
