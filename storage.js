var fs = require('fs')

var self = module.exports = {
  KEYSTORE: './keystore.json',
  data: { nicks: {}, slugs: {} },
  loadFromDisk: function () {
    try {
      self.data = JSON.parse(fs.readFileSync(self.KEYSTORE, 'utf-8'))
    } catch (e) {
      if (e.code === 'ENOENT') { // 404
        self.saveToDisk()
        self.loadFromDisk()
      }
    }
  },
  saveToDisk: function () {
    fs.writeFileSync(self.KEYSTORE, JSON.stringify(self.data, null, '    '))
  }
}
self.loadFromDisk()
