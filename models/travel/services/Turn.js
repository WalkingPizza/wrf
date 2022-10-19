angular.module("viaggiApp").service("$turn", service);

function service($http, $state, $q, $core, $injector) {
  var self = this;

  self.salvaTurno = function (turno) {
    var deferred = $q.defer();
    $api.postTurno(turno).then(function (response) {
      deferred.resolve(response);
    });
    return deferred.promise;
  };

  self.sqlWhereAttivo = function (stato) {
    return {
      field: "turno_attivo",
      compare: "=",
      value: "?",
      prepare: stato,
    };
  };

  self.tablePrintStatoTurno = function (turno) {
    var text, css;
    if (turno.turno_prenotato) {
      text = "CONFERMATO";
      css = "turno-confermato";
    } else if (turno.turno_annullato) {
      text = "ANNULLATO";
      css = "turno-annullato";
    } else if (turno.turno_attivo) {
      text = "ATTIVO";
      css = "turno-attivo";
    } else {
      text = "";
      css = "";
    }
    return {
      css: css,
      text: text,
    };
  };

  self.actionAnnullaTurno = function (turno, prenotazioni, transazioni) {
    var args = {
      turno: {
        turno_id: turno.turno_id,
        turno_annullato: 1,
      },
    };
    $api.postTurno(args).then(function (response) {
      if (!response.error) {
        turno.turno_annullato = 1;
      }
    });
    console.log(turno, prenotazioni, transazioni);
  };

  self.actionConfermaTurno = function (turno, bookings) {
    self
      .save({
        turno_id: turno.turno_id,
        turno_prenotato: true,
      })
      .then(function (t) {
        turno.turno_prenotato = true;

        //var $mail = $injector.get("$mail");
        //$mail.sendMail('CPR', bookings );
        /*


      $api.getNotifyme({turn_id: turno.turno_id}).then(function(response) {
          if (response.data.error === false) {
              var leads = response.data.data;
              var emails = [];
              var toDelete = [];
              for (var index in leads) {
                  var lead = leads[index];
                  emails.push({
                      to: lead.Lead.email,
                      params: {
                          turno_data_partenza: $filter('date')(turno.turno_data_partenza, 'dd/MM/yyyy'),
                          viaggio: turno._viaggio,
                          turno_link: $core.env().server.homeUrl + 'viaggi/' + turno._viaggio_slug + '/turno-' + turno.turno_id
                      }
                  });
                  toDelete.push(lead.id);
              }

              $mail.actionSend('NOTIFYME_CONFIRMED', emails).then(function() {
                  // Delete entries
                  toDelete.forEach(function(id) {
                      $api.deleteNotifyme(id);
                  });
              }).catch(function(err) {
                  console.log(err);
              })
          }
      });*/
      });
  };

  self.convertFomatDateString = function (date) {
    if (!date) return null;
    var output = date.getFullYear() + "-";
    output +=
      (date.getMonth() + 1 > 9
        ? date.getMonth() + 1
        : "0" + (date.getMonth() + 1)) + "-";
    output += date.getDate() > 9 ? date.getDate() : "0" + date.getDate();
    return output;
  };

  /**
   *
   * upgrade acconto e saldo
   *
   */
  self.labels = {
    state: {
      CONFERMATO: "Confermato",
      ATTIVO: "Attivo",
      ALMOST: "Almost Full",
      QUASI: "Quasi confermato",
      SOLDOUT: "Soldout",
      ANNULLATO: "Annullato",
      NA: "Non Disponibile",
      WAITING: "Waiting list",
    },
  };
  self.getState = function (turn) {
    var label;
    if (turn.turno_prenotato) {
      label = "CONFERMATO";
    } else if (turn.turno_annullato) {
      label = "ANNULLATO";
    } /*else if ( turn.turno_annullato ) {
            label = "WAITING";
        }*/ else if (turn.turno_soldout) {
      label = "SOLDOUT";
    } else if (turn.turno_full) {
      label = "ALMOST";
    } else if (turn.turno_quasi_confermato) {
      label = "QUASI";
    } else if (turn.turno_attivo) {
      label = "ATTIVO";
    } else {
      label = "NA";
    }
    return self.labels.state[label];
  };

  self.setPricesScounted = function (turns) {
    var result = !Array.isArray(turns) ? [turns] : turns;

    result.filter(function (turn) {
      if (turn.Scount) {
        var isScount = false;

        if (turn.Scount.sconto_tipo == "DATE") {
          var intervalStart = $core.getDate(turn.Scount.sconto_data_inizio),
            intervalEnd = $core.getDate(turn.Scount.sconto_data_fine),
            today = new Date();

          if (
            today.getTime() >= intervalStart.getTime() &&
            today.getTime() <= intervalEnd.getTime()
          )
            isScount = true;
        } else if (turn.Scount.sconto_tipo == "BEFORE") {
          var startTurn = $core.getDate(turn.turno_data_partenza),
            today = new Date();

          startTurn.setDate(
            startTurn.getDate() -
              turn.turno_giorni_max_prenotazione -
              turn.Scount.sconto_giorni
          );

          if (today.getTime() <= startTurn.getTime()) isScount = true;
        } else if (turn.Scount.sconto_tipo == "AFTER") {
          var startTurn = $core.getDate(turn.turno_data_partenza),
            today = new Date();

          startTurn.setDate(
            startTurn.getDate() -
              turn.turno_giorni_max_prenotazione -
              turn.Scount.sconto_giorni
          );

          if (today.getTime() >= startTurn.getTime()) isScount = true;
        } else {
          isScount = true;
        }

        if (isScount) {
          turn.turno_prezzo_scontato = parseInt(
            turn.turno_prezzo_base - turn.Scount.sconto_costo
          );
          turn.turno_sconto_label = turn.Scount.sconto_label;
        }
      } else {
        turn.turno_prezzo_scontato = turn.turno_prezzo_base;
      }
    });

    return !Array.isArray(turns) ? result[0] : result;
  };

  self.get = function (id, attrs) {
    var deferred = $q.defer();
    $http
      .get($core.api("v1") + "turns/" + id, { params: attrs })
      .then(function (response) {
        if (!response.error) {
          deferred.resolve(response.data.data);
        } else deferred.reject();
      });
    return deferred.promise;
  };

  self.all = function (attrs) {
    var deferred = $q.defer();
    var params, query;
    if (attrs) {
      params = attrs;
    } else {
      query = new $core.Query();
      params = query.get();
    }
    $http
      .get($core.api("v1") + "turns", { params: params })
      .then(function (response) {
        if (!response.error) {
          deferred.resolve(response.data.data);
        } else deferred.reject();
      });
    return deferred.promise;
  };

  self.save = function (data) {
    var deferred = $q.defer();
    $http
      .patch($core.api("v1") + "turns/" + data.turno_id, data)
      .then(function (response) {
        if (!response.error) {
          deferred.resolve(response.data.data);
        } else deferred.reject();
      });
    return deferred.promise;
  };

  self.add = function (items) {
    var deferred = $q.defer();
    $http.post($core.api("v1") + "turns", items).then(function (response) {
      if (!response.error) {
        deferred.resolve(response.data.data.id);
      } else deferred.reject();
    });
    return deferred.promise;
  };

  self.delete = function (id) {
    var deferred = $q.defer();
    $http.delete($core.api("v1") + "turns/" + id).then(function (response) {
      if (!response.error) {
        deferred.resolve();
      } else deferred.reject();
    });
    return deferred.promise;
  };
}
