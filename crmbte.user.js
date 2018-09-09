// ==UserScript==
// @name        CRMBTE
// @namespace   jdostert
// @description Activity Monitor Better Than Ever
// @include     https://icp.wdf.sap.corp/sap/bc/webdynpro/sap/zs_wd_acm*
// @version     1.05
// @grant       none
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

//
//
function performHighlighting(jNode) {
  for (var i = 0; i <= 9; i++) {
    var storagename = 'nogo_editor_highlight_' + i;
    var pattern = localStorage.getItem(storagename);
    if (pattern && pattern.length > 0) {
      if (jNode.text().search(pattern) != - 1) {
        jNode.css('background', 'red');
        jNode.css('font-weight', 'bold');
        break;
      }
    }
  }
}

//
//
function performChangeActivityLink(jNode) {
  if (localStorage.getItem('nogo_activity_link_in_new_window') != 'checked') {
    return;
  }

  jNode.attr('target', '_blank');
}

//
//
function performChangeBCPLink(jNode) {
  if (localStorage.getItem('nogo_incident_link_to_main_system') != 'checked') {
    return;
  }

  var link = jNode.attr('href');
  link = link.replace(/bcpmain/i, 'support');
  jNode.attr('href', link);
  jNode.attr('target', '_blank');
}

//
//
function bte_settings() {
  var place4css = $('head');

  if ($(place4css).hasClass('nogo'));
  else {
    $(place4css).addClass('nogo');
    var style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('id', 'nogo-css');
    style.setAttribute('title', 'nogo-css');
    $(place4css).prepend(style);
    for (var c = 0; c < document.styleSheets.length; c++) {
      var sheet = document.styleSheets[c];
      if (sheet.title == 'nogo-css') {
        sheet.insertRule('#nogo-setting-frame { position:fixed; top:0; bottom:0; left:0; right:0; }', sheet.cssRules.length);
        sheet.insertRule('#nogo-settings-overlay { position: absolute; top:0; bottom:0; left:0; right:0; margin:0; padding:0; display:block; background-color:gray; z-index:12345; opacity:0.7; }', sheet.cssRules.length);
        sheet.insertRule('#nogo-setting-popup-frame { position:absolute; top:0; left:0; padding-left:10vw; }', sheet.cssRules.length);
        sheet.insertRule('#nogo-setting-popup { position: absolute; display:block; margin-left:0%; border:1px solid black; width:80vw; margin-top:5vh; padding:0;  background: white; opacity:1; z-index:12346; height:90vh; }', sheet.cssRules.length);
        sheet.insertRule('#nogo-setting-header-frame { background-color:#ACC9DE; margin:0; padding:0.2em; font-size:12pt; position:relative; }', sheet.cssRules.length);
        sheet.insertRule('#nogo-setting-close { float:right; text-decoration:none; color:black; cursor:pointer; }', sheet.cssRules.length);
        sheet.insertRule('#nogo-settings-form { padding:0.5em; }', sheet.cssRules.length);
        sheet.insertRule('#nogo-settings-form-data { height:calc(90vh - 80px); overflow-y: scroll; }', sheet.cssRules.length);
        sheet.insertRule('#nogo-setting-header { display:inline; color:black; font-style:italic; font-size:14pt; font-weight:bold; }', sheet.cssRules.length);
        sheet.insertRule('#nogo-settings-form-buttons { text-align:right; }  ', sheet.cssRules.length);
        sheet.insertRule('.nogo-label { width: 50%; overflow:hidden; display:inline-block; }', sheet.cssRules.length);
        sheet.insertRule('.nogo-input-text { width: calc(50% - 1em); }', sheet.cssRules.length);
        sheet.insertRule('hr.nogo { border: 1px dotted gray; }', sheet.cssRules.length);
      }
    }
  }

  var place4html = $('body');
  
  var html = '<div id="nogo-setting-frame">'
		+ '<!-- Overlay -->'
		+ '<div id="nogo-settings-overlay"></div>'
		+ '<!-- Popup -->'
		+ '<div id="nogo-setting-popup-frame">'
		+ '<div id="nogo-setting-popup">'
			+ '<div id="nogo-setting-header-frame">'
				+ '<a id="nogo-setting-close">[X]</a>'
				+ '<h2 id="nogo-setting-header">CRM BTE - Settings</h2>'
			+ '</div>'
			+ '<form id="nogo-settings-form">'
				+ '<div id="nogo-settings-form-data">'
	             + '<!-- Form -->';
    
    var footer = '</div><br>'
               + '<div id="nogo-settings-form-buttons">'
               + '<input type="button" id="nogo-setting-save" name="nogo-save" value="Save" ></input>&nbsp;'
			+ '<input type="button" id="nogo-setting-cancel" name="nogo-cancel" value="Cancel" ></input>'
			+ '</div></form></div></div></div>';

  html += '<h2>Links</h2>';
  html += nogosettings2html('nogo_activity_link_in_new_window', 'checked', 'Open activity link in a new window');
  html += nogosettings2html('nogo_incident_link_to_main_system', 'checked', 'Link incident to main incident system');

  html += '<h2>Highlighting</h2>';
  html += '<p>Define the patterns which are highlighted.</p>';
  for (var i = 0; i <= 9; i++) {
    var text;
    var storagename = 'nogo_editor_highlight_' + i;
    switch (i) {
      case 0:
        text = 'Beijing, P.R. China';
        break;
      case 1:
        text = 'BC-CST';
        break;
      case 2:
        text = 'Dalong';
        break;
      case 3:
        text = 'Dostert';
        break;
      case 4:
        text = 'Analysis needed';
        break;
      case 5:
        text = 'CN';
        break;
      default:
        text = ''
    }
    var pattern = 'Pattern ' + (i + 1);
    html += nogosettings2html(storagename, text, pattern)
  }

  html += footer;

  $(place4html).prepend(html);
  $('#nogo-setting-cancel').on('click', { what: 'cancel' }, nogo_cb_settings_do);
  $('#nogo-setting-save').on('click', { what: 'save' }, nogo_cb_settings_do);
  $('#nogo-setting-close').on('click', { what: 'close' }, nogo_cb_settings_do);
}

