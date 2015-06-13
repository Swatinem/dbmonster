(function () {
  register({
    init: init,
    cleanup: cleanup,
    render: render,
    name: 'pure DOM',
    version: '1.0',
  });

  var elem, table, template;
  function init(data, _elem) {
    var q = '<td class="{{q.elapsed|elapsedClassName}}">{{q.elapsed | formatElapsed }}' +
      '<div class="popover left"><div class="popover-content">{{q.query}}</div>' +
      '<div class="arrow"></div></div></td>';
    var row = '<tr><td class="dbname">{{db.name}}</td>' +
        '<td class="query-count"><span class="{{db | sampleLength | countClassName}}">{{db | sampleLength}}</span></td>' +
        [q, q, q, q, q].join('') + '</tr>';
    var t = '<table class="table table-striped latest-data"><tbody>' +
      '</tbody></table>'
    var doc = document.implementation.createHTMLDocument();
    doc.body.innerHTML = t;
    table = doc.body.firstChild.firstChild;
    table.innerHTML = row;
    template = table.firstChild;
    table.removeChild(template);
    elem = _elem;
    elem.innerHTML = t;
    table = elem.firstChild.firstChild;
    render(data);
  }

  function cleanup() {
    elem.innerHTML = '';
  }

  function render(data) {
    var datalen = data.length;
    var elems = table.childNodes.length;
    var commonlen = Math.min(datalen, elems);
    // fill the data
    for (var i = 0, len = commonlen; i < len; i++) {
      fill(table.childNodes[i], data[i]);
    }
    // clone new nodes
    for (var i = commonlen, len = datalen; i < len; i++) {
      fill(template, data[i]);
      table.appendChild(document.importNode(template, true));
    }
    // remove not needed nodes
    for (var i = commonlen, len = elems; i < len; i++) {
      table.removeChild(table.lastChild);
    }
  }
  function fill(row, data) {
    row.firstChild.textContent = data.name;
    var sampleLength = Helpers.sampleLength(data);
    row.childNodes[1].firstChild.className = Helpers.countClassName(sampleLength);
    row.childNodes[1].firstChild.textContent = sampleLength;
    for (var i = 0; i < 5; i++) {
      var q = data.topFiveQueries[i];
      var el = row.childNodes[i + 2];
      el.className = Helpers.elapsedClassName(q.elapsed);
      el.firstChild.data = Helpers.formatElapsed(q.elapsed);
      el.childNodes[1].firstChild.textContent = q.query;
    }
  }
})();
