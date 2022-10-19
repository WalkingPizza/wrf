angular.module("viaggiApp").service("$api", service);

function service($http, $core, $cookies, $auth) {
  var api = this;
  api.callViaggi = "viaggi";
  api.callTurni = "turni";
  api.callSconti = "sconti";
  api.callGuide = "guide";
  api.callGruppi = "gruppi";
  api.callMedia = "mediafile";
  api.callPrenotazioni = "prenotazioni";
  api.callViaggiatori = "viaggiatori";
  api.callTransazioni = "transazioni";
  api.callUtenti = "utenti";
  api.callUtentiEmail = "utenti-email";
  api.callNotifiche = "notifiche";
  api.callRoles = "ruoli";
  api.callSettings = "settings";
  api.callDashboard = "dashboard";
  api.callReport = {
    turni: "report/turni",
    prenotazioni: "report/prenotazioni",
  };
  api.callItinerari = "itinerari";
  api.callGallery = "gallery";
  api.callRelatedImages = "related-images";
  api.callExtra = "accountextra";
  api.callMail = "mailer";
  api.callSlug = "slug";
  api.callPagine = "pagine";
  api.callUtentiCount = "utenti-count";
  api.callFatture = "fatture";
  api.callSitemap = "sitemap";
  api.callTemplateMail = "template-mail";
  api.callStripePk = "stripe/pk";
  api.callLead = {
    base: "leads",
    activate: "leads/activate",
    otp: "leads/otp",
  };
  api.callMailTemplates = "mail-templates";
  api.callNotifyme = "notifyme";

  api.endpoint = function () {
    if ($cookies.get($auth.getAuthCookieName())) {
      $http.defaults.headers.common["Authorization"] =
        "Bearer " + $cookies.get($auth.getAuthCookieName());
    }
    return $core.api();
  };

  api.getEndpoint = function () {
    if ($cookies.get($auth.getAuthCookieName())) {
      $http.defaults.headers.common["Authorization"] =
        "Bearer " + $cookies.get($auth.getAuthCookieName());
    }
    return "/api/v1/";
  };

  api.postNotifyme = function (data) {
    return $http.post($core.api("v1") + api.callNotifyme, data);
  };

  api.getNotifyme = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get($core.api("v1") + api.callNotifyme, { params: args });
  };

  api.deleteNotifyme = function (id) {
    return $http.delete($core.api("v1") + api.callNotifyme + "/" + id);
  };

  /**
   * Mail Templates
   *
   * @param params
   */
  api.getMailTemplates = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get($core.api("v1") + api.callMailTemplates, { params: args });
  };

  api.patchMailTemplates = function (id, data) {
    return $http.patch(
      $core.api("v1") + api.callMailTemplates + "/" + id,
      data
    );
  };

  /**
   * GET Newsletter data
   *
   * @param params
   */
  api.getNewsletter = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callNewsletter[params.type], {
      params: args,
    });
  };

  /**
   * Leads
   *
   * @param data
   */
  api.postLead = function (data) {
    return $http.post($core.api("v1") + api.callLead.base, data);
  };

  api.postLeadActivate = function (token) {
    return $http.post($core.api("v1") + api.callLead.activate + "/" + token);
  };

  api.postLeadOtp = function (data) {
    return $http.post($core.api("v1") + api.callLead.otp, data);
  };

  api.patchLead = function (id, data) {
    return $http.patch($core.api("v1") + api.callLead.base + "/" + id, data);
  };

  api.getLead = function (data) {
    return $http.get($core.api("v1") + api.callLead.base + "/" + data.user_id, {
      params: data,
    });
  };

  /**
   * GET Stripe Publishable Key
   */
  api.getStripePk = function () {
    return $http.get(api.endpoint() + api.callStripePk);
  };

  /**
   *
   * GET DASHBOARD
   *
   * @param params
   */
  api.getDashboard = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callDashboard, { params: args });
  };

  /**
   *
   * GET SITEMAP
   *
   */
  api.getSitemap = function () {
    return $http.get(api.endpoint() + api.callSitemap);
  };
  /**
   *
   * GET VIAGGI
   *
   */
  api.getViaggi = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callViaggi, { params: args });
  };

  /**
   *
   * GET VIAGGI LISTA
   *
   */
  api.getViaggiLista = function () {
    return $http.get(api.endpoint() + "viaggi/lista");
  };

  /**
   *
   * GET VIAGGIO
   *
   */
  api.getViaggio = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + "viaggi", { params: args });
  };

  /**
   * GET Itinerari singolo viaggio.
   *
   * @param itinerari
   * @returns {*}
   */
  api.getItinerari = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callItinerari, { params: args });
  };

  /**
   *
   * GET REPORT
   *
   * @param params
   */
  api.getReport = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callReport[params.type], {
      params: args,
    });
  };

  /**
   *
   * POST VIAGGIO
   *
   * @param params
   */
  api.postViaggio = function (viaggio) {
    return $http.post(api.endpoint() + api.callViaggi, viaggio);
  };

  /**
   *
   * GET SCONTI
   *
   * @param params
   */
  api.getSconti = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callSconti, { params: args });
  };

  /**
   *
   * POST SCONTO
   *
   * @param sconto
   */
  api.postSconto = function (sconto) {
    return $http.post(api.endpoint() + api.callSconti, sconto);
  };

  /**
   * DELETE sconto.
   *
   * @param sconto
   */
  api.delSconto = function (data) {
    return $http({
      method: "DELETE",
      url: api.endpoint() + api.callSconti,
      data: data,
    });
  };

  /**
   *
   *
   * GET TURNI
   *
   * @param params
   */
  api.getTurni = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callTurni, { params: args });
  };

  /**
   *
   *
   * POST TURNO
   *
   * @param turno
   */
  api.postTurno = function (turno) {
    return $http.post(api.endpoint() + api.callTurni, turno);
  };

  /**
   *
   * GET GRUPPI
   *
   * @param params
   */
  api.getGruppi = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callGruppi, { params: args });
  };

  /**
   *
   * POST GRUPPO
   *
   * @param params
   */
  api.postGruppo = function (args) {
    return $http.post(api.endpoint() + api.callGruppi, args);
  };

  /**
   *
   * GET GUIDE
   *
   * @param params
   */
  api.getGuide = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callGuide, { params: args });
  };

  /**
   * Delete Guida
   *
   * @param data
   * @returns {*}
   */
  api.delGuide = function (data) {
    return $http({
      method: "DELETE",
      url: api.endpoint() + api.callGuide,
      data: data,
    });
  };

  /**
   *
   * POST GRUIDA
   *
   * @param params
   */
  api.postGuida = function (args) {
    return $http.post(api.endpoint() + api.callGuide, args);
  };

  /**
   * GET Media.
   * @param params
   */
  api.getMedia = function (params) {
    var args = {
      limit: $core.listPagination,
      offset: 0,
    };
    if (angular.isDefined(params)) {
      if (angular.isDefined(params.media_id)) args = params;
      else angular.extend(args, params);
    }

    return $http.get(api.endpoint() + api.callMedia, { params: args });
  };

  /**
   * POST Media.
   *
   * @param data
   * @returns {*}
   */
  api.postMedia = function (data, progressEvent) {
    return $http({
      method: "POST",
      url: api.endpoint() + api.callMedia,
      data: data,
      transformRequest: angular.identity,
      uploadEventHandlers: {
        progress: function (e) {
          if (typeof progressEvent == "function") progressEvent(e);
        },
      },
      headers: {
        "Content-Type": undefined,
      },
    });
  };

  /**
   * DELETE Media.
   *
   * @param data
   */
  api.delMedia = function (data) {
    return $http({
      method: "DELETE",
      url: api.endpoint() + api.callMedia,
      data: data,
    });
  };

  /**
   *
   * POST PRENOTAZIONE
   *
   * @param prenotazione
   */
  api.postPrenotazione = function (prenotazione) {
    return $http.post(api.endpoint() + api.callPrenotazioni, prenotazione);
  };

  api.delPrenotazione = function (params) {
    return $http({
      method: "DELETE",
      url: api.endpoint() + api.callPrenotazioni,
      data: params,
    });
  };

  /**
   *
   *
   * GET PRENOTAZIONI
   *
   * @param params
   */
  api.getPrenotazioni = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callPrenotazioni, { params: args });
  };

  /**
   *
   *
   * GET VIAGGIATORI
   *
   * @param params
   */
  api.getViaggiatori = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callViaggiatori, { params: args });
  };

  api.getUtentiCount = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callUtentiCount, { params: args });
  };

  /**
   *
   * POST VIAGGIATORE
   *
   * @param viaggiatore
   */
  api.postViaggiatore = function (viaggiatore) {
    return $http.post(api.endpoint() + api.callViaggiatori, viaggiatore);
  };

  /**
   *
   * POST TRANSAZIONE
   *
   * @param transazione
   */
  api.postTransazione = function (transazione) {
    return $http.post(api.endpoint() + api.callTransazioni, transazione);
  };

  /**
   *
   *
   * GET TRANSAZIONI
   *
   * @param params
   */
  api.getTransazioni = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callTransazioni, { params: args });
  };

  /**
   * GET Utenti.
   *
   * @param params
   */
  api.getUtenti = function (params) {
    var args = {};
    if ($core.userLogin) args.inRole = $core.userLogin.role_id;
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callUtenti, { params: args });
  };

  /**
   * POST Utente.
   *
   * @param utente
   * @returns {*}
   */
  api.postUtente = function (utente) {
    return $http.post(api.endpoint() + api.callUtenti, utente);
  };
  api.postUtenteEmail = function (utente) {
    return $http.post(api.endpoint() + api.callUtentiEmail, utente);
  };

  api.postExtra = function (extra) {
    return $http.post(api.endpoint() + api.callExtra, extra);
  };

  /**
   * POST LOGIN BY TOKEN.
   *
   * @param token
   */
  api.postLoginByToken = function (token, type) {
    return $http.post(api.endpoint() + "login/token", {
      token: token,
      type: type,
    });
  };

  /**
   * POST LOGIN BY FORM.
   *
   * @param email
   * @param password
   */
  api.postLoginByForm = function (email, password, type) {
    return $http.post(api.endpoint() + "login/form", {
      email: email,
      password: password,
      type: type,
    });
  };

  /**
   * GET Notifiche.
   *
   * @param params
   */
  api.getNotifiche = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callNotifiche, { params: args });
  };

  /**
   * POST Notifiche.
   *
   * @param params
   */
  api.postNotifiche = function (notifiche) {
    return $http.post(api.endpoint() + api.callNotifiche, notifiche);
  };

  /**
   * POST ROLES.
   *
   * @param roles
   */
  api.postRoles = function (roles) {
    return $http.post(api.endpoint() + api.callRoles, roles);
  };

  /**
   * POST SETTINGS.
   *
   * @param settings
   */
  api.postSettings = function (settings) {
    return $http.post(api.endpoint() + api.callSettings, settings);
  };

  api.patchSettings = function (data) {
    return $http.patch($core.api("v1") + api.callSettings, data);
  };

  /**
   * GET Itinerari singolo viaggio.
   *
   * @param itinerari
   * @returns {*}
   */
  api.getItinerari = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callItinerari, { params: args });
  };

  /**
   * POST Itinerari
   *
   * @param params
   * @returns {*}
   */
  api.postItinerari = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.post(api.endpoint() + api.callItinerari, args);
  };

  api.delItinerari = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.delete(api.endpoint() + api.callItinerari, { params: args });
  };

  api.getRelatedImages = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callRelatedImages, { params: args });
  };

  api.postRelatedImages = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.post(api.endpoint() + api.callRelatedImages, args);
  };

  api.delRelatedImages = function (data) {
    return $http({
      method: "DELETE",
      url: api.endpoint() + api.callRelatedImages,
      data: data,
    });
  };

  /**
   *
   * mail
   */
  api.mailPrenotazioneAnnullata = function (params) {
    return $http.post(
      api.endpoint() + api.callMail + "/prenotazione/annullamento",
      params
    );
  };

  /**
   * Slug generator.
   *
   * @param params
   */
  api.getSlug = function (args) {
    return $http.get(api.endpoint() + api.callSlug, { params: args });
  };

  /**
   * GET pagine.
   *
   * @param params
   */
  api.getPagine = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.get(api.endpoint() + api.callPagine, { params: args });
  };

  /**
   * POST pagine.
   *
   * @param pagina
   */
  api.postPagina = function (pagina) {
    return $http.post(api.endpoint() + api.callPagine, pagina);
  };

  api.getInvoiceNumber = function (year) {
    return $http.post(api.endpoint() + api.callFatture + "/lastnumber", {
      invoice_year: year,
    });
  };

  /**
   * DELETE viaggiatori
   *
   * @param params
   * @returns {*|boolean|Promise<boolean>|void|IDBRequest}
   */
  api.delViaggiatori = function (params) {
    var args = {};
    if (angular.isDefined(params)) angular.extend(args, params);
    return $http.delete(api.endpoint() + api.callViaggiatori, { params: args });
  };

  /*******************************************************************************************************************
   *
   * VESION 1
   *
   ******************************************************************************************************************/
  api.getSettingById = function (id) {
    return $http.get(api.getEndpoint() + "settings/id/" + id);
  };
  api.getSettingByKeys = function (keys) {
    return $http.get(api.getEndpoint() + "settings/keys", {
      params: { keys: keys },
    });
  };

  api.getTravel = function (params) {
    return $http.get(api.getEndpoint() + "travels", { params: params });
  };

  api.getTurn = function (params) {
    return $http.get(api.getEndpoint() + "turns", { params: params });
  };

  api.getAccount = function (params) {
    return $http.get(api.getEndpoint() + "accounts", { params: params });
  };

  api.getBookings = function (params) {
    return $http.get(api.getEndpoint() + "bookings", { params: params });
  };

  api.getBooking = function (id, params) {
    return $http.get(api.getEndpoint() + "bookings/" + id, { params: params });
  };

  api.postBooking = function (params) {
    return $http.post(api.getEndpoint() + "bookings", params);
  };

  api.postAccount = function (params) {
    return $http.post(api.getEndpoint() + "accounts", params);
  };

  api.getPidwidgeonActiveAccounts = function () {
    return $http.get("https://pidwidgeon.weroad.it/accounts/getActiveAccounts");
  };
}
