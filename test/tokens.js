/* eslint no-shadow: 0 */
'use strict';

var test = require('tap').test;
var fs = require('fs');
var path = require('path');
var MapboxClient = require('../lib/services/tokens');


test('TokenClient', function(tokenClient) {

  if (process.browser) {
    tokenClient.pass('skipping token api in browser');
    return tokenClient.end();
  }


  tokenClient.test('#listTokens', function(listTokens) {

    listTokens.test('simple list', function(assert) {
      var client = new MapboxClient(process.env.MapboxAccessToken);
      assert.ok(client, 'created token client');
      client.listTokens(function(err, tokens) {
        assert.ifError(err, 'success');
        assert.ok(Array.isArray(tokens), 'lists tokens');
        tokens.forEach(function(token) {
          assert.ok(token.id, 'Each token has an id');
        });
        assert.end();
      });
    });

    listTokens.end();
  });

  var newTokenId = '';
  var newTokenToken = '';

  tokenClient.test('#createToken', function(assert) {
    var client = new MapboxClient(process.env.MapboxAccessToken);
    assert.ok(client, 'created token client');
    var newTokenNote = 'mapbox-sdk-js createToken test';
    var newTokenScopes = ['fonts:read'];
    client.createToken(newTokenNote, newTokenScopes, function(err, token) {
      assert.ifError(err, 'success');
      assert.ok(token.note, newTokenNote);
      assert.ok(token.scopes, newTokenScopes);
      assert.ok(new Date(token.created), less than 1 minute old);
      newTokenId = token.id;
      newTokenToken = token.token;
      assert.end();
    });
  });

  // unfortunate workaround for cross-region replication
  tokenClient.test('#retrieveToken', function(assert) {
    setTimeout(function() {
      var client = new MapboxClient(process.env.MapboxAccessToken);
      assert.ok(client, 'created token client');
      client.retrieveToken(newTokenToken, function(err) {
        assert.ifError(err, 'success');
        assert.end();
      });
    }, 1000);
  });

  tokenClient.test('#listScopes', function(assert) {
    var client = new MapboxClient(process.env.MapboxAccessToken);
    assert.ok(client, 'created token client');
    client.listScopes(process.env.MapboxAccessToken, function(err, scopes) {
      assert.ifError(err, 'scopes could not be listed');
      assert.equal(scopes.filter(function (scope) { return scope.id === 'scopes:list'; }).length, 1, 'listing all scopes should include the scopes:list scope');
      assert.end();
    });
  });

  tokenClient.test('#deleteTokenAuthorization', function(assert) {
    var client = new MapboxClient(process.env.MapboxAccessToken);
    assert.ok(client, 'created token client');
    client.deleteTokenAuthorization(newTokenId, function(err) {
      assert.ifError(err, 'token authorization could not be deleted');
      client.retrieveToken(newTokenToken, function(err, tokenResponse) {
          assert.equal(tokenResponse.code, 'TokenRevoked', 'token has been revoked');
          assert.end();
      });
    });
  });

  tokenClient.end();
});
