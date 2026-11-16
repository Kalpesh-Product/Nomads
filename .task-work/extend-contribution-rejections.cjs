const fs = require('node:fs');
const root = 'C:/BIZNest/Master-Panel/WoNoMasterPanel';
const uiPath = root + '/client/src/pages/Dashboard/Contributions/Contributions.jsx';
let ui = fs.readFileSync(uiPath, 'utf8');
ui = ui.replace(/^    requiresRejectionReason: true,\r?\n/gm, '');
ui = ui.replace('status === "rejected" && activeConfig.requiresRejectionReason', 'status === "rejected"');
fs.writeFileSync(uiPath, ui);
const apiPath = root + '/server/controllers/websiteControllers/blogNewsControllers.js';
let api = fs.readFileSync(apiPath, 'utf8');
const start = api.indexOf('        const user = req.userData || {};', api.indexOf('const updateBlogContributionStatus'));
const end = api.indexOf('        const response = await axios.patch', start);
if (start < 0 || end < 0) throw new Error('Blog reviewer payload not found');
const payload = api.slice(start, end);
for (const folder of ['news', 'events', 'places']) {
  const needle = '        const response = await axios.patch(`${NOMADS_BASE_URL}/' + folder + '/contributions/${id}/status`, req.body, {';
  if (!api.includes(needle)) throw new Error('Status handler not found: ' + folder);
  api = api.replace(needle, payload + needle.replace('req.body, {', 'payload, {'));
}
fs.writeFileSync(apiPath, api);
