$(function () {

  var path_login = 'https://api.e-com.plus/v1/_login.json?username';
  var path_app_api = 'https://market.e-com.plus/ws/app/';
  var path_send_app = 'https://api.e-com.plus/v1/applications.json';

  var app_id = get_query_s()['app'];
  var redirect_uri;
  var storeId;
  var x_access_token;
  var my_id;
  var app;
  var btn_login = $('#request-login');
  var btn_accept = $('#btn-accept'); 
  var btn_cancel = $('#btn-cancel');
  var container_login = $('.container-login');
  var container_scope = $('.container-scope');
  
  btn_login.unbind('click').on('click', login);
  btn_accept.unbind('click').on('click', app_authentication);
  btn_cancel.unbind('click').on('click', app_cancel);

  function login() {
    is_valid();
    var u = $('#username').val();
    var p = $('#password').val();
    p = md_5(p);

    $.ajax({
      type: "POST",
      url: path_login,
      headers: {
        'X-Store-ID': 1
      },
      data: JSON.stringify({
        username: u,
        pass_md5_hash: p
      }),
      contentType: "application/json",
      dataType: 'json'
    }).done(function (json) {
      // keep store ID
      storeId = json.store_id
      // authenticate
      $.ajax({
        url: 'https://api.e-com.plus/v1/_authenticate.json',
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        headers: {
          'X-Store-ID': storeId
        },
        data: JSON.stringify({
          '_id': json._id,
          'api_key': json.api_key
        })
      }).done(auth_is_valid)
        .fail(auth_fail)
    }).fail(auth_fail);
  }

  function auth_is_valid(data) {

    my_id = data.my_id;
    x_access_token = data.access_token;

    $.get(path_app_api + app_id, function (res) {
      app = res;
      $('#title_main').text($('#title_main').text().replace("app_name", res.title));
      scope_list(res.auth_scope);
    });

    container_login.hide();
    container_scope.show();
  }

  function auth_fail(erro) {
    erro = erro.responseJSON;
    $('#erro').html('<span>' + erro.user_message.pt_br + '</span>').show()
  }

  function is_valid() {
    $('#erro').hide();
    if (!$('#username').val() || !$('#password').val()) {
      $('#erro').html('<span>Verifique os campos obrigatórios.</span>').show()
      return;
    }
  }

  function scope_list(scope) {
    var li = '';
    if (scope.applications) {
      li += '<li>Aplication - Criar, ler, atualizar e excluir aplicativos na loja.</li>';

    }
    if (scope.authentications) {
      li += '<li>Authentications - Criar, ler, atualizar e excluir usuários administradores na loja.</li>';

    }
    if (scope.brands) {
      li += '<li>Brands - Criar, ler, atualizar e excluir marcas de uma loja.</li>';

    }
    if (scope.carts) {
      li += '<li>Carts - Criar, ler, atualiza e excluir carrinhos de compras na loja.</li>';

    }
    if (scope.categories) {
      li += '<li>Categories - Criar, ler, atualiza e excluir Categories na loja.</li>';

    }
    if (scope.collections) {
      li += '<li>Collections - Criar, ler, atualiza e excluir grupos de produtos na loja.</li>';

    }
    if (scope.customers) {
      li += '<li>Customers - Criar, ler, atualiza e excluir clientes (usuários) na loja.</li>';

    }
    if (scope.grids) {
      li += '<li>Grid - Criar, ler, atualiza e excluir grid de produtos na loja.</li>';

    }
    if (scope.orders) {
      li += '<li>Orders - Criar, ler, atualiza e excluir pedidos de venda na loja.</li>';

    }
    if (scope.procedures) {
      li += '<li>Procedures - criar, ler, atualizar e excluir tarefas automáticas na loja.</li>';

    }
    if (scope.products) {
      li += '<li>Products - criar, ler, atualizar e excluir produtos da loja.</li>';

    }
    if (scope.regate) {
      li += '<li>Regate - Ler e atualizar as principais informações da loja.</li>';

    }
    if (scope.stores) {
      li += '<li>Stores - Ler e atualizar as principais informações da loja.</li>';

    }
    if (scope.triggers) {
      li += '<li>Triggers - Criar e var gatilhos de um comerciante.</li>';

    }
    $('#scope-list').append(li);
    return li;
  }

  function app_authentication(){
    if(app.redirect_uri){
      redirect_uri = app.redirect_uri
      delete app.redirect_uri
    }
    $.ajax({
      type: "POST",
      url: path_send_app,
      headers: {
        'X-Store-ID': storeId,
        'X-Access-Token': x_access_token,
        'X-My-Id': my_id
      },
      data: JSON.stringify(app),
      contentType: "application/json",
      dataType: 'json'
    }).done(function (json) {
      if(json._id){
        setTimeout(function(){
          var d = {
            x_store_id: storeId,
            x_token: x_access_token,
            my_id: my_id
          }

          var url = redirect_uri + '?x_store_id=' + storeId
          window.open(url, '_blank', 'location=yes,width=900,scrollbars=yes,status=yes');

        },1000);
      }
    }).fail(auth_fail);
  }

  function app_cancel(){

  }

});

