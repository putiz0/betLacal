const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ headless: true, args: ["--disable-blink-features=AutomationControlled"] });
  const ctx = await b.newContext({ userAgent: "Mozilla/5.0" });
  const p = await ctx.newPage();
  
  await p.goto("https://www.sofascore.com/football/tournament/world/world-championship/16", { waitUntil: "domcontentloaded", timeout: 10000 });
  await p.waitForTimeout(2000);
  
  var nameMapping = await p.evaluate(function() {
    var el = document.getElementById("__NEXT_DATA__");
    if (!el) return null;
    var parsed = JSON.parse(el.textContent);
    var stds = parsed.props?.pageProps?.standings;
    if (!stds) return null;
    
    var names = {};
    stds.forEach(function(group) {
      (group.rows || []).forEach(function(row) {
        if (row.team && row.team.name) {
          names[row.team.name] = {
            sofascoreId: row.team.id,
            slug: row.team.slug,
            country: row.team.country ? row.team.country.name : null
          };
        }
      });
    });
    return names;
  });
  
  console.log(JSON.stringify(nameMapping, null, 2));
  await b.close();
})();
