(function () {
  "use strict";

  var request = require('ahr2')
    , $ = require('ender')
    , localStorage = require('localStorage')
    , JsonStorage = require('json-storage')
    , store = JsonStorage(localStorage, 'gitscrum')
    , forEachAsync = require('forEachAsync')
    , pure = require('pure').$p
    , directive = {
          ".js-issue": {
              "issue<-": {
                  "@data-issue-id": "issue.id"
                , ".js-title": function (v) {
                    return v.item.title.replace('<', '&lt;');
                  }
                , ".js-link@href": "issue.html_url"
                , ".js-number": "issue.number"
                , ".js-body": function (v) {
                    return v.item.body.replace('<', '&lt;');
                  }
              }
          }
      }
    , auth
    , githubOrg
    , repos
    , allIssues = []
    , tfn
    ;

  function templateIssues() {
    pure("#js-issues").render(allIssues, tfn);
  }

  function getGithubRepoIssues(next, repo) {
    var url = "/repos/" + githubOrg + "/" + repo.name + "/issues?per_page=100"
      , issues = store.get(url)
      ;

    if (issues) {
      allIssues = allIssues.concat(issues);
      next();
      return;
    }

    function eatIssues(err, ahr, data) {
      console.log('issues for ' + repo.name + ':');
      console.log(data);
      allIssues = allIssues.concat(data);
      store.set(url, data);
      next();
    }

    request.get("https://" + auth  + "@api.github.com" + url).when(eatIssues);
  }

  function getGithubOrgIssues() {
    forEachAsync(repos, getGithubRepoIssues).then(templateIssues);
  }

  /*
  function getGithubOrgRepos() {
    var url = "/orgs/" + githubOrg + "/repos"
      ;

    request.get("https://" + auth  + "@api.github.com" + url)
      .when(function (err, ahr, data) {
        if (err) {
          console.log('error with issues');
          return;
        }
        console.log('organizational issues');
        console.log(data);

        getGithubOrgIssues();
      });
      ;
  }
  */

  function getGithubOrgRepos(user, pass) {
    var url = "/orgs/" + githubOrg + "/repos"
      ;

    function showLoginStatus(err, ahr, data) {
      if (err) {
        store.remove('user');
        store.remove('pass');
        store.remove('org');
        store.remove(url);
        alert('error with login');
        return;
      }

      store.set('user', user);
      store.set('pass', pass);
      store.set('org', githubOrg);

      repos = data;
      store.set(url, repos);

      getGithubOrgIssues();
    }

    repos = store.get(url);

    /*
    if (repos) {
      console.log(repos);
      getGithubOrgIssues();
      return;
    }
    */

    auth = user + ':' + pass;

    //request.get("https://" + auth  + "@api.github.com/users/" + user).when(showLoginStatus);
    request.get("https://" + auth  + "@api.github.com" + url)
      .when(showLoginStatus)
      ;
  }

  function showBody(ev) {
    console.log('el', this);
    var id = this.dataset.issueId
      ;

    console.log('issue-id', id);
    $("[data-issue-id=" + id + "]").find('.js-body').toggleClass('hidden');
  }

  function onDragStart() {
    $(this).addClass('drag-start');
    console.log('dragstart', this);
  }

  function onDragEnd() {
    $(this).removeClass('drag-start');
    console.log('dragend', this);
  }

  function onDragOver(ev) {
    ev.preventDefault(); // Necessary. Allows us to drop.
    //ev.stopPropagation();

    ev.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

    console.log('dragOver', this);
    return false;
  }

  function handleDragEnter(e) {
    // this / e.target is the current hover target.
    $(this).addClass('drag-enter');
    console.log('dragEnter', this);
  }

  function handleDragLeave(e) {
    // this / e.target is previous target element.
    $(this).removeClass('drag-enter');
    console.log('dragLeave', this);
  }

  function onDragOther() {
    // ignore
    console.log('dragOther', this);
  }

  function onDrop() {
  }

  function attachHandlers() {
    $('#js-login .js-user').val(store.get('user'))
    $('#js-login .js-pass').val(store.get('pass'));
    $('#js-login .js-org').val(store.get('org'))

    tfn = pure("#js-issues").compile(directive);

/*
    $('body').delegate('.js-issue', 'dragstart', onDragStart);
    $('body').delegate('.js-issue', 'dragenter', onDragOther);
    $('body').delegate('.js-issue', 'dragover', onDragOther);
    $('body').delegate('.js-issue', 'dragleave', onDragOther);
    $('body').delegate('.js-issue', 'dragend', onDragEnd);
    $('body').delegate('.js-issue', 'drop', onDrop);
*/
//    $('body').delegate('.js-issue', 'click', showBody);
    $('body').delegate('form#js-login', 'submit', function (ev) {
      ev.preventDefault();
      githubOrg = $('#js-login .js-org').val()
      getGithubOrgRepos(
          $('#js-login .js-user').val()
        , $('#js-login .js-pass').val()
      );
    });
  }

  $.domReady(attachHandlers);
}());