function get_query_s(a) {
  a = a || window.location.search.substr(1).split('&').concat(window.location.hash.substr(1).split("&"));

  if (typeof a === "string")
    a = a.split("#").join("&").split("&");

  // se não há valores, retorna um objeto vazio
  if (!a) return {};

  var b = {};
  for (var i = 0; i < a.length; ++i) {
    // obtem array com chave/valor
    var p = a[i].split('=');

    // se não houver valor, ignora o parametro
    if (p.length != 2) continue;

    // adiciona a propriedade chave ao objeto de retorno
    // com o valor decodificado, substituindo `+` por ` `
    // para aceitar URLs codificadas com `+` ao invés de `%20`
    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
  }
  // retorna o objeto criado
  return b;
}

function md_5(d) { result = M(V(Y(X(d), 8 * d.length))); return result.toLowerCase() }; function M(d) { for (var _, m = "0123456789ABCDEF", f = "", r = 0; r < d.length; r++)_ = d.charCodeAt(r), f += m.charAt(_ >>> 4 & 15) + m.charAt(15 & _); return f } function X(d) { for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++)_[m] = 0; for (m = 0; m < 8 * d.length; m += 8)_[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32; return _ } function V(d) { for (var _ = "", m = 0; m < 32 * d.length; m += 8)_ += String.fromCharCode(d[m >> 5] >>> m % 32 & 255); return _ } function Y(d, _) { d[_ >> 5] |= 128 << _ % 32, d[14 + (_ + 64 >>> 9 << 4)] = _; for (var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0; n < d.length; n += 16) { var h = m, t = f, g = r, e = i; f = md5_ii(f = md5_ii(f = md5_ii(f = md5_ii(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_ff(f = md5_ff(f = md5_ff(f = md5_ff(f, r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 0], 7, -680876936), f, r, d[n + 1], 12, -389564586), m, f, d[n + 2], 17, 606105819), i, m, d[n + 3], 22, -1044525330), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 4], 7, -176418897), f, r, d[n + 5], 12, 1200080426), m, f, d[n + 6], 17, -1473231341), i, m, d[n + 7], 22, -45705983), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 8], 7, 1770035416), f, r, d[n + 9], 12, -1958414417), m, f, d[n + 10], 17, -42063), i, m, d[n + 11], 22, -1990404162), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 12], 7, 1804603682), f, r, d[n + 13], 12, -40341101), m, f, d[n + 14], 17, -1502002290), i, m, d[n + 15], 22, 1236535329), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 1], 5, -165796510), f, r, d[n + 6], 9, -1069501632), m, f, d[n + 11], 14, 643717713), i, m, d[n + 0], 20, -373897302), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691), f, r, d[n + 10], 9, 38016083), m, f, d[n + 15], 14, -660478335), i, m, d[n + 4], 20, -405537848), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438), f, r, d[n + 14], 9, -1019803690), m, f, d[n + 3], 14, -187363961), i, m, d[n + 8], 20, 1163531501), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467), f, r, d[n + 2], 9, -51403784), m, f, d[n + 7], 14, 1735328473), i, m, d[n + 12], 20, -1926607734), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 5], 4, -378558), f, r, d[n + 8], 11, -2022574463), m, f, d[n + 11], 16, 1839030562), i, m, d[n + 14], 23, -35309556), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060), f, r, d[n + 4], 11, 1272893353), m, f, d[n + 7], 16, -155497632), i, m, d[n + 10], 23, -1094730640), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174), f, r, d[n + 0], 11, -358537222), m, f, d[n + 3], 16, -722521979), i, m, d[n + 6], 23, 76029189), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487), f, r, d[n + 12], 11, -421815835), m, f, d[n + 15], 16, 530742520), i, m, d[n + 2], 23, -995338651), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844), f, r, d[n + 7], 10, 1126891415), m, f, d[n + 14], 15, -1416354905), i, m, d[n + 5], 21, -57434055), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571), f, r, d[n + 3], 10, -1894986606), m, f, d[n + 10], 15, -1051523), i, m, d[n + 1], 21, -2054922799), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359), f, r, d[n + 15], 10, -30611744), m, f, d[n + 6], 15, -1560198380), i, m, d[n + 13], 21, 1309151649), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070), f, r, d[n + 11], 10, -1120210379), m, f, d[n + 2], 15, 718787259), i, m, d[n + 9], 21, -343485551), m = safe_add(m, h), f = safe_add(f, t), r = safe_add(r, g), i = safe_add(i, e) } return Array(m, f, r, i) } function md5_cmn(d, _, m, f, r, i) { return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m) } function md5_ff(d, _, m, f, r, i, n) { return md5_cmn(_ & m | ~_ & f, d, _, r, i, n) } function md5_gg(d, _, m, f, r, i, n) { return md5_cmn(_ & f | m & ~f, d, _, r, i, n) } function md5_hh(d, _, m, f, r, i, n) { return md5_cmn(_ ^ m ^ f, d, _, r, i, n) } function md5_ii(d, _, m, f, r, i, n) { return md5_cmn(m ^ (_ | ~f), d, _, r, i, n) } function safe_add(d, _) { var m = (65535 & d) + (65535 & _); return (d >> 16) + (_ >> 16) + (m >> 16) << 16 | 65535 & m } function bit_rol(d, _) { return d << _ | d >>> 32 - _ }

if (get_query_s()) {
  $('#username').val(get_query_s()['username']);
}
