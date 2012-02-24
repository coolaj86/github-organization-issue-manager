(function () {
  "use strict";

  var gitscrum = module.exports
    , request = require('ahr2')
    , $ = require('ender')
    , localStorage = require('localStorage')
    , JsonStorage = require('json-storage')
    , store = JsonStorage(localStorage, 'gitscrum')
    , forEachAsync = require('forEachAsync')
    , pure = require('pure').$p
    , issueDirective = {
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
    , labelDirective = {
          ".js-label": {
              "label<-": {
                  "@data-label-id": "label.name"
                , ".js-name": function (v) {
                    return v.item[0].name; //.name.replace('<', '&lt;');
                  }
                , "@style": function (v) {
                    return 'border-color: #' + v.item[0].color + ';';
                  }
              }
          }
      }
    , repoDirective = {
          ".js-repo": {
              "repo<-": {
                  "@data-label-id": "repo.name"
                , ".js-name": function (v) {
                    return v.item.name.replace('<', '&lt;');
                  }
              }
          }
      }
    , assigneeDirective = {
          ".js-assignee": {
              "assignee<-": {
                  "@data-assignee-id": "assignee.name"
                , ".js-name": function (v) {
                    return v.item.name.replace('<', '&lt;');
                  }
              }
          }
      }
    , auth
    , githubOrg
    , issueTplFn
    , labelTplFn
    , repoTplFn
    ;

  gitscrum.repos = [];
  gitscrum.issues = [];
  gitscrum.labels = [];

  function templateIssues() {
    var labelMap = {}
      , labelReduced = {}
      ;

    gitscrum.issues.forEach(function (issue) {
      issue.labels.forEach(function (label) {
        labelMap[label.url.replace(/.*\/repos\//, '')] = label;
      });
    });

    Object.keys(labelMap).forEach(function (key) {
      var val = labelMap[key]
        , name = val.name
        , label = labelReduced[name] || []
        ;

      labelReduced[name] = label;
      label.push(val);
    });
    Object.keys(labelReduced).forEach(function (key) {
      gitscrum.labels.push(labelReduced[key]);
    });

    pure("#js-issues").render(gitscrum.issues, issueTplFn);
    pure("#js-labels").render(gitscrum.labels, labelTplFn);
    pure("#js-repos").render(gitscrum.repos, repoTplFn);
  }

  function createOrgGetter(thingyName, thingyArr) {
    function getGithubRepoThings(next, repo) {
      var url = "/repos/" + githubOrg + "/" + repo.name + "/" + thingyName + "?per_page=100"
        , storedArr = store.get(url)
        ;

      // TODO needs expiry time
      if (storedArr) {
        storedArr.forEach(function (item) {
          thingyArr.push(item);
        });
        next();
        return;
      }

      function eatThingyArr(err, ahr, data) {
        if (err) {
          console.error(url);
          console.error(err);
        }
        console.log(thingyName + ' for ' + repo.name + ':');
        // preserving the original ref
        data.forEach(function (datum) {
          thingyArr.push(datum);
        });
        store.set(url, data);
        next();
      }

      request.get("https://" + auth  + "@api.github.com" + url).when(eatThingyArr);
    }

    return getGithubRepoThings;
  }

  function getGithubOrgLabels() {
    // forEachAsync(gitscrum.repos, getGithubRepoIssues).then(templateIssues);
  }

  function getGithubOrgIssues() {
    forEachAsync(gitscrum.repos, createOrgGetter('issues', gitscrum.issues)).then(templateIssues);
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

      gitscrum.repos = data;
      store.set(url, gitscrum.repos);

      getGithubOrgIssues();
    }

    gitscrum.repos = store.get(url);

    ///*
    if (gitscrum.repos && gitscrum.repos.length) {
      console.log(gitscrum.repos);
      getGithubOrgIssues();
      return;
    }
    //*/

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

  function filterAll() {
    $('.js-issue').show();
    filterBySearch();
    filterByLabel();
  }

  function filterBySearch() {
    if (true /* no search term given */) {
      gitscrum.issues.forEach(function (issue) {
        //console.log('filterBySearch');
        //console.log(issue.closed_at);
        if (issue.closed_at) {
          $('.js-issue[data-issue-id="' + issue.id + '"]').hide();
        }
      });
    }
  }

  function filterByLabel() {
    var labels = []
      , selectedLabels = $('.js-label[data-selected="selected"]')
      ;

    if (!selectedLabels.length) {
      return;
    }

    selectedLabels.forEach(function (el) {
      var name = $(el)[0].dataset.labelName;
      // TODO fix the bug causing the label name to be missing
      name = name || $(el).find('.js-name').text();
      // we know we don't have duplicate labels
      console.log(name);
      labels.push(name);
    });

    gitscrum.issues.forEach(function (issue) {
      var hasLabel
        ;

      hasLabel = issue.labels.some(function (label) {
        return -1 !== labels.indexOf(label.name);
      });

      // var id = $('.js-issue')[3].dataset.issueId
      // $('.js-issue[data-issue-id="' + id + '"]').hide();
      if (!hasLabel) {
        $('.js-issue[data-issue-id="' + issue.id + '"]').hide();
      }
    });
  }

  function selectLabel() {
    var label = $(this);
    if (!label[0].dataset.selected) {
      label.css('background-color', label.css('border-color'));
      label.css('border-color', '');
      label[0].dataset.selected = 'selected';
      label.find('.js-unselect').show();
    } else {
      label.css('border-color', label.css('background-color'));
      label.css('background-color', '');
      label[0].dataset.selected = '';
      label.find('.js-unselect').hide();
    }

    filterAll();
  }

  function attachHandlers() {
    console.log('filling in the blanks');
    $('#js-login .js-user').val(store.get('user'))
    $('#js-login .js-pass').val(store.get('pass'));
    $('#js-login .js-org').val(store.get('org'))
    console.log('filled in the blanks');

    issueTplFn = pure("#js-issues").compile(issueDirective);
    labelTplFn = pure("#js-labels").compile(labelDirective);
    repoTplFn = pure("#js-repos").compile(repoDirective);

    $('body').delegate('.js-label', 'click', selectLabel);
    $('body').delegate('.js-issue', 'click', showBody);
    $('body').delegate('form#js-login', 'submit', function (ev) {
      ev.preventDefault();

      var user = $('#js-login .js-user').val()
        , pass = $('#js-login .js-pass').val()
        ;

      githubOrg = $('#js-login .js-org').val()

      request.get("https://" + user  + ":" + pass + "@api.github.com/user").when(function () {
        getGithubOrgRepos(user, pass);
      });
    });
  }

  $.domReady(attachHandlers);
}());
