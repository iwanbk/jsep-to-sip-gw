var sip = require('sip'),
uuid = require('node-uuid'),
util = require('util'),
EventEmitter = require('events').EventEmitter,
sdpParser = require('./sdpParser.js');

var dialogs = {};

function rstring() {
	return Math.floor(Math.random() * 1e6).toString();
}


function SipHelper(opts) {
	this.options = opts || {};
	this.outboundproxy = this.options.outboundproxy || 'localhost:5060';
  this.domain = this.options.domain || 'example.com';
  this.localHost = this.options.localhost || '127.0.0.1:5060';
  this.org = this.options.org || 'ComcastLabs'; 
}

SipHelper.prototype.createInvite =  function(to, from, display, sdpPayload, name ){
  display = '"' + display + '"'; 
  var invite = {
		method: 'INVITE',
		uri: 'sip:' + to + '@'+  this.domain,
		headers: {
			to: {
				uri: 'sip:' + to +'@'+ this.domain
			},
			from: {
        name: display,
				uri: 'sip:' + from + '@'+ this.domain,
				params: {
					tag: rstring()
				}
			},
			'call-id': rstring(),
			cseq: {
				method: 'INVITE',
				seq: Math.floor(Math.random() * 1e5)
			},
			'Content-Type': 'application/sdp',
      route: [{
            name: undefined,
            uri: 'sip:' + this.outboundproxy +';lr'  }],
			contact: [{name: display,
				uri: 'sip:' + from + '@'+ this.localHost,
			}],
      'User-Agent': 'JSEP2SIPGW',
			'Organization': this.org
		},
   content: sdpPayload
  };
return invite;
}

SipHelper.prototype.createBye = function(session){ 
  var dialogInfo = session.id.split(':');
  var callid = dialogInfo[0];
  var fromTag = dialogInfo[1];
  var toTag = dialogInfo[2];
  var bye = {
		method: 'BYE',
		uri: 'sip:' + session.to + '@'+  this.domain,
		headers: {
			to: {
				uri: 'sip:' + session.to +'@'+ this.domain,
        params: {
          tag: toTag
        }
			},
			from: {
				uri: 'sip:' + session.from + '@'+ this.domain,
				params: {
					tag: fromTag 
				}
			},
			'call-id': callid,
			cseq: {
				method: 'BYE',
				seq: session.cseq++
			},
      route: [{
            name: undefined,
            uri: 'sip:' + this.outboundproxy + ';lr'}],
			contact: [{
				uri: 'sip:' + session.from + '@'+ this.localHost,
			}],
      'User-Agent': 'JSEP2SIPGW',
			'Organization': this.org
		}
  };

return bye;

}


module.exports = SipHelper;

