angular.module("viaggiApp").service("$mail", service);

function service(
  $http,
  $core,
  $api,
  $q,
  $templateRequest,
  $compile,
  $timeout,
  $rootScope,
  $sce,
  $interpolate,
  $i18n
) {
  var mailer = this;

  mailer.initSettings = function () {
    mailer.endpoint = $core.api() + "mailer";
    mailer.params = $core.env().mailer.params;
    mailer.adminMail = $core.env().mailer.admin;
  };

  // mailer.sendMail = function (key, items) {
  //   var params = []
  //   if (key !== undefined) {
  //     switch (key) {
  //       case 'CPR':
  //         var promises = []
  //         angular.forEach(items, function (item) {
  //           var data = {
  //             prenotazione_data_creazione: item.createdAt,
  //             prenotazione_token: item.token,
  //             turno_data_partenza: item.Turn.turno_data_partenza,
  //             turno_data_ritorno: item.Turn.turno_data_ritorno,
  //             viaggiatori: item.Travelers,
  //             viaggio: item.Turn.Travel,
  //             // link_viaggio: $core.env().server.homeUrl + 'viaggi/' + item.Turn.Travel.viaggio_slug,
  //             link_viaggio: $i18n.getUrl('travels-travel', { travel: item.Turn.Travel.viaggio_slug }, $core.env().server.homeUrl),
  //             giorni: $core.getIntervalDate(new Date(item.Turn.turno_data_partenza), new Date(item.Turn.turno_data_ritorno)) + 1,
  //           }

  //           /*var deferred = $q.defer();
  //           promises.push( deferred.promise );

  //           $api.getViaggiatori({ extra: true, prenotazione_id: item.prenotazione_id }).then( function( response ){
  //               data.viaggiatori = response.data.data;

  //               $api.getViaggi({ viaggio_id: item.viaggio_id }).then(function( response ){
  //                   var viaggio = response.data.data;

  //                   data.viaggio = {
  //                       viaggio_destinazione: viaggio.viaggio_destinazione,
  //                       viaggio_label: viaggio.viaggio_label
  //                   };

  //                   data.link_viaggio = $core.env().server.homeUrl + 'viaggi/' + viaggio.viaggio_slug;

  //                   $api.getTransazioni({ prenotazione_id: item.prenotazione_id }).then(function( response ) {

  //                       var transazioni = response.data.data;

  //                       data.transazioni = transazioni;

  //                       angular.forEach( data.transazioni, function( transazione ) {
  //                           transazione.transazione_data_creazione = new Date( transazione.transazione_data_creazione * 1000 );
  //                       });

  //                       deferred.resolve();

  //                   });

  //               });

  //           });*/

  //           params.push({
  //             to: item.Account.email,
  //             params: data
  //           })

  //         })
  //         console.log(params)
  //         mailer.confermaPrenotazione(params)
  //         break

  //       case 'REG1':

  //         angular.forEach(items, function (item) {

  //           var link_attivazione = $core.env().server.homeUrl + 'attivazione/'
  //           link_attivazione += item.id + '/' + item.email

  //           item.link_attivazione = link_attivazione

  //           params.push({
  //             to: item.email,
  //             params: item
  //           })
  //         })

  //         mailer.registrazioneUtente(params)
  //         break

  //       case 'REG2':

  //         angular.forEach(items, function (item) {

  //           // Link profilo
  //           item.link_profilo = $core.env().server.homeUrl + 'my-experience'

  //           // Link viaggi
  //           item.link_viaggi = $core.env().server.homeUrl + 'viaggi'

  //           params.push({
  //             to: item.utente_email,
  //             params: item
  //           })

  //         })

  //         mailer.attivazioneUtente(params)
  //         break

  //       case 'PWD1':

  //         angular.forEach(items, function (item) {

  //           // Link resetta password
  //           item.link_password = $core.env().server.homeUrl + 'resetta-password/'
  //           item.link_password += item.utente_reset_password_token + '/'
  //           item.link_password += item.utente_email

  //           params.push({
  //             to: item.utente_email,
  //             params: item
  //           })

  //         })

  //         mailer.recuperaPassword(params)
  //         break

  //       case 'RPG1_1':
  //         angular.forEach(items, function (item) {

  //           // Link turno
  //           item.link_turno = $core.env().server.homeUrl + 'viaggi/' + item._viaggio_slug + '/' + 'prenotazione-turno-' + item.turno_id

  //           params.push({
  //             to: item._utente,
  //             params: item
  //           })

  //         })

  //         mailer.ricevutaPagamentoNonConf(params)
  //         break

  //       case 'RPG1_2':
  //         angular.forEach(items, function (item) {

  //           // Link profilo
  //           item.link_profilo = $core.env().server.homeUrl + 'my-experience/prenotazioni/'
  //           item.link_profilo += item.prenotazione_id

  //           params.push({
  //             to: item._utente,
  //             params: item
  //           })

  //         })

  //         mailer.ricevutaPagamentoConf(params)
  //         break

  //       case 'PBF1':

  //         angular.forEach(items, function (item) {

  //           params.push({
  //             to: item._utente,
  //             params: item
  //           })

  //         })

  //         mailer.pagamentoOkBonifico(params)
  //         break
  //       case 'LEADOTP':

  //         break
  //     }

  //   }

  // }

  // mailer.buildTemplate = function (mailKey, params) {
  //   var deferred = $q.defer()

  //   $templateRequest('/models/core/services/mail/' + $core.env().platform + '.html').then(function (skeleton) {

  //     $api.getMailTemplates({ mail_key: mailKey }).then(function (response) {
  //       if (response.data.error === false) {
  //         var template = response.data.data[0]
  //         var mailScope = $rootScope.$new()

  //         mailScope = angular.extend(mailScope, params)

  //         var body = $compile(template.mail_html)(mailScope)

  //         $timeout(function () {
  //           var html = $interpolate(skeleton)({ tbody: body[0].outerHTML })
  //           deferred.resolve({
  //             mail_oggetto: template.mail_oggetto,
  //             mail_html: html
  //           })
  //         })
  //       }
  //     })
  //     return
  //   })

  //   return deferred.promise
  // }

  // mailer.actionSend = function (mailKey, params) {
  //   var deferred = $q.defer()
  //   var sender = []
  //   if (!Array.isArray(params)) {
  //     sender.push(params)
  //   } else sender = params
  //   if (sender[0].to === undefined) {
  //     deferred.reject('Receiver not specified.')
  //   } else {
  //     var tot = sender.length
  //     var listSender = []
  //     var count = 0
  //     console.log(sender)
  //     sender.filter(function (item) {
  //       mailer.buildTemplate(mailKey, item.params).then(function (template) {
  //         var data = {
  //           html: template.mail_html,
  //           to: item.to,
  //           subject: template.mail_oggetto
  //         }

  //         listSender.push(data)
  //         count++
  //         if (count == tot) {
  //           $http.post(mailer.endpoint, { data: listSender }).then(function (response) {
  //             if (!response.err) deferred.resolve(response.data)
  //             else deferred.reject(response.err)
  //           }, function (err) {
  //             deferred.reject(err)
  //           })
  //         }
  //       })
  //     })
  //   }
  //   return deferred.promise
  // }

  // mailer.confermaPrenotazione = function (params) {
  //   return mailer.actionSend('CPR', params)
  // }

  // mailer.registrazioneUtente = function (params) {
  //   return mailer.actionSend('REG1', params)
  // }

  // mailer.attivazioneUtente = function (params) {
  //   return mailer.actionSend('REG2', params)
  // }

  // mailer.recuperaPassword = function (params) {
  //   return mailer.actionSend('PWD1', params)
  // }

  // mailer.pagamentoOkBonifico = function (params) {
  //   return mailer.actionSend('PBF1', params)
  // }

  // mailer.sollecitoBonifico = function (params) {
  //   return mailer.actionSend('PBF2', params)
  // }

  // mailer.ricevutaPagamentoNonConf = function (params) {
  //   return mailer.actionSend('RPG1_1', params)
  // }

  // mailer.ricevutaPagamentoConf = function (params) {
  //   return mailer.actionSend('RPG1_2', params)
  // }

  // mailer.annullaPrenotazione = function (params) {
  //   return mailer.actionSend('ANN3', params)
  // }
}
