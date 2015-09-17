'use strict';

var fs = require("fs");

module.exports.init = function (opts) {
    return new BSMock(opts);
};

var BSMock = function (opts) {
    var mock = this;

    opts = opts || {dir: 'mocks'};

    var files = [];

    if (opts.dir) {
        files = fs.readdirSync(opts.dir).map(function (file) {
            return opts.dir + "/" + file;
        });
    } else {
        files = opts.files;
    }

    mock.mocks = flatten(files.map(function (file) {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }));
};

BSMock.prototype.process = function (request, response) {
    var mock = this;

    var mockResponse = findResponse(mock.mocks, request);

    if (mockResponse) {
        prepareResponse(mockResponse, response);
        return true;
    } else {
        return false;
    }
};

BSMock.prototype.supports = function (request) {
    var mock = this;

    return findResponse(mock.mocks, request) != undefined;
};

function findResponse(mocks, request) {
    if (mocks) {
        for (var i = 0; i < mocks.length; i++) {
            if (match(mocks[i].request, request)) {
                return mocks[i].response;
            }
        }
    }

    return null;
}

var defaultStatusCode = 200;

function match(mockRequest, request) {
    for (var p in mockRequest) {
        if (mockRequest.hasOwnProperty(p)) {
            var mockProperty = mockRequest[p];
            var requestProperty = request[p];

            if (typeof mockProperty == 'object') {
                if (!match(mockProperty, requestProperty)) {
                    return false;
                }
            } else if (notMatch(p, mockProperty, requestProperty)) {
                return false;
            }
        }
    }

    return true;
}

function notMatch(propertyName, mockValue, requestValue) {
  if (propertyName == 'url') {
    return new RegExp(mockValue).exec(requestValue) == null;
  } else {
    return mockValue != requestValue;
  }
}

function prepareResponse(mockResponse, response) {
    response.statusCode = mockResponse.statusCode | defaultStatusCode;

    setHeaders(mockResponse, response);
    setData(mockResponse, response);
}

function setHeaders(mockResponse, response) {
    var headers = mockResponse['headers'];
    if (headers) {
        for (var i = 0; i < headers.length; i++) {
            var header = headers[i];
            for (var p in header) {
                if (header.hasOwnProperty(p)) {
                    response.setHeader(p, header[p]);
                }
            }
        }
    }
}

function setData(mockResponse, response) {
    var data = mockResponse['data'];
    if (data) {
        response.end(JSON.stringify(data));
    } else {
        response.end();
    }
}

// util

function flatten(array) {
    return [].concat.apply([], array);
}
