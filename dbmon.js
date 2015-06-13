
var runner;
var register;

function start() {
  runner = new Runner(100);
  document.querySelector('#toggle').addEventListener('click', function () {
    runner.toggle();
  });
  document.querySelector('#start').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var url = ev.target.elements.url.value;
    startAdapter(url);
  });
  document.querySelector('#adapters').addEventListener('click', function (ev) {
    ev.preventDefault();
    var url = ev.target.href;
    if (url) {
      startAdapter(url);
    }
  });
}

function startAdapter(url) {
  var script = document.createElement('script');
  register = function (adapter) {
    script.parentElement.removeChild(script);
    runner.startWith(adapter);
  };
  script.src = url;
  document.body.appendChild(script);
}

function register(adapter) {
  runner.startWith(adapter);
}

function Runner(num) {
  this.num = num;
  this.perf = new Perf(30, document.querySelector('#frametime'));
  this.runnerEl = document.querySelector('#renderedby');
  this.appEl = document.querySelector('#app');
  this.adapter = null;
  this.running = false;
  this.tick = this.tick.bind(this);
}

Runner.prototype.startWith = function (adapter) {
  if (this.adapter) {
    this.adapter.cleanup(this.appEl);
    this.perf.clear();
  }
  this.adapter = adapter;
  adapter.init(generateData(this.num), this.appEl);
  this.runnerEl.firstChild.data = adapter.name + ' ' + adapter.version;
  this.running = true;
  requestAnimationFrame(this.tick);
};

Runner.prototype.tick = function () {
  if (!this.running) { return; }

  var start = performance.now();
  this.adapter.render(generateData(this.num));
  this.perf.push(performance.now() - start);

  requestAnimationFrame(this.tick);
};

Runner.prototype.toggle = function () {
  if (!this.adapter) { return; }
  this.running = !this.running;
  requestAnimationFrame(this.tick);
};

function Perf(samples, elem) {
  this.num = samples;
  this.samples = [];
  this.elem = elem;
}

Perf.prototype.push = function (time) {
  if (this.samples.length === this.num) {
    this.samples.shift();
  }
  this.samples.push(time);
  this.render();
};

Perf.prototype.clear = function () {
  this.samples = [];
  this.render();
};

Perf.prototype.render = function () {
  var avg = this.samples.reduce(function (acc, n) { return acc + n; }, 0);
  if (this.samples.length) {
    avg = avg / this.samples.length;
  }
  this.elem.firstChild.data = avg.toFixed(1);
};


/// data generation below

function getTopFiveQueries(db) {
  var arr = db.samples[db.samples.length - 1].queries.slice(0, 5);
  while (arr.length < 5) {
    arr.push({ query: '', elapsed: 0 });
  }
  return arr;
}

function generateData(rows) {
  // generate some dummy data

  var data = {
    start_at: new Date().getTime() / 1000,
    databases: {}
  };

  for (var i = 1; i <= rows; i++) {
    data.databases["cluster" + i] = {
      queries: []
    };

    data.databases["cluster" + i + "slave"] = {
      queries: []
    };
  }

  var data2 = [];

  Object.keys(data.databases).forEach(function(dbname) {
    var info = data.databases[dbname];


    var r = Math.floor((Math.random() * 10) + 1);
    for (var i = 0; i < r; i++) {
      var q = {
        canvas_action: null,
        canvas_context_id: null,
        canvas_controller: null,
        canvas_hostname: null,
        canvas_job_tag: null,
        canvas_pid: null,
        elapsed: Math.random() * 15,
        query: "SELECT blah FROM something",
        waiting: Math.random() < 0.5
      };

      if (Math.random() < 0.2) {
        q.query = "<IDLE> in transaction";
      }

      if (Math.random() < 0.1) {
        q.query = "vacuum";
      }

      info.queries.push(q);
    }

    info.queries = info.queries.sort(function(a, b) {
      return b.elapsed - a.elapsed;
    });

    var samples = [];


  samples.push({
    time: data.start_at,
    queries: info.queries
  });

  if (samples.length > 5) {
    samples.splice(0, samples.length - 5);
  }

  var db = {
      name: dbname,
      queries: info.queries,
      samples: samples,
    }

    db.topFiveQueries = getTopFiveQueries(db);

    data2.push(db);
  });



  return data2;
}

var Helpers = {
  countClassName: function (count) {
    var className = 'label';
    if (count >= 20) {
      className += ' label-important';
    }
    else if (count >= 10) {
      className += ' label-warning';
    }
    else {
      className += ' label-success';
    }
    return className;
  },
  sampleLength: function (db) {
    return db.samples[db.samples.length - 1].queries.length;
  },
  elapsedClassName: function (elapsed) {
    var className = 'Query elapsed';
    if (elapsed >= 10.0) {
      className += ' warn_long';
    }
    else if (elapsed >= 1.0) {
      className += ' warn';
    }
    else {
      className += ' short';
    }
    return className;
  },
  formatElapsed: function (value) {
    if (!value) return '';
    var str = parseFloat(value).toFixed(2);
    if (value > 60) {
      var minutes = Math.floor(value / 60);
      var comps = (value % 60).toFixed(2).split('.');
      var seconds = comps[0].lpad('0', 2);
      var ms = comps[1];
      str = minutes + ":" + seconds + "." + ms;
    }
    return str;
  }
};
