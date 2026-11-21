/* App bootstrap: open the local database, wire error monitoring, language and routing.
   The game starts right away with the player on this device - there are no accounts. */
(function (MA) {
  'use strict';
  var db = MA.db, Rt = MA.router;
  /* storage of the removed demo mode and account sessions; freed so the game keeps the browser quota */
  var OLD_KEYS = ['mathoria:mode', 'mathoria:demo:v1', 'mathoria:session:demo', 'mathoria:session:real', 'mathoria:recent:demo', 'mathoria:recent:real'];

  MA.app = {
    boot: function () {
      try { OLD_KEYS.forEach(function (k) { localStorage.removeItem(k); }); } catch (e) { /* storage blocked */ }
      db.open();
      MA.svc.migratePlayers();
      MA.errors.sink = function (rec) { try { db.insert('errors', rec); } catch (e) { /* ignore */ } };
      MA.errors.queue.splice(0).forEach(MA.errors.sink);
      window.addEventListener('error', function (e) { MA.errors.capture(e.error || e.message, 'window'); });
      window.addEventListener('unhandledrejection', function (e) { MA.errors.capture(e.reason, 'promise'); });
      var lang = null; try { lang = localStorage.getItem('mathoria:lang'); } catch (e) { /* storage blocked */ }
      MA.i18n.setLang(lang || ((navigator.language || '').toLowerCase().indexOf('he') === 0 ? 'he' : 'en'), true);
      MA.bus.on('lang', function () { Rt.render(); });
      window.addEventListener('hashchange', function () { MA.speech.stop(); Rt.render(); });
      window.addEventListener('pagehide', function () { db.saveNow(); });
      document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') db.saveNow(); });
      window.addEventListener('storage', function (e) { if (e.key === db.KEY) { db.open(); Rt.render(); } });
      Rt.render();
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', MA.app.boot); else MA.app.boot();
})(window.MA = window.MA || {});
