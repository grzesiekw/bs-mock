'use strict';

var bsMock = require('../index.js');

describe("BSMock", function() {
    var mock = bsMock.init({dir: 'test/mocks'});

    var getDataRequest = {"method": "GET", "url": "/data"};
    var getJsonDataRequest = {"method": "GET", "url": "/jsonData", "headers": {"Accept": "application/json"}};
    var postDataRequest = {"method": "POST", "url": "/data"};

    it("should support 'GET /data' request", function() {
        var supports = mock.supports(getDataRequest);

        expect(supports).toBe(true);
    });

    it("should support 'GET with header' request", function () {
        var supports = mock.supports(getJsonDataRequest);

        expect(supports).toBe(true);
    });

    it("should not support 'POST /data' request", function () {
        var supports = mock.supports(postDataRequest);

        expect(supports).toBe(false);
    });

    it("should fill in statusCode", function () {
        var response = responseSpy();

        mock.process(getDataRequest, response);

        expect(response.statusCode).toBe(200);
    });

    it("should fill in headers", function () {
        var response = responseSpy();

        mock.process(getDataRequest, response);

        expect(response.headers).toEqual([{"Content-Type": "application/json"}]);
    });

    it("should fill in data", function () {
        var response = responseSpy();

        mock.process(getDataRequest, response);

        expect(response.data).toBe(JSON.stringify({"a": 1}))
    });
});

var responseSpy = function () {
    return {
        statusCode: null,
        headers: [],
        data: null,

        setHeader: function (headerName, headerValue) {
            var header = {};
            header[headerName] = headerValue;
            this.headers.push(header);
        },
        end: function (data) {
            this.data = data;
        }
    };
};
