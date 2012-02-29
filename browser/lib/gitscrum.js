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
                  "@data-label-name": "label.name"
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
                  "@data-repo-name": "repo.name"
                , ".js-name": function (v) {
                    return v.item.name.replace('<', '&lt;');
                  }
              }
          }
      }
    , assigneeDirective = {
          ".js-assignee": {
              "assignee<-": {
                  "@data-assignee-login": "assignee.login"
                , ".js-login": "assignee.login"
                , ".js-photo@src": "assignee.avatar_url"
              }
          }
      }
    , auth
    , githubOrg
    , issueTplFn
    , labelTplFn
    , repoTplFn
    , assigneeTplFn
    ;

  gitscrum.repos = [];
  gitscrum.issues = [];
  gitscrum.labels = [];
  gitscrum.assignees = [];

  function templateIssues() {
    var labelMap = {}
      , labelReduced = {}
      , assigneeMap = {}
      ;

    gitscrum.issues.forEach(function (issue) {
      if (issue.assignee) {
        assigneeMap[issue.assignee.login] = issue.assignee;
      }
      issue.labels.forEach(function (label) {
        labelMap[label.url.replace(/.*\/repos\//, '')] = label;
      });
    });

    Object.keys(assigneeMap).forEach(function (key) {
      gitscrum.assignees.push(assigneeMap[key]);
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
    pure("#js-assignees").render(gitscrum.assignees, assigneeTplFn);
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
    $('.js-issue').removeClass('hidden');
    filterBySearch();
    filterByLabel();
    filterByRepo();
    filterByAssignee();
  }

  function selectKeyword() {
    filterAll();
  }

  function escapeRegExp(str) {
    return str.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  function filterBySearch() {
    var keyword = $('#js-search-issues .js-keyword').val().trim()
      ;

    function hideClosed(issue) {
      if (issue.closed_at) {
        $('.js-issue[data-issue-id="' + issue.id + '"]').addClass('hidden');
      }
    }

    function matchesKeyword(issue) {
      if (!keyword.exec(issue.title) && !keyword.exec(issue.body)) {
        $('.js-issue[data-issue-id="' + issue.id + '"]').addClass('hidden');
      }
    }

    if (!keyword) {
      gitscrum.issues.forEach(hideClosed);
      return;
    }

    if ('/' === keyword[0] && '/' === keyword[keyword.length - 1]) {
      keyword = keyword.substr(1, keyword.length - 2);
    } else {
      keyword = escapeRegExp(keyword);
    }
    keyword = new RegExp(keyword, 'i');

    gitscrum.issues.forEach(matchesKeyword);
  }

  function filterByAssignee() {
    var assignees = []
      , selectedAssignees = $('.js-assignee[data-selected="selected"]')
      ;

    if (!selectedAssignees.length) {
      return;
    }

    selectedAssignees.forEach(function (el) {
      var login = $(el)[0].dataset.assigneeLogin;
      // TODO fix the bug causing the assignee name to be missing
      login = login || $(el).find('.js-login').text();
      assignees.push(login);
    });

    console.log('filterByAssigneeNames:', assignees);
    gitscrum.issues.forEach(function (issue) {
      var hasAssignee
        ;

      console.log(issue);
      hasAssignee = assignees.some(function (name) {
        var assignee = issue.assignee
          ;
        
        return assignee && (-1 !== assignees.indexOf(assignee.login));
      });

      if (!hasAssignee) {
        $('.js-issue[data-issue-id="' + issue.id + '"]').addClass('hidden');
      }
    });
  }

  function filterByRepo() {
    var repos = []
      , selectedRepos = $('.js-repo[data-selected="selected"]')
      ;

    if (!selectedRepos.length) {
      return;
    }

    selectedRepos.forEach(function (el) {
      var name = $(el)[0].dataset.repoName;
      // TODO fix the bug causing the repo name to be missing
      name = name || $(el).find('.js-name').text();
      repos.push(name);
    });

    console.log('filterByRepoNames:', repos);
    gitscrum.issues.forEach(function (issue) {
      var hasRepo
        ;

      console.log(issue);
      hasRepo = repos.some(function (name) {
        var repo = issue.url.match(/https:\/\/api\.github\.com\/repos\/(.*)\/(.*)\/issues\/(\d+)/)[2]
          ;
        
        return -1 !== repos.indexOf(repo);
      });

      if (!hasRepo) {
        $('.js-issue[data-issue-id="' + issue.id + '"]').addClass('hidden');
      }
    });
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

      if (!hasLabel) {
        $('.js-issue[data-issue-id="' + issue.id + '"]').addClass('hidden');
      }
    });
  }

  function selectLabel() {
    var label = $(this);
    if (!label[0].dataset.selected) {
      label.css('background-color', label.css('border-color'));
      label.css('border-color', '');
      label[0].dataset.selected = 'selected';
      label.find('.js-unselect').removeClass('hidden');
    } else {
      label.css('border-color', label.css('background-color'));
      label.css('background-color', '');
      label[0].dataset.selected = '';
      label.find('.js-unselect').addClass('hidden');
    }

    filterAll();
  }

  function selectAssignee() {
    var assignee = $(this)
      ;

    if (!assignee[0].dataset.selected) {
      assignee.css('background-color', '#ffef74');
      assignee.css('border-color', '');
      assignee[0].dataset.selected = 'selected';
      assignee.find('.js-unselect').removeClass('hidden');
    } else {
      assignee.css('border-color', '#ffef74');
      assignee.css('background-color', null);
      assignee[0].dataset.selected = '';
      assignee.find('.js-unselect').addClass('hidden');
    }

    filterAll();
  }

  function selectRepo() {
    var repo = $(this)
      ;

    if (!repo[0].dataset.selected) {
      repo.css('background-color', 'gray');
      repo.css('border-color', '');
      repo[0].dataset.selected = 'selected';
      repo.find('.js-unselect').removeClass('hidden');
    } else {
      repo.css('border-color', '');
      repo.css('background-color', null);
      repo[0].dataset.selected = '';
      repo.find('.js-unselect').addClass('hidden');
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
    $('#js-issues').html('');
    labelTplFn = pure("#js-labels").compile(labelDirective);
    $('#js-labels').html('');
    repoTplFn = pure("#js-repos").compile(repoDirective);
    $('#js-repos').html('');
    assigneeTplFn = pure("#js-assignees").compile(assigneeDirective);
    $('#js-assignees').html('');

    $('body').delegate('.js-label', 'click', selectLabel);
    $('body').delegate('.js-repo', 'click', selectRepo);
    $('body').delegate('.js-assignee', 'click', selectAssignee);
    $('body').delegate('.js-issue', 'click', showBody);
    $('body').delegate('form#js-search-issues', 'submit', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      selectKeyword();
    });
    $('body').delegate('#js-search-issues .js-keyword', 'keyup', selectKeyword);
    $('body').delegate('#js-login .js-cleardb', 'click', function (ev) {
      localStorage.clear();
    });
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
