$(function () {

  var m = {};
  var $grid = $('.grid');
  var $root = $('html');
  var uuid = 0;
  var grid = null;
  var per_page = 10;
  var num_pages = 1;
  var github_username = 'heiswayi';
  var access_token = '28f195998dcbc05cb979a122f15af35510ed4f05'; // access public repo only

  // $.ajax({
  //   type: 'GET',
  //   url: 'https://api.github.com/users/' + github_username + '?callback=?&access_token=28f195998dcbc05cb979a122f15af35510ed4f05',
  //   dataType:'jsonp',
  //   success: function(data) {
  //     //console.log(data);
  //     start();
  //   }
  // });

  // function start() {
  $.ajax({
    type: 'GET',
    //url: 'https://api.github.com/users/heiswayi/repos?callback=?&per_page=100',
    url: 'https://api.github.com/users/' + github_username + '?&access_token=' + access_token,
    dataType: 'json',
    success: function (data) {
      $('.total-repos').text(data.public_repos);
      if (data.public_repos > 0 && data.public_repos <= per_page) {
        $('.prev').addClass('is-disabled');
        $('.next').addClass('is-disabled');
        $('.pages').html('<a class="button is-dark page is-disabled"><i class="fa fa-bars" aria-hidden="true"></i><span class="page-num">1</span></a>');
      } else if (data.public_repos > per_page) {
        num_pages = Math.ceil(data.public_repos / per_page);
        generate_page_button(num_pages);
      }
      get_repos('https://api.github.com/users/' + github_username + '/repos?&per_page=' + per_page + '&access_token=' + access_token);
    }
  });
  // }

  function generate_page_button(num_pages) {
    var ret = [];
    for (var i = 0; i < num_pages; i++) {
      var is_current = i == 0 ? 'current-page is-disabled' : '';
      var button = $(' <a class="button is-dark page ' + is_current + '" data-page="' + (i + 1) + '"><i class="fa fa-bars" aria-hidden="true"></i><span class="page-num">' + (i + 1) + '</span></a>').get(0);
      ret.push(button);
    }
    $('.prev').addClass('is-disabled');
    $('.next').removeClass('is-disabled').attr('data-page', '2'); //next is page=2
    $('.pages').html(ret);
  }

  function get_repos(api) {
    $.ajax({
      type: 'GET',
      url: api,
      dataType: 'jsonp',
      success: function (data) {
        // console.log(data);
        init(data);
      }
    });
  }

  $(document).on("click", '.page', function(event) {
    var page = $(this).data('page');
    goto_page(page);
  });

  function goto_page(page) {
    var api = '';
    if (page == 1) {
      api = 'https://api.github.com/users/' + github_username + '/repos?&per_page=' + per_page + '&access_token=' + access_token;
      $('.prev').addClass('is-disabled');
      $('.page').removeClass('is-disabled').removeClass('current-page');
      $('.page').each(function() {
        if ($(this).data('page') == page) {
          $(this).addClass('current-page').addClass('is-disabled');
        }
      });
    }

    if (page == num_pages || page > num_pages) {
      api = 'https://api.github.com/users/' + github_username + '/repos?&per_page=' + per_page + '&page=' + num_pages + '&access_token=' + access_token;
      $('.next').addClass('is-disabled');
      $('.page').removeClass('is-disabled').removeClass('current-page');
      $('.page').each(function() {
        if ($(this).data('page') == page) {
          $(this).addClass('current-page').addClass('is-disabled');
        }
      });
    }

    if (page > 1 && page < num_pages) {
      api = 'https://api.github.com/users/' + github_username + '/repos?&per_page=' + per_page + '&page=' + page + '&access_token=' + access_token;
      $('.prev').removeClass('is-disabled').attr('data-page', (page - 1));
      $('.next').removeClass('is-disabled').attr('data-page', (page + 1));
      $('.page').removeClass('is-disabled').removeClass('current-page');
      $('.page').each(function() {
        if ($(this).data('page') == page) {
          $(this).addClass('current-page').addClass('is-disabled');
        }
      });
    }

    $('.grid').html('');
    m = {};
    $grid = $('.grid');
    $root = $('html');
    uuid = 0;
    grid = null;

    $.ajax({
      type: 'GET',
      url: api,
      dataType: 'jsonp',
      success: function (data) {
        //console.log(data);
        init(data);
      }
    });
  }

  function generateElements(data) {

    var repositories = data.data;
    repositories.sort(function(a, b) {
      var aFork = a.fork,
          bFork = b.fork;
      if (aFork && !bFork) return 1;
      if (!aFork && bFork) return -1;
      return new Date(b.pushed_at) - new Date(a.pushed_at);
    });

    var ret = [];

    for (var i = 0; i < repositories.length; i++) {

      var r = repositories[i];

      var id = ++uuid;
      var desc = r.description == null ? '' : r.description;
      var lang = r.language == null ? 'unknown' : r.language;
      var size = r.forks >= 100 ? 'is-6' : 'is-3';
      var isFork = r.fork == true ? '<i class="fa fa-code-fork" title="Forked repository"></i> ' : '<i class="fa fa-github-alt" aria-hidden="true"></i> ';
      var isRepo = r.fork == false ? 'repo' : 'forked';
      // var sizes = ['is-3', 'is-3', 'is-3', 'is-3', 'is-3', 'is-6', 'is-6', 'is-6'];
      // var randSizes = sizes[Math.floor(Math.random() * sizes.length)];

      var item = $('<a href="' + r.html_url + '" class="item column ' + size + '" title="Click to go to repository on GitHub...">' +
                     '<div class="item-content notification ' + isRepo + '">' +
                       '<span class="name">' + isFork + r.name + '</span>' +
                       '<span class="desc">' + desc + '</span>' +
                       '<span class="star" title="Number of watchers"><i class="fa fa-star" aria-hidden="true"></i> ' + r.watchers + '</span><span class="spacing-20"></span><span class="fork" title="Number of forks"><i class="fa fa-code-fork" aria-hidden="true"></i> ' + r.forks + '</span><span class="spacing-20"></span><span class="language" title="Major programming language"><i class="fa fa-code" aria-hidden="true"></i> ' + lang + '</span>' +
                     '</div>' +
                   '</a>').get(0);

      ret.push(item);

    }

    return ret;

  }

  function init(data) {

    if (!data || !data.data || !data.data.length) return;

    if (!grid) {

      var dragCounter = 0;

      grid = new Muuri({
        container: $grid.get(0),
        items: generateElements(data),
        dragEnabled: false,
        dragReleaseEasing: 'ease-in',
        dragContainer: document.body,
        layout: ["firstFit", {fillGaps: true}]
      });

      grid
      .on('dragstart', function () {
        ++dragCounter;
        $root.addClass('dragging');
      })
      .on('dragend', function () {
        if (--dragCounter < 1) {
          $root.removeClass('dragging');
        }
      });

    }

  }

});
