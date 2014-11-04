var fs = require('fs');
var cheerio = require('cheerio');
var expect = require('expect.js');
var scraper = require('../scraper');
var Feature = require('../feature');
var SECOND = 1000;

describe('scraper', function () {
  before(function () {
    var tableHTML = fs.readFileSync(__dirname + '/pages/table.html', 'utf8');
    this.$ = cheerio.load(tableHTML);

    this.expectedTechnologies = ['git', 'mercurial'];
    this.expectedFeatures = [{
      name: 'add files',
      examples: [
        { technology: 'git', snippets: 'git add' },
        { technology: 'mercurial', snippets: 'hg add' }
      ]
    }, {
      name: 'show revision information line by line',
      examples: [
        { technology: 'git', snippets: 'git blame' },
        { technology: 'mercurial', snippets: 'hg annotate' }
      ]
    }];
  });

  context('.scrapeTechnologies()', function () {
    it('scrapes all technology names from a table header row', function () {
      expect(scraper.scrapeTechnologies(this.$('tr').eq(0), this.$)).to.eql(this.expectedTechnologies);
    });
  });

  context('.scrapeFeature()', function () {
    it('scrapes a feature from a table row', function () {
      expect(scraper.scrapeFeature(this.$('tr').eq(1), this.$, this.expectedTechnologies)).to.eql(this.expectedFeatures[0]);
    });
  });

  context('.scrapeTable()', function () {
    context('with a table with no extra data', function () {
      it('scrapes all features from the table', function () {
        expect(scraper.scrapeTable(this.$('table'), this.$)).to.eql(this.expectedFeatures);
      });
    });

    context('with a table with extra data', function () {
      before(function () {
        var tableHTML = fs.readFileSync(__dirname + '/pages/table_extra.html', 'utf8');
        this.$ = cheerio.load(tableHTML);
      });

      it('scrapes all features from the table, ignoring extra data', function () {
        expect(scraper.scrapeTable(this.$('table'), this.$)).to.eql(this.expectedFeatures);
      });
    });
  });

  context('.requestPromise()', function () {
    context('after a successful request', function () {
      it('wraps request() and returns a Promise that will be resolved', function (done) {
        scraper.requestPromise('http://www.google.com/').then(function () {
          done();
        }, function () {
          done(new Error('The response should resolve'));
        });
      });
    });

    context('after a failed request', function () {
      it('wraps request() and returns a Promise that will be rejected', function (done) {
        scraper.requestPromise('http://www.google.com/404').then(function () {
          done(new Error('The response should not resolve'));
        }, function () {
          done();
        });
      });
    });
  });

  context('.scrape()', function () {
    it('scrapes features from the Hyperpolyglot website', function (done) {
      this.timeout(10 * SECOND);
      scraper.scrape().then(function (seeds) {
        seeds.forEach(function (seed, index, array) {
          (new Feature(seed)).validate(function (err) {
            if (err) {
              done(err);
            } else if (index === array.length - 1) {
              done();
            }
          });
        });
      });
    });
  });
});
