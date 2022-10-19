angular.module("viaggiApp").service("$route", service);

function service(
  $q,
  $api,
  $core,
  $cookies,
  md5,
  $timeout,
  $state,
  $rootScope,
  $auth
) {
  var route = this;

  /**
   * Generic call API.
   *
   * @param call
   * @param params
   * @returns {Promise}
   */
  route.getApi = function (call, params) {
    var deferred = $q.defer();
    $api[call](params).then(function (response) {
      if (!response.data.error) deferred.resolve(response.data);
      else {
        $timeout(function () {
          $state.go("404");
          deferred.reject();
        });
      }
    });

    return deferred.promise;
  };

  route.getStripePk = function () {
    return route.getApi("getStripePk");
  };

  /**
   * /mail-tempalte endpoint.
   *
   * @param params
   * @param related
   * @returns {Promise}
   */
  route.getMailTemplates = function (params) {
    return route.getApi("getMailTemplates", params);
  };

  /**
   * /viaggi endpoint.
   *
   * @param params
   * @param related
   * @returns {Promise}
   */
  route.getReport = function (params) {
    return route.getApi("getReport", params);
  };

  /**
   * /viaggi/lista endpoint.
   *
   */
  route.getViaggiLista = function (params) {
    return route.getApi("getViaggiLista", params);
  };

  /**
   * /viaggi endpoint.
   *
   * @param params
   * @param related
   * @returns {Promise}
   */
  route.getViaggi = function (params) {
    return route.getApi("getViaggi", params);
  };

  /**
   * /viaggio endpoint.
   *
   */
  route.getViaggio = function (viaggio_id) {
    return route.getApi("getViaggio", viaggio_id);
  };

  /**
   * /dashboard endpoint.
   *
   * @param params
   * @param related
   * @returns {Promise}
   */
  route.getDashboard = function (params) {
    return route.getApi("getDashboard", params);
  };
  /**
   * /turni endpoint.
   *
   * @param params
   * @param related
   * @returns {Promise}
   */
  route.getTurni = function (params) {
    return route.getApi("getTurni", params);
  };

  /**
   * /sconti endpoint.
   *
   * @param params
   * @param related
   * @returns {Promise}
   */
  route.getSconti = function (params) {
    return route.getApi("getSconti", params);
  };

  /**
   * /guide endpoint.
   *
   * @param params
   * @param related
   * @returns {Promise}
   */
  route.getGuide = function (params) {
    return route.getApi("getGuide", params);
  };

  /**
   * /gruppi endpoint.
   *
   * @param params
   * @param related
   * @returns {Promise}
   */
  route.getGruppi = function (params) {
    return route.getApi("getGruppi", params);
  };

  /**
   * /prenotazioni endpoint.
   *
   * @param params
   * @param related
   * @returns {Promise}
   */
  route.getPrenotazioni = function (params) {
    return route.getApi("getPrenotazioni", params);
  };

  /**
   * /transazioni endpoint.
   *
   * @param params
   * @param related
   * @returns {Promise}
   */
  route.getTransazioni = function (params) {
    return route.getApi("getTransazioni", params);
  };

  /**
   * /viaggiatori endpoint.
   *
   * @param params
   * @param related
   * @returns {Promise}
   */
  route.getViaggiatori = function (params) {
    return route.getApi("getViaggiatori", params);
  };

  /**
   * /media endpoint.
   *
   * @param params
   * @returns {Promise}
   */
  route.getMedia = function (params) {
    return route.getApi("getMedia", params);
  };

  route.getRelatedImages = function (params) {
    return route.getApi("getRelatedImages", params);
  };

  /**
   * /utenti endpoint.
   *
   * @param params
   * @param related
   * @returns {Promise}
   */
  route.getUtenti = function (params) {
    return route.getApi("getUtenti", params);
  };

  route.getItinerari = function (params) {
    return route.getApi("getItinerari", params);
  };

  /**
   * GET pagine.
   *
   * @param params
   * @returns {Promise}
   */
  route.getPagine = function (params) {
    return route.getApi("getPagine", params);
  };

  /**
   * GET utenti-count
   *
   * @returns {Promise}
   */
  route.getUtentiCount = function (params) {
    return route.getApi("getUtentiCount", params);
  };

  /**
   * GET sitemap
   *
   * @returns {Promise}
   */
  route.getSitemap = function () {
    return route.getApi("getSitemap");
  };

  /**
   * Check for cookie set and skip login.
   */
  route.getNoLoginCms = function () {
    var cookie = $cookies.get("token_odg_viaggi_login");
    var dashboard = false;

    if (cookie) {
      $timeout(function () {
        $state.go("dashboard");
      });
    }
  };

  /**
   * User login route.
   *
   * @param section
   * @returns {Promise}
   */
  route.getLoginCms = function (section) {
    var deferred = $q.defer();

    if ($auth.isValid() === false || $auth.getData().role_id >= 100) {
      $state.go("other.login");
    } else {
      if ($core.userLogin) {
        deferred.resolve($core.userLogin);
      } else {
        $api
          .getUtenti({ utente_id: $auth.getData().utente_id })
          .then(function (utentiResponse) {
            if (utentiResponse.data.error === true) {
              $state.go("other.login");
              deferred.reject();
            } else {
              $core.userLogin = utentiResponse.data.data;
              $core.userLogin.role_params = angular.fromJson(
                $auth.getData().role_params
              );
              deferred.resolve($core.userLogin);
            }
          });
      }
    }

    return deferred.promise;
  };

  /**
   * Check user permissions section.
   *
   * @param section
   * @returns {boolean}
   */
  route.checkSectionInUser = function (section) {
    var go = true;
    if (!$core.userLogin.role_params[section]) {
      go = false;
    } else if (!$core.userLogin.role_params[section].visibile) {
      go = false;
    }
    return go;
  };

  /**
   * User login route.
   *
   * @param section
   * @returns {Promise}
   */
  route.getLoginSite = function (must) {
    var cookie = $cookies.get("token_odg_viaggi_login");

    var call = true;
    if (cookie) {
      if ($core.userLogin) {
        if ($core.userLogin.utente_token_login == cookie) {
          call = false;
        } else $cookies.remove("token_odg_viaggi_login");
      }

      if (call) {
        var deferred = $q.defer();
        $api.postLoginByToken(cookie, "utente_is_frontend").then(
          function (response) {
            if (response.data.error) {
              if (cookie) $cookies.remove("token_odg_viaggi_login");
              if (must) {
                $timeout(function () {
                  $state.go("home");
                  deferred.reject();
                });
              }
            } else {
              $core.userLogin = $core.buildParamsUserLogin(response.data.data);
              $rootScope.$emit("mlb:www:login");
              $timeout(function () {
                deferred.resolve(response.data.data);
              });
            }
          },
          function (error) {
            if (must) {
              $timeout(function () {
                $state.go("home");
                deferred.reject();
              });
            }
          }
        );
        return deferred.promise;
      }
    } else {
      if (must) {
        $timeout(function () {
          $state.go("home");
        });
      }
    }
  };
}