function nogosettings2html(key, defaultvalue, text) {
  var value = localStorage.getItem(key) || defaultvalue;
  var html = '<span class="nogo-label">' + text + '</span>\n';

  if ('checked' == defaultvalue || 'notchecked' == defaultvalue) {
    var checked = '';
    if (value == 'checked') {
      checked = ' checked="checked"';
    }
    html += '<input type="checkbox" name="' + key + '" value="' + key + '"' + checked + '></input>\n';
  } else {
    html += '<input type="text" class="nogo-input-text" name="' + key + '" value="' + value + '"></input>\n';
  }

  return html += '<br><hr class="nogo"><br>'
}

function nogo_cb_settings_do(event) {
  switch (event.data.what) {
    case 'save':
      nogo_cb_settings_save();
      break;
    case 'close':
    case 'cancel':
  }
  $('#nogo-setting-frame').remove()
}

function nogo_cb_settings_save() {
  var form = $('#nogo-settings-form');

  $('input[type=checkbox]', form).each(function () {
    var value = 'unchecked';
    if ($(this).prop('checked')) {
        value = 'checked';
    }
    localStorage.setItem($(this).attr('name'), value);
  });

  $('input[type=text]', form).each(function () {
    localStorage.setItem($(this).attr('name'), $(this).val())
  });

  alert('Data has been saved. Please refresh monitor.');
}

function performAddSettings(jNode) {
  var newhtml = jNode.text() + ' <a id=bte_settings href="javascript:void(0)">BTE Settings</a>';
  jNode.empty().html(newhtml);
  $('#bte_settings').on('click', bte_settings)
}
function setDefultQueries(jNode) {
  jNode.value = "[User] TEAM-1";
}

function setDefultQueries2(jNode) {
  jNode.empty().html("wangjian");
}

//
//
waitForKeyElements('table > tbody > tr > td > table > tbody > tr > td > span', performHighlighting);
waitForKeyElements('a[target="CRM7"]', performChangeActivityLink);
waitForKeyElements('a[target="CSS_BSP_CALLER"]', performChangeBCPLink);
waitForKeyElements('td[id$="title"]', performAddSettings);
waitForKeyElements('input[id="WD1A"]', setDefultQueries);
waitForKeyElements('input[id="WD1A"]', setDefultQueries);
waitForKeyElements('span[id="WD18-text"]', setDefultQueries2);




