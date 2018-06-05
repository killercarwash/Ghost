const common = require('../../../server/lib/common');
const nock = require('nock');
const OembedAPI = require('../../../server/api/oembed');
const should = require('should');

describe('Oembed API', function () {
    it('can fetch embed from supported provider', function (done) {
        let requestMock = nock('https://www.youtube.com')
            .get('/oembed')
            .query(true)
            .reply(200, {
                html: '<iframe width="480" height="270" src="https://www.youtube.com/embed/E5yFcdPAGv0?feature=oembed" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>',
                thumbnail_width: 480,
                width: 480,
                author_url: 'https://www.youtube.com/user/gorillaz',
                height: 270,
                thumbnail_height: 360,
                provider_name: 'YouTube',
                title: 'Gorillaz - Humility (Official Video)',
                provider_url: 'https://www.youtube.com/',
                author_name: 'Gorillaz',
                version: '1.0',
                thumbnail_url: 'https://i.ytimg.com/vi/E5yFcdPAGv0/hqdefault.jpg',
                type: 'video'
            });

        OembedAPI.read({url: 'https://www.youtube.com/watch?v=E5yFcdPAGv0'})
            .then((results) => {
                should.exist(results);
                should.exist(results.html);
                done();
            }).catch(done);
    });

    it('returns error for missing url', function (done) {
        OembedAPI.read({url: ''})
            .then(() => {
                done(new Error('Fetch oembed without url should error'));
            }).catch((err) => {
                (err instanceof common.errors.BadRequestError).should.eql(true);
                done();
            });
    });

    it('returns error for unsupported provider', function (done) {
        OembedAPI.read({url: 'http://example.com/unknown'})
            .then(() => {
                done(new Error('Fetch oembed with unknown url provider should error'));
            }).catch((err) => {
                (err instanceof common.errors.ValidationError).should.eql(true);
                done();
            });
    });

    it('returns error for fetch failure', function (done) {
        let requestMock = nock('https://www.youtube.com')
            .get('/oembed')
            .query(true)
            .reply(500);

        OembedAPI.read({url: 'https://www.youtube.com/watch?v=E5yFcdPAGv0'})
            .then(() => {
                done(new Error('Fetch oembed with external failure should error'));
            }).catch((err) => {
                (err instanceof common.errors.InternalServerError).should.eql(true);
                done();
            });
    });
});
