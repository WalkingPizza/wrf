/* globals angular, apiEndpoint, timestamp */

angular.module("viaggiApp").config(routePlatform);

function routePlatform($stateProvider, $httpProvider) {
  $httpProvider.interceptors.push(function (
    $q,
    $location,
    $window,
    $cookies,
    $injector
  ) {
    return {
      request: async function (config) {
        const $auth = $injector.get("$auth");
        const $http = $injector.get("$http");
        const $core = $injector.get("$core");
        const $cookies = $injector.get("$cookies");
        if (
          config.url.indexOf(apiEndpoint) !== -1 &&
          config.url.indexOf(apiEndpoint + "v1/token") === -1 &&
          config.url.indexOf(apiEndpoint + "v0/token") === -1
        ) {
          let localToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InJvbGVfaWQiOjk5OX0sImlhdCI6MTY2NjIyMDg3NywiZXhwIjoxNjY2MzA3Mjc3fQ.-_PXDtNrvIY1BqOggqKeVOtplvbKCcoqewOU93kaid4";
          try {
            await $http.post($core.api("v1") + "token/check", {
              token: localToken,
            });
          } catch (error) {
            if (
              $auth.getData() !== undefined &&
              $auth.getData().role_id < 999
            ) {
              localToken = await $http
                .post($core.api("v1") + "token/refresh", { token: localToken })
                .then((tokenResponse) => tokenResponse.data);
            } else {
              localToken = await $http
                .get($core.api("v1") + "token")
                .then((tokenResponse) => tokenResponse.data);
            }
            $auth.updateToken(localToken);
          }
          config.headers = config.headers || {};
          config.headers.Authorization = "Bearer " + localToken;
        }
        return config;
      },
    };
  });

  $stateProvider
    .state("app", {
      url: "",
      abstract: true,
      templateUrl: "models/core/views/base.view.html?k=" + timestamp,
      lazyLoad: function ($transition$) {
        return $transition$
          .injector()
          .get("$ocLazyLoad")
          .load([
            "models/core/directives/media.js?k=" + timestamp,
            "models/core/filters/common.js?k=" + timestamp,
            "models/core/directives/common.js?k=" + timestamp,
            "models/travel/filters/common.js?k=" + timestamp,
            "models/core/services/Setting.js?k=" + timestamp,
            "models/booking/services/Account.js?k=" + timestamp,
          ]);
      },
      resolve: {
        initApp: function ($core) {
          return $core.init();
        },
        userLogin: function (
          $core,
          $auth,
          $q,
          $timeout,
          $account,
          $state,
          $window
        ) {
          let deferred = $q.defer();

          console.log($auth, $auth.isValid, $auth.getData());

          if ($auth.isValid() === true) {
            if ($auth.getData().role_id && $auth.getData().role_id < 10) {
              $account
                .get($auth.getData().accountId)
                .then((accountResponse) => {
                  $core.userLogin = accountResponse;
                  $core.userLogin.Role.role_params = angular.fromJson(
                    $core.userLogin.Role.role_params
                  );
                  deferred.resolve($core.userLogin);
                })
                .catch((errorResponse) => {
                  $auth.removeToken();
                  $timeout(function () {
                    // $state.go('other.login')
                    $window.open(
                      `/login?ref=${$window.location.href}`,
                      "_self"
                    );
                  });
                  deferred.reject();
                });
            } else {
              $timeout(function () {
                // $state.go('other.login')
                $window.open(`/login?ref=${$window.location.href}`, "_self");
              });
            }
          } else {
            // $state.go('other.login')
            $window.open(`/login?ref=${$window.location.href}`, "_self");
          }
          return deferred.promise;
        },
      },
    })
    .state("app.report", {
      url: "/report",
      params: {
        section: "app.report",
      },
      controller: "reportCtrl",
      templateUrl: "views/report.view.html?k=" + timestamp,
      resolve: {
        checkInRole: function ($stateParams, userLogin, $state) {
          if ($stateParams.section) {
            if (!userLogin.Role.role_params[$stateParams.section].visibile) {
              $state.go("other.error");
            }
          }
        },
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "controllers/report.ctrl.js?k=" + timestamp,
          ]);
        },
        report: function (userLogin, $stateParams, $route) {
          return $route.getReport();
        },
      },
    })
    .state("app.prenotazioni", {
      url: "/prenotazioni",
      params: {
        section: "app.prenotazioni",
      },
      controller: "prenotazioniCtrl",
      templateUrl: "views/prenotazioni.view.html?k=" + timestamp,
      resolve: {
        checkInRole: function ($stateParams, userLogin, $state) {
          if ($stateParams.section) {
            if (!userLogin.Role.role_params[$stateParams.section].visibile) {
              $state.go("other.error");
            }
          }
        },
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "controllers/prenotazioni.ctrl.js?k=" + timestamp,
          ]);
        },
        prenotazioni: function (userLogin, $stateParams, $route, $core) {
          return $route.getPrenotazioni({
            withUtente: 1,
            limit: $core.listPagination,
            offset: 0,
          });
        },
      },
    })
    .state("app.prenotazione", {
      url: "/prenotazione/:prenotazione_id",
      params: {
        section: "app.prenotazioni",
      },
      controller: "prenotazioneCtrl",
      templateUrl: "views/prenotazione.view.html?k=" + timestamp,
      resolve: {
        checkInRole: function ($stateParams, userLogin, $state) {
          if ($stateParams.section) {
            if (!userLogin.Role.role_params[$stateParams.section].visibile) {
              $state.go("other.error");
            }
          }
        },
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "controllers/prenotazione.ctrl.js?k=" + timestamp,
          ]);
        },
        prenotazione: function (userLogin, $stateParams, $route) {
          return $route.getPrenotazioni({
            prenotazione_id: $stateParams.prenotazione_id,
          });
        },
        turno: function (userLogin, prenotazione, $stateParams, $route) {
          return $route.getTurni({ turno_id: prenotazione.data.turno_id });
        },
        viaggio: function (userLogin, turno, $stateParams, $route) {
          return $route.getViaggi({ viaggio_id: turno.data.viaggio_id });
        },
        viaggiatori: function (userLogin, $stateParams, $route) {
          return $route.getViaggiatori({
            prenotazione_id: $stateParams.prenotazione_id,
          });
        },
        transazioni: function (userLogin, $stateParams, $route) {
          return $route.getTransazioni({
            prenotazione_id: $stateParams.prenotazione_id,
          });
        },
      },
    })
    .state("app.viaggiatore", {
      url: "/prenotazione/:prenotazione_id/viaggiatore/:viaggiatore_id",
      params: {
        section: "app.prenotazioni",
      },
      controller: "viaggiatoreCtrl",
      templateUrl: "views/viaggiatore.view.html?k=" + timestamp,
      resolve: {
        checkInRole: function ($stateParams, userLogin, $state) {
          if ($stateParams.section) {
            if (!userLogin.Role.role_params[$stateParams.section].scrittura) {
              $state.go("other.error");
            }
          }
        },
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "controllers/viaggiatore.ctrl.js?k=" + timestamp,
          ]);
        },
        viaggiatore: function (userLogin, $stateParams, $route) {
          return $route.getViaggiatori({
            viaggiatore_id: $stateParams.viaggiatore_id,
            extra: true,
          });
        },
        prenotazione: function (userLogin, $stateParams, $route, viaggiatore) {
          return $route.getPrenotazioni({
            prenotazione_id: $stateParams.prenotazione_id,
          });
        },
      },
    })
    .state("app.viaggiatoreUtente", {
      url: "/utente/:utente_id/viaggiatore/:viaggiatore_id",
      params: {
        section: "app.utenti",
      },
      controller: "viaggiatoreCtrl",
      templateUrl: "views/viaggiatore.view.html?k=" + timestamp,
      resolve: {
        checkInRole: function ($stateParams, userLogin, $state) {
          if ($stateParams.section) {
            if (!userLogin.Role.role_params[$stateParams.section].scrittura) {
              $state.go("other.error");
            }
          }
        },
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "controllers/viaggiatore.ctrl.js?k=" + timestamp,
          ]);
        },
        viaggiatore: function (userLogin, $stateParams, $route) {
          return $route.getViaggiatori({
            viaggiatore_id: $stateParams.viaggiatore_id,
            extra: true,
          });
        },
        prenotazione: function (userLogin, $stateParams, $route, viaggiatore) {
          return $route.getPrenotazioni({
            prenotazione_id: viaggiatore.data.prenotazione_id,
          });
        },
      },
    })
    .state("app.fatture", {
      url: "/fatture",
      controller: "fattureCtrl",
      templateUrl: "views/fatture.view.html?k=" + timestamp,
      resolve: {
        checkInRole: function ($stateParams, userLogin, $state) {
          if ($stateParams.section) {
            if (!userLogin.Role.role_params[$stateParams.section].visibile) {
              $state.go("other.error");
            }
          }
        },
        prenotazioni: function (userLogin, $route) {
          return $route.getPrenotazioni({
            limit: 50,
            offset: 0,
            invoice: true,
          });
        },
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "controllers/fatture.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.transazione", {
      url: "/prenotazione/:prenotazione_id/transazione/:transazione_id",
      controller: "transazioneCtrl",
      params: {
        section: "app.transazioni",
        from_prenotazione: false,
      },
      templateUrl: "views/transazione.view.html?k=" + timestamp,
      resolve: {
        checkInRole: function ($stateParams, userLogin, $state) {
          if ($stateParams.section) {
            if (!userLogin.Role.role_params[$stateParams.section].scrittura) {
              $state.go("other.error");
            }
          }
        },
        transazione: function (userLogin, $stateParams, $route) {
          return $route.getTransazioni({
            transazione_id: $stateParams.transazione_id,
          });
        },
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "controllers/transazione.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.utenti", {
      url: "/utenti",
      params: {
        section: "app.utenti",
      },
      controller: "utentiCtrl",
      templateUrl: "views/utenti.view.html?k=" + timestamp,
      resolve: {
        checkInRole: function ($stateParams, userLogin, $state) {
          if ($stateParams.section) {
            if (!userLogin.Role.role_params[$stateParams.section].visibile) {
              $state.go("other.error");
            }
          }
        },
        utenti: function (userLogin, $stateParams, $route, $core) {
          return $route.getUtenti({ limit: $core.listPagination, offset: 0 });
        },
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "controllers/utenti.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.utente", {
      url: "/utente/:utente_id",
      params: {
        section: "app.utenti",
      },
      controller: "utenteCtrl",
      templateUrl: "views/utente.view.html?k=" + timestamp,
      resolve: {
        checkInRole: function ($stateParams, userLogin, $state) {
          if ($stateParams.section) {
            if (!userLogin.Role.role_params[$stateParams.section].scrittura) {
              $state.go("other.error");
            }
          }
        },
        utente: function (userLogin, $stateParams, $route) {
          return $route.getUtenti({
            utente_id: $stateParams.utente_id,
            extra: true,
          });
        },
        viaggiatori: function (userLogin, $stateParams, $route) {
          return $route.getViaggiatori({ utente_id: $stateParams.utente_id });
        },
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "controllers/utente.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    /* .state('app.settings', {
      url: '/settings',
      params: {
        section : 'app.settings'
      },
      controller: 'settingsCtrl',
      templateUrl: 'views/settings.view.html?k=' + timestamp,
      resolve: {
        checkInRole: function($stateParams,userLogin,$state){
          if ( $stateParams.section ) {
            if ( !userLogin.Role.role_params[$stateParams.section].visibile ) {
              $state.go("other.error");
              ;
            }
          }
        },
        loadMyCtrl: function ( $ocLazyLoad) {
          return $ocLazyLoad.load([
            'controllers/settings.ctrl.js?k=' + timestamp
          ]);
        }
      }
    }) */
    .state("app.impostazioni", {
      url: "/impostazioni",
      params: {
        section: "app.impostazioni",
      },
      controller: "impostazioniCtrl",
      templateUrl: "views/impostazioni.view.html?k=" + timestamp,
      resolve: {
        checkInRole: function ($stateParams, userLogin, $state) {
          if ($stateParams.section) {
            if (!userLogin.Role.role_params[$stateParams.section].visibile) {
              $state.go("other.error");
            }
          }
        },
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "controllers/impostazioni.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("other", {
      url: "",
      abstract: true,
      template: "<ui-view/>",
    })
    .state("other.login", {
      url: "/login",
      controller: "loginCtrl",
      templateUrl: "models/core/views/login.view.html?k=" + timestamp,
      resolve: {
        files: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/services/Account.js?k=" + timestamp,
            "models/core/controllers/login.ctrl.js?k=" + timestamp,
          ]);
        },
        initApp: function (files, $core) {
          return $core.init();
        },
      },
    })
    .state("other.error", {
      url: "/errore",
      templateUrl: "views/404.view.html?k=" + timestamp,
    })
    .state("app.reportTurni", {
      url: "/report-turni",
      controller: "reportTurniCtrl",
      params: {
        section: "app.report",
        report: "turni",
      },
      templateUrl: "views/report/report.view.html?k=" + timestamp,
      resolve: {
        checkInRole: function ($stateParams, userLogin, $state) {
          if ($stateParams.section) {
            if (!userLogin.Role.role_params[$stateParams.section].visibile) {
              $state.go("other.error");
            }
          }
        },
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "controllers/report.ctrl.js?k=" + timestamp,
          ]);
        },
        items: function (userLogin, $route, $core) {
          return $route.getReport({
            type: "turni",
            limit: $core.listPagination,
          });
        },
        viaggi: function (userLogin, $route, $core) {
          return $route.getViaggi({ viaggiato_attivo: 1 });
        },
      },
    })
    .state("app.reportPrenotazioni", {
      url: "/report-prenotazioni",
      controller: "reportTurniCtrl",
      params: {
        section: "app.report",
        report: "prenotazioni",
      },
      templateUrl: "views/report/report.view.html?k=" + timestamp,
      resolve: {
        checkInRole: function ($stateParams, userLogin, $state) {
          if ($stateParams.section) {
            if (!userLogin.Role.role_params[$stateParams.section].visibile) {
              $state.go("other.error");
            }
          }
        },
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "controllers/report.ctrl.js?k=" + timestamp,
          ]);
        },
        items: function (userLogin, $route, $core) {
          return $route.getReport({
            type: "prenotazioni",
            limit: $core.listPagination,
          });
        },
        viaggi: function (userLogin, $route, $core) {
          return $route.getViaggi({ viaggiato_attivo: 1 });
        },
      },
    })
    .state("app.botcache", {
      url: "/bot-cache",
      controller: "botCacheCtrl",
      templateUrl: "views/botcache.view.html?k=" + timestamp,
      resolve: {
        checkInRole: function ($stateParams, userLogin, $state) {
          if ($stateParams.section) {
            if (!userLogin.Role.role_params[$stateParams.section].visibile) {
              $state.go("other.error");
            }
          }
        },
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "controllers/botcache.ctrl.js?k=" + timestamp,
          ]);
        },
        urls: function (userLogin, $route) {
          return $route.getApi("getSitemap");
        },
      },
    })
    .state("app.travel.leads", {
      url: "/leads",
      controller: "leadsCtrl",
      templateUrl: "models/travel/views/leads.view.html?k=" + timestamp,
      params: {
        section: "app.leads",
        sectionItem: "leads",
        sectionPage: "Leads",
        sectionId: "leads",
      },
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/travel/controllers/leads.ctrl.js?k=" + timestamp,
          ]);
        },
        leads: function ($travel) {
          return $travel.leads();
        },
      },
    })
    .state("app.leadsNotifyme", {
      url: "/notifyme/:type/:identifier",
      controller: "notifymeCtrl",
      templateUrl: "models/travel/views/notifyme.view.html?k=" + timestamp,
      params: {
        section: "app.leads",
        sectionItem: "leads-notifyme",
        sectionPage: "Avvisami",
        sectionId: "leads-notifyme",
        type: "turns",
        identifier: {
          value: null,
          squash: true,
        },
      },
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/travel/controllers/notifyme.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.core", {
      url: "",
      abstract: true,
      template:
        "<div class='inner-child-page' layout='column' flex ui-view/></div>",
      resolve: {},
    })
    .state("app.core.dashboard", {
      url: "/",
      params: {
        section: "app.dashboard",
        sectionItem: "dashboard",
        sectionPage: "Dashboard",
        sectionId: "dashboard",
      },
      controller: "dashboardCtrl as dashboard",
      templateUrl: "models/core/views/dashboard.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load(
            "models/core/controllers/dashboard.ctrl.js?k=" + timestamp
          );
        },
        bookings: function (userLogin, $stateParams, $core) {
          return $core.bookingsForDashboard();
        },
      },
    })
    .state("app.core.media", {
      url: "/mediafiles",
      params: {
        section: "app.media",
        sectionItem: "media",
        sectionPage: "Media",
        sectionId: "media",
      },
      controller: "mediaCtrl",
      templateUrl: "models/core/views/media.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/core/controllers/media.ctrl.js?k=" + timestamp,
          ]);
        },
        media: function (userLogin, $stateParams, $route) {
          return $route.getMedia();
        },
      },
    })
    .state("app.core.settings", {
      url: "/settings",
      abstract: true,
      template:
        "<div class='inner-child-page' layout='column' flex ui-view/></div>",
      resolve: {},
    })
    .state("app.core.settings.index", {
      url: "",
      params: {
        section: "app.settings",
        sectionItem: "settings",
        sectionPage: "Impostazioni",
        sectionId: "settings-index",
      },
      controller: "indexCtrl",
      templateUrl: "models/core/views/settings/index.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/core/controllers/settings/index.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.core.settings.generali", {
      url: "/generali",
      params: {
        section: "app.settings",
        sectionItem: "settings",
        sectionPage: "Generali",
        sectionId: "settings-generali",
      },
      controller: "generaliCtrl",
      templateUrl:
        "models/core/views/settings/generali.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/core/controllers/settings/generali.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.core.settings.ruoli", {
      url: "/ruoli",
      params: {
        section: "app.settings",
        sectionItem: "settings",
        sectionPage: "Ruoli",
        sectionId: "settings-ruoli",
      },
      controller: "ruoliCtrl",
      templateUrl: "models/core/views/settings/ruoli.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/core/controllers/settings/ruoli.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.core.settings.sezioni", {
      url: "/sezioni",
      params: {
        section: "app.settings",
        sectionItem: "settings",
        sectionPage: "Sezioni",
        sectionId: "settings-sezioni",
      },
      controller: "sezioniCtrl",
      templateUrl:
        "models/core/views/settings/sezioni.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/core/controllers/settings/sezioni.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.core.settings.lingue", {
      url: "/lingue",
      params: {
        section: "app.settings",
        sectionItem: "settings",
        sectionPage: "Lingue",
        sectionId: "settings-lingue",
      },
      controller: "lingueCtrl",
      templateUrl: "models/core/views/settings/lingue.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/core/controllers/settings/lingue.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.core.settings.accountmeta", {
      url: "/account-meta",
      params: {
        section: "app.settings",
        sectionItem: "settings",
        sectionPage: "Gestione Campi Account",
        sectionId: "settings-account-meta",
      },
      controller: "accountMetaCtrl",
      templateUrl:
        "models/core/views/settings/account.meta.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/core/controllers/settings/account.meta.ctrl.js?k=" +
              timestamp,
          ]);
        },
        accountMeta: function ($core) {
          return $core.baseAccountMeta();
        },
      },
    })
    .state("app.core.settings.attributi", {
      url: "/attributi",
      controller: "contenutiAttributiCtrl",
      params: {
        section: "app.settings",
        sectionItem: "settings",
        sectionPage: "Gestione Attributi",
        sectionId: "settings-attributi",
      },
      templateUrl:
        "models/core/views/settings/attributi.view.html?k=" + timestamp,
      resolve: {
        checkInRole: function ($stateParams, userLogin, $state) {
          if ($stateParams.section) {
            if (!userLogin.Role.role_params[$stateParams.section].visibile) {
              $state.go("other.error");
            }
          }
        },
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/core/controllers/settings/attributi.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.travel", {
      url: "",
      abstract: true,
      template:
        "<div class='inner-child-page' layout='column' flex ui-view/></div>",
      resolve: {
        files: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/core/directives/media.js?k=" + timestamp,
            "models/travel/directives/staff.js?k=" + timestamp,
            "models/travel/services/Turn.js?k=" + timestamp,
            "models/travel/services/Scount.js?k=" + timestamp,
            "models/travel/services/Staff.js?k=" + timestamp,
            "models/travel/services/Travel.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.travel.viaggi", {
      url: "/viaggi",
      params: {
        section: "app.viaggi",
        sectionItem: "travels",
        sectionPage: "Viaggi",
        sectionId: "travels",
      },
      controller: "viaggiCtrl",
      templateUrl: "models/travel/views/viaggi.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/travel/controllers/viaggi.ctrl.js?k=" + timestamp,
          ]);
        },
        travels: function (files, $travel) {
          return $travel.all();
        },
      },
    })
    .state("app.travel.viaggio", {
      url: "/viaggi/:viaggio_id",
      params: {
        section: "app.viaggi",
        sectionItem: "travels",
        sectionPage: "Viaggio",
        sectionId: "travels",
      },
      controller: "viaggioCtrl",
      templateUrl: "models/travel/views/viaggio.view.html",
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/travel/controllers/viaggio.ctrl.js",
          ]);
        },
        viaggio: function (userLogin, $stateParams, $travel) {
          return $travel.get($stateParams.viaggio_id);
        },
        gruppiViaggio: function (userLogin, $stateParams, $route) {
          return $route.getGruppi(
            { viaggio_id: $stateParams.viaggio_id },
            true
          );
        },
        gruppi: function (userLogin, $stateParams, $route) {
          return $route.getGruppi();
        },
        relatedMedia: function (userLogin, $stateParams, $route, $q) {
          var deferred = $q.defer();
          $route
            .getRelatedImages({
              related_images_object_id: $stateParams.viaggio_id,
              related_images_object: "viaggio",
            })
            .then(
              function (responseGallery) {
                var related = {};
                if (responseGallery.error === false) {
                  responseGallery.data.filter(function (item) {
                    related[item.related_images_format] = item;
                  });
                }
                deferred.resolve(related);
              },
              function (errorGallery) {
                deferred.resolve({ data: [] });
              }
            );
          return deferred.promise;
        },
      },
    })
    .state("app.travel.viaggioGallery", {
      url: "/viaggi/:viaggio_id/gallery",
      params: {
        section: "app.viaggi",
        sectionItem: "travels",
        sectionPage: "Gallery Viaggio",
        sectionId: "travel",
      },
      controller: "viaggioGalleryCtrl",
      templateUrl: "models/travel/views/gallery.view.html",
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/travel/controllers/viaggio.gallery.ctrl.js",
          ]);
        },
        viaggio: function (userLogin, $stateParams, $route) {
          return $route.getViaggi({ viaggio_id: $stateParams.viaggio_id });
        },
        relatedMedia: function (userLogin, $stateParams, $route, $q) {
          var deferred = $q.defer();
          $route
            .getRelatedImages({
              related_images_object_id: $stateParams.viaggio_id,
              related_images_object: "viaggio",
            })
            .then(
              function (responseGallery) {
                if (responseGallery.error === false) {
                  var related = {};
                  responseGallery.data.filter(function (item) {
                    related[item.related_images_format] = item;
                  });
                  deferred.resolve(related);
                } else {
                  deferred.resolve({});
                }
              },
              function (errorGallery) {
                deferred.resolve({ data: [] });
              }
            );
          return deferred.promise;
        },
        gallery: function (userLogin, relatedMedia, $stateParams, $route, $q) {
          var deferred = $q.defer();
          if (relatedMedia && relatedMedia.gallery) {
            var ids = JSON.parse(relatedMedia.gallery.related_images_data);
            $route.getMedia({ media_id: ids }).then(function (response) {
              if (response.error === false) {
                var r = [];
                response.data.filter(function (media) {
                  var index = ids.indexOf(media.media_id);
                  if (index !== -1) {
                    r[index] = media;
                  }
                });
                deferred.resolve(r);
              } else {
                deferred.resolve({ data: [] });
              }
            });
          } else {
            deferred.resolve({ data: [] });
          }
          return deferred.promise;
        },
      },
    })
    .state("app.travel.viaggioItinerario", {
      url: "/viaggi/:viaggio_id/itinerario",
      params: {
        section: "app.viaggi",
        sectionItem: "travels",
        sectionPage: "Itinerario Viaggio",
        sectionId: "travel",
      },
      controller: "viaggioItinerarioCtrl",
      templateUrl: "models/travel/views/itinerario.view.html",
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/travel/controllers/viaggio.itinerario.ctrl.js",
          ]);
        },
        viaggio: function (userLogin, $stateParams, $route) {
          return $route.getViaggi({ viaggio_id: $stateParams.viaggio_id });
        },
        itinerari: function (userLogin, $stateParams, $route) {
          return $route.getItinerari({ viaggio_id: $stateParams.viaggio_id });
        },
        relatedMedia: function (userLogin, $stateParams, $route, $q) {
          var deferred = $q.defer();
          $route
            .getRelatedImages({
              related_images_object_id: $stateParams.viaggio_id,
              related_images_object: "viaggioItinerario",
            })
            .then(
              function (responseGallery) {
                if (responseGallery.error === false) {
                  var related = {};
                  responseGallery.data.filter(function (item) {
                    related[item.related_images_format] = item;
                  });
                  deferred.resolve(related);
                } else {
                  deferred.resolve({});
                }
              },
              function (errorGallery) {
                deferred.resolve({ data: [] });
              }
            );
          return deferred.promise;
        },
      },
    })
    // .state('app.travel.viaggioTurni', {
    //   url: '/viaggio/:viaggio_id/turni',
    //   params: {
    //     section: 'app.viaggi',
    //     sectionItem: 'travels',
    //     sectionPage: 'Turni Viaggio',
    //     sectionId: 'travel'
    //   },
    //   controller: 'viaggioTurniCtrl',
    //   templateUrl: 'models/travel/views/turni.view.html',
    //   resolve: {
    //     checkInRole: resolveCheckRole,
    //     loadMyCtrl: function ($ocLazyLoad) {
    //       return $ocLazyLoad.load([
    //         'models/travel/controllers/viaggio.turni.ctrl.js'
    //       ])
    //     },
    //     viaggio: function (userLogin, $stateParams, $travel) {
    //       return $travel.get($stateParams.viaggio_id)
    //     },
    //     turni: function (userLogin, viaggio, $stateParams, $turn) {
    //       return $turn.all({ filters: { viaggio: $stateParams.viaggio_id } })
    //     }
    //   }
    // })
    .state("app.travel.turno", {
      url: "/viaggio/:viaggio_id/turno/:turno_id",
      params: {
        section: "app.viaggi",
        sectionItem: "travels",
        sectionPage: "Turno Viaggio",
        sectionId: "travel",
      },
      controller: "turnoCtrl",
      templateUrl: "models/travel/views/turno.view.html?k=" + timestamp,
      lazyLoad: function ($transition$) {
        return $transition$
          .injector()
          .get("$ocLazyLoad")
          .load([
            "models/booking/services/Booking.js?k=" + timestamp,
            "models/travel/controllers/turno.ctrl.js?k=" + timestamp,
          ]);
      },
      resolve: {
        checkInRole: resolveCheckRole,
        turno: function (userLogin, $stateParams, $route) {
          return $route.getTurni({ turno_id: $stateParams.turno_id });
        },
        viaggio: function (userLogin, $stateParams, $route) {
          return $route.getViaggi({ turno_id: $stateParams.turno_id });
        },
        guide: function (userLogin, $stateParams, $route) {
          return $route.getGuide({ turno_id: $stateParams.turno_id }, true);
        },
        scontiTurno: function (userLogin, $stateParams, $route) {
          return $route.getSconti({ turno_id: $stateParams.turno_id }, true);
        },
        sconti: function (userLogin, $stateParams, $route) {
          return $route.getSconti();
        },
        bookings: function ($stateParams, $booking) {
          return $booking.all({
            limit: -1,
            filters: { turno_id: $stateParams.turno_id },
          });
        },
      },
    })
    .state("app.booking.promocodes", {
      url: "/promo-codes",
      params: {
        section: "app.promocodes",
        sectionItem: "promocodes",
        secionPage: "promocodes",
        secondId: "promocodes",
      },
      controller: "promoCodeCtrl as pc",
      templateUrl:
        "models/booking/views/promo-codes/list.view.html?k=" + timestamp,
      lazyLoad: function ($transition$) {
        return $transition$
          .injector()
          .get("$ocLazyLoad")
          .load([
            "models/booking/controllers/promoCode.ctrl.js?k=" + timestamp,
          ]);
      },
      resolve: {
        checkInRole: resolveCheckRole,
        promoCodes: function ($q, $http, $core) {
          let deferred = $q.defer();
          $http.get($core.api("v1") + "promocodes").then(function (response) {
            deferred.resolve(response.data);
          });
          return deferred.promise;
        },
      },
    })
    // .state('app.travel.sconti', {
    //   url: '/sconti',
    //   params: {
    //     section: 'app.sconti',
    //     sectionItem: 'sconti',
    //     sectionPage: 'Sconti',
    //     sectionId: 'sconti'
    //   },
    //   controller: 'scontiCtrl',
    //   templateUrl: 'models/travel/views/sconti.view.html?k=' + timestamp,
    //   resolve: {
    //     checkInRole: resolveCheckRole,
    //     loadMyCtrl: function ($ocLazyLoad) {
    //       return $ocLazyLoad.load([
    //         'models/travel/controllers/sconti.ctrl.js?k=' + timestamp
    //       ])
    //     },
    //     sconti: function (userLogin, $stateParams, $route) {
    //       return $route.getSconti()
    //     }
    //   }
    // })
    .state("app.travel.guide", {
      url: "/guide",
      params: {
        section: "app.guide",
        sectionItem: "guide",
        sectionPage: "Guide",
        sectionId: "guide",
      },
      controller: "guideCtrl",
      templateUrl: "models/travel/views/guide.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/travel/controllers/guide.ctrl.js?k=" + timestamp,
          ]);
        },
        items: function (userLogin, $stateParams, $route) {
          return $route.getGuide();
        },
      },
    })
    .state("app.travel.gruppi", {
      url: "/gruppi",
      params: {
        section: "app.guide",
        sectionItem: "gruppi",
        sectionPage: "Gruppi",
        sectionId: "gruppi",
      },
      controller: "guideCtrl",
      templateUrl: "models/travel/views/gruppi.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/travel/controllers/guide.ctrl.js?k=" + timestamp,
          ]);
        },
        items: function (userLogin, $stateParams, $route) {
          return $route.getGruppi();
        },
      },
    })
    .state("app.travel.guida", {
      url: "/guida/:guida_id",
      controller: "guidaCtrl",
      params: {
        section: "app.guide",
      },
      templateUrl: "models/travel/views/guida.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/travel/controllers/guida.ctrl.js?k=" + timestamp,
          ]);
        },
        guida: function (userLogin, $stateParams, $route) {
          return $route.getGuide({ guida_id: $stateParams.guida_id });
        },
        gruppi: function (userLogin, $stateParams, $route) {
          return $route.getGruppi({ guida_id: $stateParams.guida_id }, true);
        },
        turni: function (userLogin, $stateParams, $route) {
          return $route.getTurni({ guida_id: $stateParams.guida_id }, true);
        },
      },
    })
    .state("app.travel.gruppo", {
      url: "/gruppo/:gruppo_id",
      params: {
        section: "app.guide",
      },
      controller: "gruppoCtrl",
      templateUrl: "models/travel/views/gruppo.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/travel/controllers/gruppo.ctrl.js?k=" + timestamp,
          ]);
        },
        gruppo: function (userLogin, $stateParams, $route) {
          return $route.getGruppi({ gruppo_id: $stateParams.gruppo_id });
        },
        guide: function (userLogin, $stateParams, $route) {
          return $route.getGuide({ gruppo_id: $stateParams.gruppo_id });
        },
        viaggi: function (userLogin, $stateParams, $route) {
          return $route.getViaggi({ gruppo_id: $stateParams.gruppo_id });
        },
      },
    })
    .state("app.booking", {
      url: "",
      abstract: true,
      template:
        "<div class='inner-child-page' layout='column' flex ui-view/></div>",
      lazyLoad: function ($transition$) {
        return $transition$
          .injector()
          .get("$ocLazyLoad")
          .load([
            "models/travel/services/Turn.js?k=" + timestamp,
            "models/travel/services/Travel.js?k=" + timestamp,
            "models/booking/services/Refund.js?k=" + timestamp,
            "models/booking/services/Account.js?k=" + timestamp,
            "models/booking/services/Booking.js?k=" + timestamp,
            "models/booking/services/Transaction.js?k=" + timestamp,
            "models/booking/directives/common.js?k=" + timestamp,
            "models/booking/services/Traveler.js?k=" + timestamp,
          ]);
      },
      resolve: {
        refundBase: function ($refund) {
          return $refund.load();
        },
      },
    })
    .state("app.booking.newBooking", {
      url: "/nuova-prenotazine",
      params: {
        section: "app.prenotazioni",
        sectionItem: "new-booking",
        sectionPage: "Nuova prenotazione",
        sectionId: "new-booking",
      },
      controller: "newBookingCtrl",
      templateUrl: "models/booking/views/newBooking.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/newBooking.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.booking.requestCancellation", {
      url: "/richiesta-annullamento",
      params: {
        section: "app.prenotazioni",
        sectionItem: "request-cancellation",
        sectionPage: "Annullamento Prenotazione",
        sectionId: "request-cancellation",
      },
      controller: "requestCancellationCtrl",
      templateUrl:
        "models/booking/views/requestCancellation.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/requestCancellation.ctrl.js?k=" +
              timestamp,
          ]);
        },
      },
    })
    .state("app.booking.requestCancellationWithBooking", {
      url: "/richiesta-annullamento/:id",
      params: {
        section: "app.prenotazioni",
        sectionItem: "request-cancellation",
        sectionPage: "Annullamento Prenotazione",
        sectionId: "request-cancellation",
      },
      controller: "requestCancellationWithBookingCtrl",
      templateUrl:
        "models/booking/views/requestCancellationWithBooking.view.html?k=" +
        timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/requestCancellationWithBooking.ctrl.js?k=" +
              timestamp,
          ]);
        },
        booking: function ($booking, $stateParams) {
          return $booking.get($stateParams.id);
        },
      },
    })
    .state("app.booking.changeTravelers", {
      url: "/gestisci-viaggiatori",
      params: {
        section: "app.prenotazioni",
        sectionItem: "change-travelers",
        sectionPage: "Gestisci viaggiatori",
        sectionId: "change-travelers",
      },
      controller: "changeTravelersCtrl",
      templateUrl:
        "models/booking/views/changeTravelers.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/changeTravelers.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.booking.changeTravelersWithBooking", {
      url: "/gestisci-viaggiatori/:id",
      params: {
        section: "app.prenotazioni",
        sectionItem: "change-travelers",
        sectionPage: "Gestisci viaggiatori",
        sectionId: "change-travelers",
      },
      controller: "changeTravelersWithBookingCtrl",
      templateUrl:
        "models/booking/views/changeTravelersWithBooking.view.html?k=" +
        timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/changeTravelersWithBooking.ctrl.js?k=" +
              timestamp,
          ]);
        },
        booking: function ($booking, $stateParams) {
          return $booking.get($stateParams.id);
        },
        preview: function ($booking, $stateParams) {
          return $booking.previewAddTraveler($stateParams.id);
        },
      },
    })
    .state("app.booking.changeTravelersWithBookingItem", {
      url: "/gestisci-viaggiatori/:id/:traveler_id",
      params: {
        section: "app.prenotazioni",
        sectionItem: "change-travelers",
        sectionPage: "Gestisci viaggiatori",
        sectionId: "change-travelers",
      },
      controller: "changeTravelersWithBookingItemCtrl",
      templateUrl:
        "models/booking/views/changeTravelersWithBookingItem.view.html?k=" +
        timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/changeTravelersWithBookingItem.ctrl.js?k=" +
              timestamp,
          ]);
        },
        baseTravelerMeta: function ($core) {
          return $core.baseAccountMeta();
        },
        booking: function ($booking, $stateParams) {
          return $booking.get($stateParams.id);
        },
        preview: function ($booking, $stateParams, booking) {
          var traveler;
          booking.Travelers.filter(function (t) {
            if (parseInt(t.id) === parseInt($stateParams.traveler_id))
              traveler = t;
          });
          return $booking.previewCancellationTraveler($stateParams.id, {
            traveler: traveler,
          });
        },
      },
    })
    .state("app.booking.changeTurn", {
      url: "/cambio-turno",
      params: {
        section: "app.prenotazioni",
        sectionItem: "change-turn",
        sectionPage: "Cambio turno",
        sectionId: "change-turn",
      },
      controller: "changeTurnCtrl",
      templateUrl: "models/booking/views/changeTurn.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/changeTurn.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.booking.changeTurnWithBooking", {
      url: "/cambio-turno/:id",
      params: {
        section: "app.prenotazioni",
        sectionItem: "change-turn",
        sectionPage: "Cambio turno",
        sectionId: "change-turn",
      },
      controller: "changeTurnWithBookingCtrl",
      templateUrl:
        "models/booking/views/changeTurnWithBooking.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/changeTurnWithBooking.ctrl.js?k=" +
              timestamp,
          ]);
        },
        booking: function ($booking, $stateParams) {
          return $booking.get($stateParams.id);
        },
      },
    })
    .state("app.booking.changeTurnWithBookingNew", {
      url: "/cambio-turno/:id/:newTurn",
      params: {
        section: "app.prenotazioni",
        sectionItem: "change-turn",
        sectionPage: "Cambio turno",
        sectionId: "change-turn",
      },
      controller: "changeTurnWithBookingNewCtrl",
      templateUrl:
        "models/booking/views/changeTurnWithBookingNew.view.html?k=" +
        timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/changeTurnWithBookingNew.ctrl.js?k=" +
              timestamp,
          ]);
        },
        booking: function ($booking, $stateParams) {
          return $booking.get($stateParams.id);
        },
        turn: function ($turn, $stateParams) {
          return $turn.get($stateParams.newTurn);
        },
        preview: function ($booking, $stateParams) {
          return $booking.previewChangeTurn($stateParams.id, {
            turno_id: $stateParams.newTurn,
          });
        },
      },
    })
    .state("app.booking.invoices", {
      url: "/invoices",
      params: {
        section: "app.prenotazioni",
        sectionItem: "invoices",
        sectionPage: "Invoices",
        sectionId: "invoices",
      },
      controller: "invoicesCtrl",
      templateUrl: "models/booking/views/invoices.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/invoices.ctrl.js?k=" + timestamp,
          ]);
        },
        invoices: function (userLogin, $transaction) {
          return $transaction.invoices();
        },
      },
    })
    .state("app.booking.invoicesYear", {
      url: "/invoices/:year",
      params: {
        section: "app.prenotazioni",
        sectionItem: "invoices",
        sectionPage: "Invoices",
        sectionId: "invoices",
      },
      controller: "invoicesCtrl",
      templateUrl: "models/booking/views/invoices.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/invoices.ctrl.js?k=" + timestamp,
          ]);
        },
        invoices: function (userLogin, $transaction, $stateParams) {
          return $transaction.invoices({ year: $stateParams.year });
        },
      },
    })
    .state("app.booking.accounts", {
      url: "/accounts",
      params: {
        section: "app.prenotazioni",
        sectionItem: "accounts",
        sectionPage: "Accounts",
        sectionId: "accounts",
      },
      controller: "accountsCtrl",
      templateUrl: "models/booking/views/accounts.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/accounts.ctrl.js?k=" + timestamp,
          ]);
        },
        accounts: function (userLogin, $account) {
          return $account.all();
        },
      },
    })
    .state("app.booking.bookings", {
      url: "/bookings",
      params: {
        section: "app.prenotazioni",
        sectionItem: "bookings",
        sectionPage: "Bookings",
        sectionId: "bookings",
      },
      controller: "bookingsCtrl",
      templateUrl: "models/booking/views/bookings.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/bookings.ctrl.js?k=" + timestamp,
          ]);
        },
        bookings: function ($booking) {
          return $booking.all({ filters: { status: "COMPLETE" } });
        },
      },
    })
    .state("app.booking.report", {
      url: "/reports",
      params: {
        section: "app.prenotazioni",
        sectionItem: "report",
        sectionPage: "Report",
        sectionId: "report",
      },
      controller: "reportCtrl",
      templateUrl: "models/booking/views/report.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/report.ctrl.js?k=" + timestamp,
          ]);
        },
        bookings: function ($booking) {
          return $booking.report();
        },
      },
    })
    .state("app.booking.booking", {
      url: "/bookings/:id",
      params: {
        section: "app.prenotazioni",
        sectionItem: "bookings",
        sectionPage: "Booking",
        sectionId: "booking",
      },
      controller: "bookingCtrl",
      templateUrl: "models/booking/views/booking.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/booking.ctrl.js?k=" + timestamp,
          ]);
        },
        refund: function (userLogin, $refund) {
          return $refund.load();
        },
        booking: function (refund, $booking, $stateParams) {
          return $booking.get($stateParams.id);
        },
      },
    })
    .state("app.booking.account", {
      url: "/accounts/:id",
      params: {
        section: "app.prenotazioni",
        sectionItem: "accounts",
        sectionPage: "Account",
        sectionId: "account",
      },
      controller: "accountCtrl",
      templateUrl: "models/booking/views/account.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/booking/controllers/account.ctrl.js?k=" + timestamp,
          ]);
        },
        account: function ($account, $stateParams) {
          return $account.get($stateParams.id);
        },
        bookings: function ($account, account, $stateParams) {
          return $account.getBookings(account.id);
        },
        baseAccountMeta: function ($core) {
          return $core.baseAccountMeta();
        },
      },
    })
    .state("app.contents", {
      url: "",
      abstract: true,
      template:
        "<div class='inner-child-page' layout='column' flex ui-view/></div>",
      // lazyLoad: function ($transition$) {
      //   return $transition$.injector().get('$ocLazyLoad').load([
      //     'models/travel/services/Turn.js?k=' + timestamp
      //   ])
      // }
    })
    .state("app.contents.customPages", {
      url: "/custom-pages",
      params: {
        sectionItem: "customPages",
      },
      // controller: 'customPagesCtrl as custCtrl',
      templateUrl: "/views/custom-pages/list.html?k=" + timestamp,
      // lazyLoad: function ($transition$) {
      //   return $transition$.injector().get('$ocLazyLoad').load([
      //     'models/contents/controllers/custom-pages.ctrl.js?k=' + timestamp
      //   ])
      // }
    })
    .state("app.contents.customPages-new", {
      url: "/custom-pages/new",
      params: {
        sectionItem: "customPages",
      },
      // controller: 'customPagesCtrl as custCtrl',
      templateUrl: "/views/custom-pages/form.html?k=" + timestamp,
      // lazyLoad: function ($transition$) {
      //   return $transition$.injector().get('$ocLazyLoad').load([
      //     'models/contents/controllers/custom-pages.ctrl.js?k=' + timestamp
      //   ])
      // }
    })
    .state("app.contents.customPages-edit", {
      url: "/custom-pages/:id",
      params: {
        sectionItem: "customPages",
      },
      // controller: 'customPagesCtrl as custCtrl',
      templateUrl: "/views/custom-pages/form.html?k=" + timestamp,
      // lazyLoad: function ($transition$) {
      //   return $transition$.injector().get('$ocLazyLoad').load([
      //     'models/contents/controllers/custom-pages.ctrl.js?k=' + timestamp
      //   ])
      // }
    })
    .state("app.contents.menuHeader", {
      url: "/menu-header",
      params: {
        section: "app.menu",
        sectionItem: "menuHeader",
        sectionPage: "Menu Header",
        sectionId: "menu",
      },
      controller: "menuCtrl",
      templateUrl: "models/contents/views/menu.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/contents/controllers/menu.ctrl.js?k=" + timestamp,
          ]);
        },
        sitemap: function ($route) {
          return $route.getSitemap();
        },
        menuSetting: function ($core, $q, $http) {
          var deferred = $q.defer();
          const payload = JSON.stringify(
            JSON.stringify({
              filter: {
                setting_key: "menu_header",
              },
            })
          );
          $http
            .get($core.api("v2") + "graphql", {
              params: {
                query: `
                {
                  setting(json: ${payload}) {
                    setting_id
                    setting_value
                  }
                }
              `,
              },
            })
            .then(function (response) {
              deferred.resolve(response.data.data.setting[0]);
            })
            .catch(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        },
      },
    })
    .state("app.contents.menuFooter", {
      url: "/menu-footer",
      params: {
        section: "app.menu",
        sectionItem: "menuFooter",
        sectionPage: "Menu Footer",
        sectionId: "menu",
      },
      controller: "menuCtrl",
      templateUrl: "models/contents/views/menu.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/contents/controllers/menu.ctrl.js?k=" + timestamp,
          ]);
        },
        sitemap: function ($route) {
          return $route.getSitemap();
        },
        menuSetting: function ($core, $q, $http) {
          var deferred = $q.defer();
          const payload = JSON.stringify(
            JSON.stringify({
              filter: {
                setting_key: "menu_footer",
              },
            })
          );
          $http
            .get($core.api("v2") + "graphql", {
              params: {
                query: `
                {
                  setting(json: ${payload}) {
                    setting_id
                    setting_value
                  }
                }
              `,
              },
            })
            .then(function (response) {
              deferred.resolve(response.data.data.setting[0]);
            })
            .catch(function (error) {
              deferred.reject(error);
            });
          return deferred.promise;
        },
      },
    })
    .state("app.contents.mail", {
      url: "/contenuti-template-mail",
      controller: "contenutiMailCtrl",
      params: {
        section: "app.contenuti",
        sectionItem: "contentMail",
        sectionPage: "Contenuti Mail",
        sectionId: "mail",
      },
      templateUrl: "models/contents/views/mail.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/contents/controllers/mail.ctrl.js?k=" + timestamp,
          ]);
        },
        templates: function (userLogin, $route, $stateParams) {
          return $route.getMailTemplates();
        },
      },
    })
    .state("app.contents.homepage", {
      url: "/contenuti-homepage",
      controller: "contenutiHomepageCtrl",
      params: {
        section: "app.contenuti",
        sectionItem: "contentHomepage",
        sectionPage: "Contenuti Homepage",
        sectionId: "homepage",
      },
      templateUrl: "models/contents/views/homepage.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/contents/controllers/homepage.ctrl.js?k=" + timestamp,
          ]);
        },
        viaggi: function (userLogin, $stateParams, $route) {
          return $route.getViaggi({ viaggio_attivo: 1 });
        },
        turni: function (userLogin, $stateParams, $route) {
          return $route.getTurni({ turno_attivo: 1 });
        },
      },
    })
    .state("app.contents.faq", {
      url: "/contenuti-faq",
      controller: "contenutiFaqCtrl",
      params: {
        section: "app.contenuti",
        sectionItem: "contentFaq",
        sectionPage: "Contenuti Faq",
        sectionId: "faq",
      },
      templateUrl: "models/contents/views/faq.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/contents/controllers/faq.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.contents.seo", {
      url: "/contenuti-seo",
      params: {
        section: "app.contenuti",
        sectionItem: "contentSeo",
        sectionPage: "Contenuti Seo",
        sectionId: "seo",
      },
      controller: "seoCtrl",
      templateUrl: "models/contents/views/seo.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/contents/controllers/seo.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    })
    .state("app.contents.mood", {
      url: "/contenuti-mood",
      controller: "contenutiMoodCtrl",
      params: {
        section: "app.contenuti",
        sectionItem: "contentMood",
        sectionPage: "Contenuti Mood",
        sectionId: "mood",
      },
      templateUrl: "models/contents/views/mood.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/contents/controllers/mood.ctrl.js?k=" + timestamp,
          ]);
        },
        viaggi: function ($route) {
          return $route.getViaggi({ viaggio_attivo: 1 });
        },
      },
    })
    .state("app.contents.guide", {
      url: "/contenuti-guide",
      controller: "contenutiGuideCtrl",
      params: {
        section: "app.contenuti",
        sectionItem: "contentGuide",
        sectionPage: "Contenuti Guide",
        sectionId: "guide",
      },
      templateUrl: "models/contents/views/guide.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/contents/controllers/guide.ctrl.js?k=" + timestamp,
          ]);
        },
        relatedMedia: function (userLogin, $stateParams, $route, $q) {
          var deferred = $q.defer();
          $route
            .getRelatedImages({
              related_images_object_id: "guidePageCover",
              related_images_object: "contenuti",
            })
            .then(function (response) {
              if (response.error === false) {
                deferred.resolve(response.data[0]);
              } else {
                deferred.resolve({});
              }
            });
          return deferred.promise;
        },
      },
    })
    .state("app.contents.contatti", {
      url: "/contenuti-contatti",
      controller: "contenutiContattiCtrl",
      params: {
        section: "app.contenuti",
        sectionItem: "contentContatti",
        sectionPage: "Contenuti Contatti",
        sectionId: "contatti",
      },
      templateUrl: "models/contents/views/contatti.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/contents/controllers/contatti.ctrl.js?k=" + timestamp,
          ]);
        },
        relatedMedia: function (userLogin, $stateParams, $route, $q) {
          var deferred = $q.defer();
          $route
            .getRelatedImages({
              related_images_object_id: "contattiPageCover",
              related_images_object: "contenuti",
            })
            .then(function (response) {
              if (response.error === false) {
                deferred.resolve(response.data[0]);
              } else {
                deferred.resolve({});
              }
            });
          return deferred.promise;
        },
      },
    })
    .state("app.contents.posizioniAperte", {
      url: "/contenuti-posizioni-aperte",
      controller: "contenutiPosizioniAperteCtrl",
      params: {
        section: "app.contenuti",
        sectionItem: "contentPosizioniAperte",
        sectionPage: "Contenuti Posizioni Aperte",
        sectionId: "posizioni-aperte",
      },
      templateUrl:
        "models/contents/views/posizioniAperte.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/contents/controllers/posizioniAperte.ctrl.js?k=" +
              timestamp,
          ]);
        },
        relatedMedia: function (userLogin, $stateParams, $route, $q) {
          var deferred = $q.defer();
          $route
            .getRelatedImages({
              related_images_object_id: "posizioniApertePageCover",
              related_images_object: "contenuti",
            })
            .then(function (response) {
              if (response.error === false) {
                deferred.resolve(response.data[0]);
              } else {
                deferred.resolve({});
              }
            });
          return deferred.promise;
        },
      },
    })
    .state("app.contents.comeFunziona", {
      url: "/contenuti-come-funziona",
      controller: "contenutiComefunzionaCtrl",
      params: {
        section: "app.contenuti",
        sectionItem: "contentComeFunziona",
        sectionPage: "Contenuti Come Funziona",
        sectionId: "come-funziona",
      },
      templateUrl:
        "models/contents/views/come-funziona.view.html?k=" + timestamp,
      resolve: {
        checkInRole: resolveCheckRole,
        loadMyCtrl: function ($ocLazyLoad) {
          return $ocLazyLoad.load([
            "models/contents/controllers/come-funziona.ctrl.js?k=" + timestamp,
          ]);
        },
      },
    });
}

function resolveCheckRole($stateParams, userLogin, $state, $q) {
  var deferred = $q.defer();
  if ($stateParams.section) {
    if (!userLogin.Role.role_params[$stateParams.section].visibile) {
      deferred.reject({ destination: "other.error" });
    } else {
      deferred.resolve();
    }
  } else {
    deferred.reject({ destination: "other.error" });
  }
  return deferred.promise;
}
